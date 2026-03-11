import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import auth from './src/routes/auth';
import chat from './src/routes/chat';
import { authMiddleware } from './src/middleware';

const app = new Hono<{ Variables: { userId: number | null } }>();
const port = 3000;

app.use('/api/*', authMiddleware);

app.route('/api', auth);
app.route('/api', chat);

if (!process.env.VERCEL) {
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