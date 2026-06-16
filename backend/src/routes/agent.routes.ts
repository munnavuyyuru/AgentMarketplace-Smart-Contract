import { Router } from "express";

import { getAgents } from "../controllers/agent.controller.js";

const router = Router();

router.get("/", getAgents);

export default router;
