import { serveStatic } from 'hono/bun';
import { app } from './index';

// En local, servimos el frontend compilado
app.use('/*', serveStatic({ root: './dist' }));
app.get('/*', serveStatic({ path: './dist/index.html' }));

const port = 3000;
console.log(`Development server running at http://localhost:${port}`);

export default {
    port: port,
    fetch: app.fetch,
};
