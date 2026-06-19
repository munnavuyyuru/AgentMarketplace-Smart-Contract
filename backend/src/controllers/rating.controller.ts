import { supabase } from "../config/supabase.js";

export async function createRating(req: any, res: any) {
  const { service_id, reviewer, score, comment } = req.body;

  const { data, error } = await supabase
    .from("ratings")
    .insert({
      service_id,
      reviewer,
      score,
      comment,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json(error);
  }

  return res.json(data);
}

export async function getRatings(req: any, res: any) {
  const serviceId = Number(req.params.serviceId);

  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .eq("service_id", serviceId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return res.status(500).json(error);
  }

  return res.json(data);
}
