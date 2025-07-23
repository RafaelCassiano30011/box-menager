import { drizzle as drizzleJS } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

console.log("Using database URL:", process.env.DATABASE_URL);

// Configure postgres client for Supabase
const sql = postgres(process.env.DATABASE_URL, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

export const drizzle = drizzleJS(sql, { schema });
