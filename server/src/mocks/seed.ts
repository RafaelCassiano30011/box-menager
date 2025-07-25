import { drizzle } from "../lib/drizzle";
import * as schema from "@shared/schema";
import { seed } from "drizzle-seed";

async function seedDatabase() {
  await seed(drizzle, schema);
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };
