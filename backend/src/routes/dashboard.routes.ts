import { Router } from "express";

import { getDashboard } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/:wallet", getDashboard);

export default router;