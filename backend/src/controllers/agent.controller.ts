import { supabase } from "../config/supabase.js";
import { contract } from "../blockchain/contract.js";

/**
 * Get all agents ordered by reputation score (descending).
 */
export async function getAgents(req: any, res: any) {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("reputation_score", { ascending: false });

  if (error) {
    return res.status(500).json(error);
  }

  return res.json(data);
}

/**
 * Register a new agent (after the user has submitted a transaction to submit a transaction to the contract).
 * This endpoint validates the request and checks if the agent is already registered on-chain.
 */
export async function createAgent(req: any, res: any) {
  const { wallet_address, name, metadataURI } = req.body;

  if (!wallet_address || !name || !metadataURI) {
    return res
      .status(400)
      .json({
        error: "Missing required fields: wallet_address, name, metadataURI",
      });
  }

  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(wallet_address)) {
    return res.status(400).json({ error: "Invalid Ethereum address format" });
  }

  try {
    const agentData = await contract.agents(wallet_address);
    if (agentData.registered) {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("wallet_address", wallet_address)
        .single();

      if (error) {
        return res.json({
          wallet_address: agentData.wallet,
          name: agentData.name,
          metadataURI: agentData.metadataURI,
          reputation_score: Number(agentData.reputationScore),
          total_ratings: Number(agentData.totalRatings),
          rating_sum: Number(agentData.ratingSum),
          registered: agentData.registered,
        });
      }

      return res.json(data);
    } else {
      return res.status(402).json({
        error:
          "Agent not yet registered on-chain. Please submit a transaction to the contract's registerAgent function.",
        suggestedTransaction: {
          to: process.env.CONTRACT_ADDRESS,
          data: contract.interface.encodeFunctionData("registerAgent", [
            name,
            metadataURI,
          ]),
        },
      });
    }
  } catch (error) {
    console.error("Error checking agent status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
