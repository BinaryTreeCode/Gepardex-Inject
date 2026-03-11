import { Hono } from 'hono';
import { cors } from 'hono/cors';
// Quitamos la importación estática de Bun para evitar errores en Vercel
import auth from './src/routes/auth.js';
import chat from './src/routes/chat.js';
import { authMiddleware } from './src/middleware.js';

const app = new Hono<{ Variables: { userId: number | null } }>();

app.use('/api/*', cors({
    origin: (origin) => origin || '*',
    credentials: true,
}));

// DIAGNÓSTICO: Ver qué peticiones llegan y si traen body
app.use('/api/*', async (c, next) => {
    console.log(`[REQ] ${c.req.method} ${c.req.url}`);
    if (['POST', 'PUT'].includes(c.req.method)) {
        console.log(`[REQ BODY TYPE] ${c.req.header('content-type')}`);
    }
    await next();
});

// Manejador de errores global para ver qué está pasando en Vercel
app.onError((err, c) => {
    console.error('GLOBAL ERROR:', err);
    return c.json({ 
        status: 'error', 
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, 500);
});

const port = 3000;

app.get('/api/ping', (c) => c.json({ status: 'ok', message: 'Hono is alive' }));

app.use('/api/*', authMiddleware);

app.get('/api/db-test', async (c) => {
    try {
        const { users } = await import('./src/db/schema.js');
        const { db } = await import('./src/db/index.js');
        const res = await db.select().from(users).limit(1);
        return c.json({ status: 'ok', usersFound: res.length });
    } catch (e: any) {
        return c.json({ status: 'error', message: e.message }, 500);
    }
});

app.route('/api', auth);
app.route('/api', chat);

// Serving de estáticos removido para delegar totalmente en Vercel y Vite (sin top-level await)
if (process.env.BUN_ENV !== 'production' && !process.env.VERCEL) {
    console.log(`Server running at http://localhost:${port}`);
}

export { app };

export default {
    port: port,
    fetch: app.fetch,
};