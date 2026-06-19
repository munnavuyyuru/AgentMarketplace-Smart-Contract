import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

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
