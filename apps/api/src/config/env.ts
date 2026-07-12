import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";

export interface ApiConfig {
  port: number;
  corsOrigin: string;
  databaseUrl: string;
}

let cachedConfig: ApiConfig | undefined;

export function getApiConfig(): ApiConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  loadLocalEnv();

  const port = Number.parseInt(process.env.API_PORT ?? "4100", 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("API_PORT must be a positive integer");
  }

  cachedConfig = {
    port,
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    databaseUrl: process.env.DATABASE_URL ?? "postgres://hourbank:hourbank@localhost:5433/hourbank",
  };

  return cachedConfig;
}

function loadLocalEnv() {
  const candidates = [resolve(process.cwd(), ".env"), resolve(process.cwd(), "../../.env")];

  for (const envPath of candidates) {
    if (existsSync(envPath)) {
      loadDotenv({ path: envPath });
      return;
    }
  }
}
