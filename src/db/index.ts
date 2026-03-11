import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const queryClient = postgres(process.env.DATABASE_URL || "", { 
    ssl: 'require',
    max: 1 // Muy importante para Serverless/Vercel
});
export const db = drizzle(queryClient, { schema });
