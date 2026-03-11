import { Hono } from 'hono';
// Quitamos la importación estática de Bun para evitar errores en Vercel
import auth from './src/routes/auth.js';
import chat from './src/routes/chat.js';
import { authMiddleware } from './src/middleware.js';

const app = new Hono<{ Variables: { userId: number | null } }>();
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

if (!process.env.VERCEL) {
    // Solo cargamos serveStatic si no estamos en Vercel
    const { serveStatic } = await import('hono/bun');
    app.use('/*', serveStatic({ root: './public' }));
    app.get('/*', serveStatic({ path: './public/index.html' }));
}

if (process.env.BUN_ENV !== 'production' && !process.env.VERCEL) {
    console.log(`Server running at http://localhost:${port}`);
}

export { app };

export default {
    port: port,
    fetch: app.fetch,
};