import { Hono } from 'hono';
import { cors } from 'hono/cors';

console.log("BACKEND: Iniciando app...");
// Quitamos la importación estática de Bun para evitar errores en Vercel
import auth from './src/routes/auth';
import chat from './src/routes/chat';
import { authMiddleware } from './src/middleware';

const app = new Hono<{ Variables: { userId: number | null } }>().basePath('/api');

app.use('*', cors({
    origin: (origin) => origin || '*',
    credentials: true,
}));

const port = 3000;
app.get('/ping', (c) => c.json({ status: 'ok', message: 'Hono is alive on Edge' }));

app.use('*', authMiddleware);

app.get('/db-test', async (c) => {
    try {
        const { users } = await import('./src/db/schema');
        const { db } = await import('./src/db/index');
        const res = await db.select().from(users).limit(1);
        return c.json({ status: 'ok', usersFound: res.length });
    } catch (e: any) {
        return c.json({ status: 'error', message: e.message }, 500);
    }
});

app.route('', auth);
app.route('', chat);

if (process.env.BUN_ENV !== 'production' && !process.env.VERCEL) {
    console.log(`Server running at http://localhost:${port}`);
}

export { app };

export default {
    port: port,
    fetch: app.fetch,
};