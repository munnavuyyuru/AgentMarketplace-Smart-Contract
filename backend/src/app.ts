import express from "express";
import cors from "cors";

import agentRoutes from "./routes/agent.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import paidRoutes from "./routes/paid.routes.js";

import { x402Middleware } from "./middleware/x402.middleware.js";

const app = express();

app.use(cors());

app.use(express.json());

/*
 * x402 protected routes
 */

app.use("/paid", (req, res, next) => {
  console.log("PAID REQUEST:", req.path);
  next();
});

app.use("/paid", x402Middleware);

app.use("/paid", paidRoutes);

app.use("/agents", agentRoutes);

app.use("/services", serviceRoutes);

export default app;
