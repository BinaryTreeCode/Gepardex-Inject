import { handle } from '@hono/node-server/vercel';
import { app } from '../index.js';

// El adapter handle() se encarga de procesar la request de Node/Vercel a Hono.

export default handle(app);

