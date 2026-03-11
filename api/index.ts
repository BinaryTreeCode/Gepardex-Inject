import { handle } from '@hono/node-server/vercel';
import { app } from '../index.js';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default handle(app);

