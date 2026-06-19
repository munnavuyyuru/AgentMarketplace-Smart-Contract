import { supabase } from "../config/supabase.js";

export async function getAgentProfile(req: any, res: any) {
  const wallet = req.params.wallet;

  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("wallet", wallet)
    .single();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("provider_address", wallet);

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("provider", wallet);

  const totalRevenue =
    payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) ?? 0;

  return res.json({
    agent,
    services: services ?? [],
    payments: payments ?? [],
    totalServices: services?.length ?? 0,
    totalPayments: payments?.length ?? 0,
    totalRevenue,
  });
}
