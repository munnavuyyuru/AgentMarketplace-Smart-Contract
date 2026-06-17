import { Router } from "express";

const router = Router();

router.get("/service/:serviceId", async (req, res) => {
  return res.json({
    success: true,
    serviceId: req.params.serviceId,
    message: "Protected endpoint reached",
  });
});

export default router;
