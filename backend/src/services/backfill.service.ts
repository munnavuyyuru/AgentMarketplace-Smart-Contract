import { contract } from "../blockchain/contract.js";
import { supabase } from "../config/supabase.js";

export async function backfillAgents() {
  console.log("Backfilling agents...");

  const addresses = await contract.getAgents();

  for (const address of addresses) {
    const agent = await contract.agents(address);

    await supabase.from("agents").upsert({
      wallet_address: address,

      name: agent.name,

      metadata_uri: agent.metadataURI,

      reputation_score: Number(agent.reputationScore),

      total_ratings: Number(agent.totalRatings),
    });
  }

  console.log("Backfill complete");
}
