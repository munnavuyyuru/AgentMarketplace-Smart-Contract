import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const factory = await ethers.getContractFactory("AgentMarketplace");

  const contract = await factory.deploy();

  await contract.waitForDeployment();

  console.log("AgentMarketplace deployed:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
