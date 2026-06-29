import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

export default function RegisterAgentPage() {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [metadataURI, setMetadataURI] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load wallet on mount
  useEffect(() => {
    async function initWallet() {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setWalletAddress(address);
        } catch (err) {
          console.error("Failed to connect wallet", err);
          setError("Wallet connection failed. Please ensure MetaMask is installed and unlocked.");
        }
      } else {
        setError("MetaMask not detected. Please install MetaMask to use this feature.");
      }
    }
    initWallet();
  }, []);

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const abi = [
    {
      "inputs": [
        { "internalType": "string", "name": "name", "type": "string" },
        { "internalType": "string", "name": "metadataURI", "type": "string" }
      ],
      "name": "registerAgent",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "name": "agents",
      "outputs": [
        { "internalType": "bool", "name": "registered", "type": "bool" },
        { "internalType": "bytes", "name": "name", "type": "bytes" },
        { "internalType": "bytes", "name": "metadataURI", "type": "bytes" },
        { "internalType": "uint96", "name": "reputationScore", "type": "uint96" },
        { "internalType": "uint96", "name": "totalRatings", "type": "uint96" }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      setError("Wallet not connected.");
      return;
    }
    if (!contractAddress) {
      setError("Contract address not configured. Please set VITE_CONTRACT_ADDRESS in your .env file.");
      return;
    }
    if (!name.trim() || !metadataURI.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!(window as any).ethereum) throw new Error("No ethers provider");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.registerAgent(name, metadataURI);
      setLoading(false);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setSuccess(`Agent registered! Tx hash: ${tx.hash}`);
        // Optionally redirect to agent profile after a short delay
        setTimeout(() => {
          navigate(`/agent/${walletAddress}`);
        }, 2000);
      } else {
        setError("Transaction failed.");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message ?? "Unknown error");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="
        border-4 border-black
        bg-[#ff6b35]
        p-8
        text-white
        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
        mb-8
      ">
        <div className="mb-2 text-sm uppercase tracking-widest">
          Register Your AI Agent
        </div>
        <h1 className="text-4xl font-black">Become a Provider</h1>
        <p className="mt-2 max-w-xl text-lg">
          Register your agent on the blockchain so users can discover and purchase your services.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          {success}
        </div>
      )}

      <div className="max-w-md mx-auto space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Wallet Address (read‑only)
            </label>
            <input
              type="text"
              value={walletAddress ?? "Connecting..."}
              readOnly
              className="
                w-full
                border-2 border-black
                bg-white
                p-3
                font-mono
                focus:outline-none
                focus:ring-2
                focus:ring-black
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Agent Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My AI Agent"
              className="
                w-full
                border-2 border-black
                bg-white
                p-3
                font-mono
                focus:outline-none
                focus:ring-2
                focus:ring-black
              "
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Metadata URI (IPFS URL or JSON metadata) *
            </label>
            <input
              type="text"
              value={metadataURI}
              onChange={(e) => setMetadataURI(e.target.value)}
              placeholder="e.g., ipfs://Qm... or https://example.com/metadata.json"
              className="
                w-full
                border-2 border-black
                bg-white
                p-3
                font-mono
                focus:outline-none
                focus:ring-2
                focus:ring-black
              "
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              border-2 border-black
              bg-black
              px-5 py-3
              font-bold
              text-white
              disabled:opacity-50
              disabled:cursor-not-allowed
              hover:bg-gray-800
              transition-all
            "
          >
            {loading ? "Registering..." : "Register Agent"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Make sure your wallet is connected and has enough AVAX for gas fees.
        </p>
      </div>
    </div>
  );
}