import express from "express";
import cors from "cors";

import agentRoutes from "./routes/agent.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/agents", agentRoutes);

export default app;
