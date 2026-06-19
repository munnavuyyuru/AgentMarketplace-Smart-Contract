import { Router } from "express";

import { getAgentReputation } from "../controllers/reputation.controller.js";

const router = Router();

router.get("/:wallet", getAgentReputation);

export default router;
