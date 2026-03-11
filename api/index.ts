import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono();
app.get('/api/ping', (c) => c.json({ status: 'ok', msg: 'isolated test' }));

export default handle(app);

