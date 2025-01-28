import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { ClassicLevel } from 'classic-level';
import { join } from 'path';
import type { Context } from 'hono';

const app = new Hono();
const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), 'data');

// Initialize LevelDB with proper types for key and value
const db = new ClassicLevel<Buffer, string>(DATA_DIR, {
    valueEncoding: 'utf8',
    keyEncoding: 'binary'
});

app.get('/v1/heal/:labelhash', async (c: Context) => {
    const labelhash = c.req.param('labelhash');
    
    try {
        // Convert hex string to Buffer, stripping '0x' prefix if present
        const hashBytes = Buffer.from(labelhash.replace(/^0x/, ''), 'hex');
        const label = await db.get(hashBytes);
        return c.json({ healed: label });
    } catch (error) {
        if ((error as any).code === 'LEVEL_NOT_FOUND') {
            return c.json({ healed: null });
        }
        console.error('Error healing label:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// Health check endpoint
app.get('/health', (c: Context) => c.json({ status: 'ok' }));

const port = parseInt(process.env.PORT || '3001', 10);
console.log(`Server starting on port ${port}...`);
serve({
    fetch: app.fetch,
    port: port
}); 