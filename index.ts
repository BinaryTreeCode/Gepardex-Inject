import { Hono } from 'hono';
// Quitamos la importación estática de Bun para evitar errores en Vercel
import auth from './src/routes/auth.js';
import chat from './src/routes/chat.js';
import { authMiddleware } from './src/middleware.js';

const app = new Hono<{ Variables: { userId: number | null } }>();
const port = 3000;

app.use('/api/*', authMiddleware);

app.route('/api', auth);
app.route('/api', chat);

if (!process.env.VERCEL) {
    // Solo cargamos serveStatic si no estamos en Vercel
    const { serveStatic } = await import('hono/bun');
    app.use('/*', serveStatic({ root: './dist' }));
    app.get('/*', serveStatic({ path: './dist/index.html' }));
}

if (process.env.BUN_ENV !== 'production' && !process.env.VERCEL) {
    console.log(`Server running at http://localhost:${port}`);
}

export { app };

export default {
    port: port,
    fetch: app.fetch,
};