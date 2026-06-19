import { Router } from "express";

import { createRating, getRatings } from "../controllers/rating.controller.js";

const router = Router();

router.post("/", createRating);

router.get("/:serviceId", getRatings);

export default router;
