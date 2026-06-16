// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract AgentMarketplace {

    struct Agent {
        address wallet;
        string name;
        string metadataURI;
        uint256 reputationScore; // average rating * 100
        uint256 totalRatings;
        uint256 ratingSum;
        bool registered;
    }

    struct Service {
        uint256 id;
        address provider;
        string title;
        string descriptionURI;
        uint256 priceWei;
        bool active;
    }

    struct PaymentRecord {
        uint256 id;
        uint256 serviceId;
        address buyer;
        address provider;
        uint256 amount;
        uint256 timestamp;
    }

    struct Rating {
        address reviewer;
        uint256 serviceId;
        uint8 score;
    }

    address public owner;
    address public authorizedBackend;

    uint256 public serviceCounter;
    uint256 public paymentCounter;

    mapping(address => Agent) public agents;
    mapping(uint256 => Service) public services;
    mapping(uint256 => PaymentRecord) public payments;
    mapping(uint256 => Rating[]) public serviceRatings;

    address[] public registeredAgents;

    // buyer => service => paid?
    mapping(address => mapping(uint256 => bool))
        public hasPurchasedService;

    // buyer => service => rated?
    mapping(address => mapping(uint256 => bool))
        public hasRatedService;

    event AgentRegistered(
        address indexed agent,
        string name,
        string metadataURI
    );

    event ServiceCreated(
        uint256 indexed serviceId,
        address indexed provider,
        uint256 priceWei
    );

    event PaymentRecorded(
        uint256 indexed paymentId,
        uint256 indexed serviceId,
        address indexed buyer,
        uint256 amount
    );

    event RatingSubmitted(
        uint256 indexed serviceId,
        address indexed reviewer,
        uint8 score
    );

    event AuthorizedBackendUpdated(
        address indexed backend
    );

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only owner"
        );
        _;
    }

    modifier onlyAuthorizedBackend() {
        require(
            msg.sender == authorizedBackend,
            "Only backend"
        );
        _;
    }

    modifier onlyRegisteredAgent() {
        require(
            agents[msg.sender].registered,
            "Agent not registered"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setAuthorizedBackend(
        address backend
    ) external onlyOwner {

        require(
            backend != address(0),
            "Invalid backend"
        );

        authorizedBackend = backend;

        emit AuthorizedBackendUpdated(
            backend
        );
    }

    function registerAgent(
        string calldata name,
        string calldata metadataURI
    ) external {

        require(
            !agents[msg.sender].registered,
            "Already registered"
        );

        agents[msg.sender] = Agent({
            wallet: msg.sender,
            name: name,
            metadataURI: metadataURI,
            reputationScore: 0,
            totalRatings: 0,
            ratingSum: 0,
            registered: true
        });

        registeredAgents.push(msg.sender);

        emit AgentRegistered(
            msg.sender,
            name,
            metadataURI
        );
    }

    function createService(
        string calldata title,
        string calldata descriptionURI,
        uint256 priceWei
    )
        external
        onlyRegisteredAgent
    {
        require(
            priceWei > 0,
            "Invalid price"
        );

        serviceCounter++;

        services[serviceCounter] = Service({
            id: serviceCounter,
            provider: msg.sender,
            title: title,
            descriptionURI: descriptionURI,
            priceWei: priceWei,
            active: true
        });

        emit ServiceCreated(
            serviceCounter,
            msg.sender,
            priceWei
        );
    }

    function recordPayment(
        uint256 serviceId,
        address buyer,
        uint256 amount
    )
        external
        onlyAuthorizedBackend
    {
        Service memory service =
            services[serviceId];

        require(
            service.provider != address(0),
            "Invalid service"
        );

        require(
            amount > 0,
            "Invalid amount"
        );

        paymentCounter++;

        payments[paymentCounter] =
            PaymentRecord({
                id: paymentCounter,
                serviceId: serviceId,
                buyer: buyer,
                provider: service.provider,
                amount: amount,
                timestamp: block.timestamp
            });

        hasPurchasedService[
            buyer
        ][serviceId] = true;

        emit PaymentRecorded(
            paymentCounter,
            serviceId,
            buyer,
            amount
        );
    }

    function submitRating(
        uint256 serviceId,
        uint8 score
    ) external {

        require(
            score >= 1 && score <= 5,
            "Score must be 1-5"
        );

        require(
            hasPurchasedService[
                msg.sender
            ][serviceId],
            "Service not purchased"
        );

        require(
            !hasRatedService[
                msg.sender
            ][serviceId],
            "Already rated"
        );

        Service memory service =
            services[serviceId];

        require(
            service.provider != address(0),
            "Invalid service"
        );

        hasRatedService[
            msg.sender
        ][serviceId] = true;

        serviceRatings[serviceId].push(
            Rating({
                reviewer: msg.sender,
                serviceId: serviceId,
                score: score
            })
        );

        Agent storage provider =
            agents[service.provider];

        provider.totalRatings += 1;
        provider.ratingSum += score;

        // Average rating * 100
        // Example:
        // 4.75 => 475
        provider.reputationScore =
            (provider.ratingSum * 100) /
            provider.totalRatings;

        emit RatingSubmitted(
            serviceId,
            msg.sender,
            score
        );
    }

    function getAgents()
        external
        view
        returns (
            address[] memory
        )
    {
        return registeredAgents;
    }

    function getAgentRating(
        address agent
    )
        external
        view
        returns (
            uint256 reputationScore,
            uint256 totalRatings
        )
    {
        Agent memory a =
            agents[agent];

        return (
            a.reputationScore,
            a.totalRatings
        );
    }
}