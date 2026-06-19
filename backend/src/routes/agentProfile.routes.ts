import { Router } from "express";

import { getAgentProfile } from "../controllers/agentProfile.controller.js";

const router = Router();

router.get("/:wallet", getAgentProfile);

export default router;
