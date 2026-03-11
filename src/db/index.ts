import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const queryClient = postgres(process.env.DATABASE_URL || "", { 
    ssl: 'require',
    max: 1,           // Crítico para serverless
    prepare: false,   // OBLIGATORIO para el pooler de Neon
    idle_timeout: 20, // Cerrar conexiones inactivas rápido
    connect_timeout: 10, // No esperar eternamente si la DB está dormida
});

export const db = drizzle(queryClient, { schema });
