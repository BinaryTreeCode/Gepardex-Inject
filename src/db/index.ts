import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
    console.error("CRITICAL: DATABASE_URL is not defined in environment variables");
}

const queryClient = postgres(url || "");
export const db = drizzle(queryClient, { schema });
