import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { db } from "./db/index.ts";
import { sessions } from "./db/schema.ts";
import { eq } from "drizzle-orm";

/**
 * Este middleware lee la cookie 'session_id', busca en la DB 
 * y nos dice si el usuario está realmente logueado.
 */
export async function authMiddleware(c: Context, next: Next) {
    const sessionId = getCookie(c, "session_id");

    if (!sessionId) {
        c.set("userId", null);
        return await next();
    }

    try {
        // Buscamos la sesión en la base de datos que no haya expirado
        const [session] = await db
            .select()
            .from(sessions)
            .where(
                eq(sessions.id, sessionId)
            )
            .limit(1);

        if (!session || session.expiresAt < new Date()) {
            // Si no existe o expiró, no hay usuario
            c.set("userId", null);
            return await next();
        }

        // Si todo está bien, guardamos el ID del usuario en el "contexto" de Hono
        // para que las rutas puedan usarlo después.
        c.set("userId", session.userId);
    } catch (error) {
        console.error("Error en authMiddleware:", error);
        c.set("userId", null);
    }

    await next();
}
