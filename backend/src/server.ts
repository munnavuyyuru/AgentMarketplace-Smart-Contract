import app from "./app.js";

import { env } from "./config/env.js";

import { startEventSync } from "./services/eventSync.service.js";

import { backfillAgents } from "./services/backfill.service.js";

app.listen(env.PORT, async () => {
  console.log(`Server running on port ${env.PORT}`);

  await backfillAgents();

  await startEventSync();
});
