import express from "express";
import cors from "cors";

import agentRoutes from "./routes/agent.routes.js";

import serviceRoutes from "./routes/service.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/agents", agentRoutes);

app.use("/services", serviceRoutes);

export default app;
