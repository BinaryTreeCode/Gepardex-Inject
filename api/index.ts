import { handle } from 'hono/vercel';
import { app } from '../index.js';

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

export default handle(app);

