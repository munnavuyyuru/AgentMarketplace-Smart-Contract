import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";
import { contract } from "../blockchain/contract.js";

/**
 * Get all services ordered by ID (ascending) with their manifests.
 */
export async function getServices(req: Request, res: Response) {
  const { data, error } = await supabase
    .from("services")
    .select(`
      *,
      service_manifests (
        execution_type,
        input_schema,
        output_schema,
        timeout,
        endpoint,
        metadata
      )
    `)
    .order("service_id", { ascending: true });

  if (error) {
    return res.status(500).json(error);
  }

  // Flatten the response to include manifest fields at the top level for easier consumption
  const formattedData = data.map(service => ({
    ...service,
    ...(service.service_manifests?.[0] || {}),
    service_manifests: undefined // Remove the nested object
  }));

  return res.json(formattedData);
}

/**
 * Get a service by its ID with its manifest.
 */
export async function getServiceById(req: Request, res: Response) {
  const id = Number(req.params.id);

  const { data, error } = await supabase
    .from("services")
    .select(`
      *,
      service_manifests (
        execution_type,
        input_schema,
        output_schema,
        timeout,
        endpoint,
        metadata
      )
    `)
    .eq("service_id", id)
    .single();

  if (error) {
    return res.status(404).json({
      message: "Service not found",
    });
  }

  // Flatten the response to include manifest fields at the top level
  const formattedData = {
    ...data,
    ...(data.service_manifests?.[0] || {}),
    service_manifests: undefined // Remove the nested object
  };

  return res.json(formattedData);
}

/**
 * Create a new service (after the user has submitted a transaction to the contract).
 * This endpoint validates the request, checks if the provider is a registered agent on-chain,
 * and stores both service and manifest data.
 */
export async function createService(req: Request, res: Response) {
  const {
    provider_address,
    title,
    descriptionURI,
    priceWei,
    // Manifest fields
    executionType = 'http',
    inputSchema = {},
    outputSchema = {},
    timeout = 30,
    endpoint,
    metadata = {}
  } = req.body;

  // Basic validation for service fields
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

  // Validate Ethereum address format (basic check)
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(provider_address)) {
    return res
      .status(400)
      .json({ error: "Invalid Ethereum address format for provider_address" });
  }

  // Validate priceWei is a positive number (as string or number)
  let priceWeiBigInt: bigint;
  if (typeof priceWei === "string") {
    if (!/^\d+$/.test(priceWei)) {
      return res.status(400).json({ error: "priceWei must be a non-negative integer" });
    }
    // Check if it's too big for a uint256? We'll just try to convert to BigInt.
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
    // Check if the provider is a registered agent on the blockchain
    const agentData = await contract.agents(provider_address);
    if (!agentData.registered) {
      return res
        .status(400)
        .json({ error: "Provider is not a registered agent" });
    }

    // Insert the service into the services table
    const { data: serviceData, error: serviceError } = await supabase
      .from("services")
      .insert({
        provider_address: provider_address,
        title: title,
        description_uri: descriptionURI,
        price_wei: priceWei.toString(), // Store as string to match eventSync
        active: true,
      })
      .select()
      .single();

    if (serviceError) {
      console.error("Error inserting service:", serviceError);
      return res.status(500).json({ error: "Failed to create service" });
    }

    // Insert the manifest into the service_manifests table
    const { error: manifestError } = await supabase
      .from("service_manifests")
      .insert({
        service_id: serviceData.service_id,
        execution_type: executionType,
        input_schema: inputSchema,
        output_schema: outputSchema,
        timeout: timeout,
        endpoint: endpoint,
        metadata: metadata,
      });

    if (manifestError) {
      console.error("Error inserting service manifest:", manifestError);
      // Optionally, we could delete the service if manifest creation fails
      // For now, we'll return the service but log the error
      console.warn("Service created but manifest creation failed");
    }

    // If we wanted to, we could return the data that would be needed for the transaction
    return res.status(201).json({
      message: "Service created successfully. Please submit a transaction to the contract's createService function to register it on-chain.",
      service: {
        ...serviceData,
        execution_type: executionType,
        input_schema: inputSchema,
        output_schema: outputSchema,
        timeout: timeout,
        endpoint: endpoint,
        metadata: metadata
      },
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