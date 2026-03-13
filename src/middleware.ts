import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { db } from "./db/index";
import { sessions } from "./db/schema";
import { eq } from "drizzle-orm";

export async function authMiddleware(c: Context, next: Next) {
    const sessionId = getCookie(c, "session_id");

    if (!sessionId) {
        c.set("userId", null);
        return await next();
    }

    try {
        const [session] = await db
            .select()
            .from(sessions)
            .where(
                eq(sessions.id, sessionId)
            )
            .limit(1);

        if (!session || session.expiresAt < new Date()) {
            c.set("userId", null);
            return await next();
        }

        c.set("userId", session.userId);
    } catch (error) {
        console.error("Error en authMiddleware:", error);
        c.set("userId", null);
    }

    await next();
}
