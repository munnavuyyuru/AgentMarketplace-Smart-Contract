import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

export const env = {
  PORT: Number(process.env.PORT || 5000),

  FUJI_RPC_URL: process.env.FUJI_RPC_URL ?? "",

  PRIVATE_KEY: process.env.PRIVATE_KEY ?? "",

  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS ?? "",

  SUPABASE_URL: process.env.SUPABASE_URL ?? "",

  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
};
