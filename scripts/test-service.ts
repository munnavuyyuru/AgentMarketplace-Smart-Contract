import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const contractAddress = "0x2704227C9B7170Cd9CedD3aE506A8881d1e39769";

  const contract = await ethers.getContractAt(
    "AgentMarketplace",
    contractAddress,
  );

  console.log("Creating service...");

  const tx = await contract.createService(
    "Smart Contract Audit",
    "ipfs://audit-service",
    ethers.parseEther("0.001"),
  );

  await tx.wait();

  console.log("Service created");
}

main().catch(console.error);
