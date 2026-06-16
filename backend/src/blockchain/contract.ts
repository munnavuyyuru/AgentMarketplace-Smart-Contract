import { ethers } from "ethers";

import abiFile from "./AgentMarketplace.json" with { type: "json" };

import { env } from "../config/env.js";

const provider =
  new ethers.JsonRpcProvider(
    env.FUJI_RPC_URL
  );

const wallet =
  new ethers.Wallet(
    env.PRIVATE_KEY,
    provider
  );

export const contract =
  new ethers.Contract(
    env.CONTRACT_ADDRESS,
    abiFile.abi,
    wallet
  );