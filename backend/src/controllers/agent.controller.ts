import { supabase } from "../config/supabase.js";

export async function getAgents(req: any, res: any) {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("reputation_score", {
      ascending: false,
    });

  if (error) {
    return res.status(500).json(error);
  }

  return res.json(data);
}
