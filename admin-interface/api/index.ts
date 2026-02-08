
import { build } from '../src/server';
import { IncomingMessage, ServerResponse } from 'http';

const appPromise = build();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
    const app = await appPromise;
    await app.ready();
    app.server.emit('request', req, res);
}
