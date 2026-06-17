import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const contractAddress = "0x2704227C9B7170Cd9CedD3aE506A8881d1e39769";

  const contract = await ethers.getContractAt(
    "AgentMarketplace",
    contractAddress,
  );

  const [signer] = await ethers.getSigners();

  console.log("Backend Wallet:", signer.address);

  const tx = await contract.setAuthorizedBackend(signer.address);

  console.log("Transaction:", tx.hash);

  await tx.wait();

  console.log("Backend Authorized");
}

main().catch(console.error);
