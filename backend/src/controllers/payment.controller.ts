import { supabase } from "../config/supabase.js";

export async function createPayment(req: any, res: any) {
  const { service_id, buyer, provider, amount, tx_hash } = req.body;

  const { data, error } = await supabase
    .from("payments")
    .insert({
      service_id,
      buyer,
      provider,
      amount,
      tx_hash,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json(error);
  }

  return res.json(data);
}

export async function getPayments(req: any, res: any) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json(error);
  }

  return res.json(data);
}
