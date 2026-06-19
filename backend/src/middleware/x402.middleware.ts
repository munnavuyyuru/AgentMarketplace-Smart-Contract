import { paymentMiddleware } from "@x402/express";

import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";

import { ExactEvmScheme } from "@x402/evm/exact/server";

import { createPaywall } from "@x402/paywall";
import { evmPaywall } from "@x402/paywall/evm";

const facilitator = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator",
});

const server = new x402ResourceServer(facilitator).register(
  "eip155:84532",
  new ExactEvmScheme(),
);

const paywall = createPaywall()
  .withNetwork(evmPaywall)
  .withConfig({
    appName: "Agent Marketplace",
    testnet: true,
  })
  .build();

const routes = {
  "GET /service/*": {
    accepts: [
      {
        scheme: "exact" as const,

        network: "eip155:84532" as `${string}:${string}`,

        payTo: "0x26761b4A638b25a001521417D9cE800674b6dA90",

        price: "$0.01",
      },
    ],

    description: "Access paid agent marketplace service",

    mimeType: "application/json",
  },
};

export const x402Middleware = paymentMiddleware(
  routes,
  server,
  {
    appName: "Agent Marketplace",
    testnet: true,
  },
  paywall,
);
