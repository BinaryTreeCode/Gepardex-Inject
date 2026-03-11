import { Hono } from 'hono';
import { db } from '../db/index';
import { chats, messages } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { getCerebrasResponse } from '../cerebras';
import { modelState } from './auth';

const chat = new Hono<{ Variables: { userId: number | null } }>();

chat.post('/new-chat', async (c) => {
    const userId = c.get('userId');

    if (!userId) {
        return c.json({ message: 'Debes iniciar sesión para crear un chat' }, 401);
    }

    const [result] = await db.insert(chats).values({
        userId: userId,
        title: 'Nuevo Chat'
    }).returning({ insertedId: chats.id });

    if (!result) {
        return c.json({ message: 'No se pudo crear el chat' }, 500);
    }

    return c.json({
        message: `Nuevo chat creado con éxito`,
        chat: { title: 'Nuevo Chat', id: result.insertedId, userId: userId }
    }, 200);
});

chat.post('/mensaje-manager', async (c) => {
    try {
        const body = await c.req.json();
        const { role, content, chatId } = body;

        if (!role || !content || !chatId) {
            return c.json({ message: 'Faltan datos obligatorios' }, 400);
        }

        // Guardamos el mensaje (sea de usuario o de asistente enviado por el frontend)
        await db.insert(messages).values({
            chatId: chatId,
            role: role,
            content: content,
        });

        return c.json({ 
            message: 'Mensaje guardado correctamente',
            role: role,
            content: content 
        }, 200);

    } catch (error) {
        console.error("Error en mensaje-manager:", error);
        return c.json({ message: 'Error interno del servidor' }, 500);
    }
});

chat.get('/chats', async (c) => {
    const userId = c.get('userId');

    if (!userId) {
        return c.json({ message: 'Debes iniciar sesión' }, 401);
    }

    const chatResults = await db.select()
        .from(chats)
        .where(eq(chats.userId, userId))
        .orderBy(asc(chats.createdAt));

    const listChats = chatResults.map((chat) => ({
        id: chat.id,
        title: chat.title,
    }));

    return c.json(listChats);
});

chat.post('/messages', async (c) => {
    const { chatId } = await c.req.json();

    const results = await db.select()
        .from(messages)
        .where(eq(messages.chatId, chatId))
        .orderBy(asc(messages.createdAt));

    const messagesList = results.map((message) => ({
        role: message.role as "user" | "assistant" | "system",
        content: message.content,
    }));

    return c.json(messagesList);
});

export default chat;
