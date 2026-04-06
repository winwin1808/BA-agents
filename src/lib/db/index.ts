import { sql as vercelSql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";

import { getPostgresUrl } from "@/lib/env";

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(getPostgresUrl());
}

export function getDb() {
  if (!isDatabaseConfigured()) {
    throw new Error("POSTGRES_URL is not configured.");
  }

  if (!dbInstance) {
    dbInstance = drizzle(vercelSql);
  }

  return dbInstance;
}
