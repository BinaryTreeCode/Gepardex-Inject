import { Hono } from 'hono';
import auth from './src/routes/auth';
import chat from './src/routes/chat';
import { authMiddleware } from './src/middleware';

const app = new Hono<{ Variables: { userId: number | null } }>();

// Middleware y Rutas
app.use('/api/*', authMiddleware);
app.route('/api', auth);
app.route('/api', chat);

// Exportamos la app pura
export { app };

// Esto solo se ejecutará si corremos este archivo directamente con Bun/Node
if (typeof process !== 'undefined' && !process.env.VERCEL) {
    const port = 3000;
    console.log(`Hono app ready for local environment`);
}

export default app;