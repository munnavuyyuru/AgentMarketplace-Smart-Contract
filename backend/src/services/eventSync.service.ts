import { contract } from "../blockchain/contract.js";
import { supabase } from "../config/supabase.js";

let lastCheckedBlock = 0;

export async function startEventSync() {
  console.log("Starting polling sync...");

  lastCheckedBlock = (await contract.runner?.provider?.getBlockNumber()) ?? 0;

  setInterval(async () => {
    try {
      const provider = contract.runner?.provider;

      if (!provider) return;

      const currentBlock = await provider.getBlockNumber();

      if (currentBlock <= lastCheckedBlock) {
        return;
      }

      const agentEvents = await contract.queryFilter(
        contract.filters.AgentRegistered(),
        lastCheckedBlock + 1,
        currentBlock,
      );

      for (const event of agentEvents) {
        const args = (event as any).args;

        await supabase.from("agents").upsert({
          wallet_address: args.agent,
          name: args.name,
          metadata_uri: args.metadataURI,
          reputation_score: 0,
          total_ratings: 0,
        });
      }

      const serviceEvents = await contract.queryFilter(
        contract.filters.ServiceCreated(),
        lastCheckedBlock + 1,
        currentBlock,
      );

      for (const event of serviceEvents) {
        const args = (event as any).args;

        const service = await contract.services(args.serviceId);

        await supabase.from("services").upsert({
          service_id: Number(args.serviceId),
          provider_address: args.provider,
          title: service.title,
          description_uri: service.descriptionURI,
          price_wei: service.priceWei.toString(),
          active: service.active,
        });
      }

      lastCheckedBlock = currentBlock;
    } catch (err) {
      console.error("Polling Sync Error:", err);
    }
  }, 10000);
}
