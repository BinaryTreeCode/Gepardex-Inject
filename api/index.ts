import { handle } from 'hono/vercel';
import { app } from '../index.js';

// Eliminamos la config de edge para usar Node.js standard

export default handle(app);
