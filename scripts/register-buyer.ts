import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.FUJI_RPC_URL);

  const buyerWallet = new ethers.Wallet(
    process.env.BUYER_PRIVATE_KEY!,
    provider,
  );

  const abi = (
    await import(
      "../artifacts/contracts/AgentMarketplace.sol/AgentMarketplace.json",
      {
        with: {
          type: "json",
        },
      }
    )
  ).default.abi;

  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS!,
    abi,
    buyerWallet,
  );

  console.log("Buyer Wallet:", buyerWallet.address);

  const tx = await contract.registerAgent("Buyer Agent", "ipfs://buyer-agent");

  console.log("TX:", tx.hash);

  await tx.wait();

  console.log("Buyer Registered");
}

main().catch(console.error);
