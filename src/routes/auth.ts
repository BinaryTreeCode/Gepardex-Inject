import { Hono } from 'hono';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const auth = new Hono();

export let usuarioActivoId: number | null = null;
export let modelState = { current: 'gpt' };

export function setUsuarioActivoId(id: number | null) {
    usuarioActivoId = id;
}

auth.post('/modelSelect', async (c) => {
    if (usuarioActivoId === null) {
        return c.json({ message: 'Debes iniciar sesión' }, 401);
    }

    const quest = await db.select()
        .from(users)
        .where(eq(users.id, usuarioActivoId))
        .limit(1);

    const usuario = quest[0];

    // Validamos que el usuario exista y sea administrador
    if (!usuario || !usuario.admin) {
        return c.json({ message: 'No tienes permisos para cambiar el modelo' }, 403);
    }

    try {
        const { nuevoModelo } = await c.req.json();
        modelState.current = nuevoModelo;
        console.log(modelState.current);
    } catch (error) {
        console.error(error);
    }

    return c.json({ message: 'Modelo cambiado correctamente', currentModel: modelState.current }, 200);
});

auth.post('/registro', async (c) => {
    const { username, email, password } = await c.req.json();

    try {
        const [result] = await db.insert(users).values({
            username,
            email,
            passwordHash: password
        });

        usuarioActivoId = Number(result.insertId);

        return c.json({
            message: `¡Hola ${username}! Usuario registrado con éxito.`,
            isError: false
        }, 201);
    } catch (error) {
        console.error(error);
        return c.json({ message: 'El correo ya está registrado', isError: true }, 400);
    }
});

auth.post('/login', async (c) => {
    const { email, password } = await c.req.json();

    const results = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    const usuario = results[0];

    if (!usuario) {
        return c.json({ message: 'Email incorrecto' }, 401);
    }

    if (usuario.passwordHash !== password) {
        return c.json({ message: 'Contraseña incorrecta' }, 401);
    }

    usuarioActivoId = usuario.id;

    return c.json({
        message: `Bienvenido ${usuario.username}.`,
        username: usuario.username,
        admin: usuario.admin
    }, 200);
});

auth.post('/logout', async (c) => {
    usuarioActivoId = null;
    return c.json({ message: 'Sesión cerrada correctamente' }, 200);
});




export default auth;
