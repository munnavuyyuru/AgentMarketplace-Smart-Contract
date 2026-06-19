import { supabase } from "../config/supabase.js";

export async function getAgentReputation(req: any, res: any) {
  const wallet = req.params.wallet;

  const { data: services, error: serviceError } = await supabase
    .from("services")
    .select("id")
    .eq("provider_address", wallet);

  if (serviceError) {
    return res.status(500).json(serviceError);
  }

  if (!services || services.length === 0) {
    return res.json({
      wallet,
      totalServices: 0,
      totalRatings: 0,
      avgRating: 0,
      reputationScore: 0,
    });
  }

  const serviceIds = services.map((service) => service.id);

  const { data: ratings, error: ratingError } = await supabase
    .from("ratings")
    .select("*")
    .in("service_id", serviceIds);

  if (ratingError) {
    return res.status(500).json(ratingError);
  }

  const totalRatings = ratings?.length ?? 0;

  const totalScore = (ratings ?? []).reduce(
    (sum, rating) => sum + rating.score,
    0,
  );

  const avgRating =
    totalRatings === 0 ? 0 : Number((totalScore / totalRatings).toFixed(2));

  const reputationScore = Math.round((avgRating / 5) * 100);

  return res.json({
    wallet,
    totalServices: services.length,
    totalRatings,
    avgRating,
    reputationScore,
  });
}
