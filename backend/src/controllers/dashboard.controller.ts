import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";
import { contract } from "../blockchain/contract.js";

/**
 * Get dashboard data for a wallet (typically an agent/provider).
 * Returns agent info, services, payments, and aggregated stats.
 */
export async function getDashboard(req: Request, res: Response) {
  const walletParam = req.params.wallet;
  const wallet = Array.isArray(walletParam) ? walletParam[0] : walletParam;

  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(wallet)) {
    return res.status(400).json({ error: "Invalid Ethereum address format" });
  }

  try {
    const { data: agentData, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("wallet_address", wallet)
      .single();

    if (agentError) {
      if (agentError.code !== "PGRST116") {
        return res.status(500).json({ error: agentError.message });
      }
    }

    const { data: servicesData, error: servicesError } = await supabase
      .from("services")
      .select("*")
      .eq("provider_address", wallet);

    if (servicesError) {
      return res.status(500).json({ error: servicesError.message });
    }

    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .eq("provider", wallet)
      .order("created_at", { ascending: false });

    if (paymentsError) {
      return res.status(500).json({ error: paymentsError.message });
    }

    const totalServices = servicesData?.length ?? 0;
    const totalPayments = paymentsData?.length ?? 0;
    const totalRevenue =
      paymentsData?.reduce((sum, payment) => sum + Number(payment.amount), 0) ??
      0;

    const reputationScore = agentData?.reputation_score ?? 0;
    const totalRatings = agentData?.total_ratings ?? 0;
    let avgRating = 0;
    if (totalRatings > 0) {
      avgRating = Number(reputationScore) / 100;
    }

    const response = {
      agent: agentData ?? null,
      services: servicesData ?? [],
      payments: paymentsData ?? [],
      totalServices,
      totalPayments,
      totalRevenue,
      reputationScore,
      totalRatings,
      avgRating: Number(avgRating.toFixed(2)),
    };

    return res.json(response);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
