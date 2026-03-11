import { handle } from 'hono/vercel';
import { app } from '../index';

// Eliminamos la config de edge para usar Node.js standard

export default handle(app);
