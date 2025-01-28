import { Hono } from 'hono';
import { ClassicLevel } from 'classic-level';
import { join } from 'path';
import type { Context } from 'hono';

const app = new Hono();
const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), 'data');

// Initialize LevelDB
const db = new ClassicLevel(DATA_DIR, {
    valueEncoding: 'utf8',
    keyEncoding: 'utf8'  // Store keys as hex strings
});

app.get('/v1/heal/:labelhash', async (c: Context) => {
    const labelhash = c.req.param('labelhash');
    
    try {
        const label = await db.get(labelhash);
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

export default {
    port: process.env.PORT || 3000,
    fetch: app.fetch,
}; 