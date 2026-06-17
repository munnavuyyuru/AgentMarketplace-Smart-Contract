import { supabase } from "../config/supabase.js";

export async function getServices(req: any, res: any) {
  const { data, error } = await supabase.from("services").select("*");

  if (error) {
    return res.status(500).json(error);
  }

  return res.json(data);
}
