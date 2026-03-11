import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
    console.error("DATABASE_URL no definida");
    process.exit(1);
}

console.log("Probando conexión a Neon HTTP...");
const sql = neon(url);
const db = drizzle(sql);

async function test() {
    try {
        const result = await sql`SELECT version()`;
        console.log("Conexión exitosa:", result[0]);
        process.exit(0);
    } catch (e) {
        console.error("Error conectando:", e);
        process.exit(1);
    }
}

test();
