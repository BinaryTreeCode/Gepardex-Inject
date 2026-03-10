import { Hono } from 'hono';
import { db } from '../db';
import { chats, messages } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { getCerebrasResponse } from '../cerebras';
import { usuarioActivoId, modelState } from './auth';

const chat = new Hono();

let chatActivoId: number | null = null;

chat.post('/new-chat', async (c) => {
    if (!usuarioActivoId) {
        return c.json({ message: 'Debes iniciar sesión para crear un chat' }, 401);
    }

    const [result] = await db.insert(chats).values({
        userId: usuarioActivoId,
        title: 'Nuevo Chat'
    });

    chatActivoId = Number(result.insertId);

    return c.json({
        message: `Nuevo chat creado con éxito`,
        chat: { title: 'Nuevo Chat', id: chatActivoId, userId: usuarioActivoId }
    }, 200);
});

chat.post('/mensaje-manager', async (c) => {
    try {
        const body = await c.req.json();
        const { role, content, chatId } = body;

        if (!role || !content) {
            return c.json({ message: 'El rol y el contenido son obligatorios' }, 400);
        }

        const currentChatId = chatId || chatActivoId;

        if (!currentChatId) {
            return c.json({ message: 'Primero debes crear un chat' }, 401);
        }

        await db.insert(messages).values({
            chatId: currentChatId,
            role: role,
            content: content,
        });

        if (role === 'user') {
            const results = await db.select()
                .from(messages)
                .where(eq(messages.chatId, currentChatId))
                .orderBy(asc(messages.createdAt));

            const history = results.map((message) => ({
                role: message.role as "user" | "assistant" | "system",
                content: message.content,
            }));

            try {
                const aiResponse = await getCerebrasResponse(history, modelState.current);

                await db.insert(messages).values({
                    chatId: currentChatId,
                    role: 'assistant',
                    content: aiResponse,
                });

                return c.json({
                    role: 'assistant',
                    content: String(aiResponse)
                }, 200);
            } catch (error) {
                console.error("Error al obtener respuesta de Cerebras:", error);
                return c.json({ role: 'assistant', content: 'Error al conectar con el servicio de IA' }, 502);
            }
        }

        return c.json({ role: 'assistant', content: 'Mensaje guardado correctamente' }, 200);
    } catch (error) {
        console.error("Error en mensaje-manager:", error);
        return c.json({ role: 'assistant', content: 'Error interno del servidor' }, 500);
    }
});

chat.get('/chats', async (c) => {
    if (!usuarioActivoId) {
        return c.json({ message: 'Debes iniciar sesión' }, 401);
    }

    const chatResults = await db.select()
        .from(chats)
        .where(eq(chats.userId, usuarioActivoId))
        .orderBy(asc(chats.createdAt));

    const listChats = chatResults.map((chat) => ({
        id: chat.id,
        title: chat.title,
    }));

    return c.json(listChats);
});

chat.post('/messages', async (c) => {
    const { chatId } = await c.req.json();
    chatActivoId = chatId;

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
