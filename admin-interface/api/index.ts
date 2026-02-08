import { build } from '../src/server';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: Awaited<ReturnType<typeof build>> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (!app) {
            app = await build();
            await app.ready();
        }

        // Use app.inject() for better serverless compatibility on Vercel
        const { method, url, headers, body } = req;

        const response = await app.inject({
            method: method as any,
            url: url || '/',
            headers: headers as any,
            payload: body,
        });

        // Mirror the response back to Vercel's response object
        res.status(response.statusCode);
        Object.entries(response.headers).forEach(([key, value]) => {
            if (value !== undefined) {
                res.setHeader(key, Array.isArray(value) ? value : String(value));
            }
        });

        res.send(response.body);
    } catch (error) {
        console.error('Error handling request in serverless handler:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
