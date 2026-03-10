import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import auth from './src/routes/auth';
import chat from './src/routes/chat';

const app = new Hono();
const port = 3000;

app.route('/api', auth);
app.route('/api', chat);

app.use('/*', serveStatic({ root: './dist' }));
app.get('/*', serveStatic({ path: './dist/index.html' }));

console.log(`Server running at http://localhost:${port}`);

export default {
    port: port,
    fetch: app.fetch,
};