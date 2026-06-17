import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const contract = await ethers.getContractAt(
    "AgentMarketplace",
    "0x2704227C9B7170Cd9CedD3aE506A8881d1e39769",
  );

  const backend = await contract.authorizedBackend();

  console.log("Authorized Backend:", backend);
}

main().catch(console.error);
