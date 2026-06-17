import { paymentMiddleware } from "x402-express";

export const x402Middleware = paymentMiddleware(
  "0x26761b4A638b25a001521417D9cE800674b6dA90",
  {
    "/service/*": {
      price: "$0.01",
      network: "avalanche-fuji",
      config: {
        description: "Access paid agent marketplace service",
      },
    },
  },
);
