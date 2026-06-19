import { Router } from "express";
import { supabase } from "../config/supabase.js";

const router = Router();

function decodePaymentSignature(signature: string) {
  try {
    const decoded = Buffer.from(signature, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

router.get("/service/:serviceId", async (req, res) => {
  const id = Number(req.params.serviceId);

  const paymentSignature = req.headers["payment-signature"];

  let buyer: string | null = null;
  let provider: string | null = null;
  let amount: string | null = null;

  if (paymentSignature && typeof paymentSignature === "string") {
    const payload = decodePaymentSignature(paymentSignature);

    buyer = payload?.payload?.authorization?.from ?? null;

    provider = payload?.payload?.authorization?.to ?? null;

    amount = payload?.payload?.authorization?.value ?? null;
  }

  const { data: service, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  /*
   * Record payment
   */
  if (buyer && provider && amount && paymentSignature) {
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("service_id", id)
      .eq("buyer", buyer)
      .order("created_at", {
        ascending: false,
      })
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from("payments").insert({
        payment_id: Date.now(),
        service_id: id,
        buyer,
        provider,
        amount,
        tx_hash: null,
        payment_signature: paymentSignature,
      });
    }
  }

  return res.json({
    success: true,
    service,
    deliverable: service.description_uri,
  });
});

export default router;
