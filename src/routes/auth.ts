import { Hono } from 'hono';
import { db } from '../db/index.js';
import { users, sessions } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import crypto from 'node:crypto'; // Importación explícita para compatibilidad con Node.js y Bun
// Definimos que el "maletín" (contexto) puede llevar un userId
const auth = new Hono<{ Variables: { userId: number | null } }>();
export let modelState = { current: 'gpt' };
// --- Función ayudante para crear sesiones ---
async function createNewSession(userId: number) {
    const sessionId = crypto.randomUUID(); // Un ID aleatorio único y seguro
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Dura 7 días
    await db.insert(sessions).values({
        id: sessionId,
        userId: userId,
        expiresAt: expiresAt,
    });
    return { sessionId, expiresAt };
}


auth.post('/login', async (c) => {
    console.log("DEBUG: Iniciando POST /api/login");
    let email, password;
    try {
        console.log("DEBUG: Intentando leer body...");
        const body = await c.req.json();
        console.log("DEBUG: Body recibido con éxito:", body);
        email = body.email;
        password = body.password;
    } catch (e: any) {
        console.error("DEBUG: Error crítico leyendo body:", e.message);
        return c.json({ message: 'Error en el formato de los datos enviados' }, 400);
    }

    const results = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const usuario = results[0];

    if (!usuario || usuario.passwordHash !== password) {
        return c.json({ message: 'Email o contraseña incorrectos' }, 401);
    }

    // 1. Creamos la sesión en la base de datos
    const session = await createNewSession(usuario.id);

    // 2. Le damos la "galleta" (cookie) al navegador
    const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    setCookie(c, "session_id", session.sessionId, {
        path: "/",
        httpOnly: true, // Seguridad: el código del chat no puede robarla
        secure: isProd,   // Solo viaja por conexión segura en producción
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 7, // 7 días en segundos
    });

    return c.json({
        message: `Bienvenido ${usuario.username}.`,
        username: usuario.username,
        admin: usuario.admin
    }, 200);
});


auth.post('/modelSelect', async (c) => {
    const userId = c.get('userId'); // <--- Sacamos el ID del maletín

    if (!userId) {
        return c.json({ message: 'Debes iniciar sesión' }, 401);
    }

    const quest = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const usuario = quest[0];

    if (!usuario || !usuario.admin) {
        return c.json({ message: 'No tienes permisos' }, 403);
    }

    const { nuevoModelo } = await c.req.json();
    modelState.current = nuevoModelo;

    return c.json({ message: 'Modelo cambiado', currentModel: modelState.current }, 200);
});



auth.post('/registro', async (c) => {
    console.log("DEBUG: Iniciando POST /api/registro");
    let username, email, password;
    try {
        console.log("DEBUG: Antes de c.req.json() en registro");
        const body = await c.req.json();
        console.log("DEBUG: Después de c.req.json() en registro", body);
        username = body.username;
        email = body.email;
        password = body.password;
    } catch (e: any) {
        console.error("DEBUG: Error parseando json en registro", e.message);
        return c.json({ message: 'Error parseando cuerpo' }, 400);
    }

    try {
        const [result] = await db.insert(users).values({
            username,
            email,
            passwordHash: password
        }).returning({ insertedId: users.id });

        if (!result) {
            throw new Error("No se pudo completar el registro");
        }

        const session = await createNewSession(result.insertedId);

        const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
        setCookie(c, "session_id", session.sessionId, {
            path: "/",
            httpOnly: true,
            secure: isProd,
            sameSite: "Lax",
            maxAge: 60 * 60 * 24 * 7,
        });

        return c.json({
            message: `¡Hola ${username}! Usuario registrado con éxito.`,
            username: username,
            admin: false,
            loggedIn: true
        }, 201);
    } catch (error) {
        console.error(error);
        return c.json({ message: 'El correo ya está registrado', isError: true }, 400);
    }
});


auth.get('/me', async (c) => {
    const userId = c.get('userId');

    if (!userId) {
        return c.json({ loggedIn: false });
    }

    const results = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const usuario = results[0];

    if (!usuario) {
        return c.json({ loggedIn: false });
    }

    return c.json({
        loggedIn: true,
        username: usuario.username,
        admin: usuario.admin
    });
});

auth.post('/logout', async (c) => {
    const sessionId = getCookie(c, "session_id");

    if (sessionId) {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
    }
    deleteCookie(c, "session_id");
    return c.json({ message: 'Sesión cerrada correctamente' }, 200);
});





export default auth;
