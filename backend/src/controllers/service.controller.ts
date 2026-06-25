import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";
import { contract } from "../blockchain/contract.js";

/**
 * Get all services ordered by ID (ascending).
 */
export async function getServices(req: Request, res: Response) {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return res.status(500).json(error);
  }

  return res.json(data);
}

/**
 * Get a service by its ID.
 */
export async function getServiceById(req: Request, res: Response) {
  const id = Number(req.params.id);

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({
      message: "Service not found",
    });
  }

  return res.json(data);
}

/**
 * Create a new service (after the user has submitted a transaction to the contract).
 * This endpoint validates the request and checks if the provider is a registered agent on-chain.
 */
export async function createService(req: Request, res: Response) {
  const { provider_address, title, descriptionURI, priceWei } = req.body;

  if (
    !provider_address ||
    !title ||
    !descriptionURI ||
    priceWei === undefined
  ) {
    return res
      .status(400)
      .json({
        error:
          "Missing required fields: provider_address, title, descriptionURI, priceWei",
      });
  }

  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(provider_address)) {
    return res
      .status(400)
      .json({ error: "Invalid Ethereum address format for provider_address" });
  }

  let priceWeiBigInt: bigint;
  if (typeof priceWei === "string") {
    if (!/^\d+$/.test(priceWei)) {
      return res
        .status(400)
        .json({ error: "priceWei must be a non-negative integer" });
    }
    try {
      priceWeiBigInt = BigInt(priceWei);
    } catch (e) {
      return res.status(400).json({ error: "priceWei is too large" });
    }
    if (priceWeiBigInt < 0) {
      return res.status(400).json({ error: "priceWei must be non-negative" });
    }
  } else if (typeof priceWei === "number") {
    if (!Number.isInteger(priceWei) || priceWei < 0) {
      return res
        .status(400)
        .json({ error: "priceWei must be a non-negative integer" });
    }
    priceWeiBigInt = BigInt(priceWei);
  } else {
    return res
      .status(400)
      .json({ error: "priceWei must be a string or number" });
  }

  try {
    const agentData = await contract.agents(provider_address);
    if (!agentData.registered) {
      return res
        .status(400)
        .json({ error: "Provider is not a registered agent" });
    }

    // TODO: Optionally, we could check if the service already exists? But we don't have a service ID yet.
    // We could check by title and provider? Not required.

    // If we wanted to, we could return the data that would be needed for the transaction
    return res.status(202).json({
      message:
        "Please submit a transaction to the contract's createService function. The service will be available once the transaction is processed.",
      suggestedTransaction: {
        to: process.env.CONTRACT_ADDRESS,
        data: contract.interface.encodeFunctionData("createService", [
          title,
          descriptionURI,
          priceWei,
        ]),
      },
    });
  } catch (error) {
    console.error("Error checking agent status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
