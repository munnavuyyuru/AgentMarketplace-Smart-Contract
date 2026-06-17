import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const contractAddress = "0x2704227C9B7170Cd9CedD3aE506A8881d1e39769";

  const contract = await ethers.getContractAt(
    "AgentMarketplace",
    contractAddress,
  );

  console.log("Registering agent...");

  const tx = await contract.registerAgent(
    "Bhargav AI Agent",
    "ipfs://agent-metadata",
  );

  await tx.wait();

  console.log("Agent registered");
}

main().catch(console.error);
