import { kv } from '@vercel/kv';

const STATE_KEY = 'pkl-qt-2026-state';
const VERSION_KEY = 'pkl-qt-2026-version';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'GET') {
    try {
      const [version, state] = await Promise.all([
        kv.get(VERSION_KEY),
        kv.get(STATE_KEY)
      ]);
      return res.status(200).json({
        version: typeof version === 'number' ? version : (parseInt(version, 10) || 0),
        state: state || null
      });
    } catch (error) {
      console.error('Error fetching state from KV:', error);
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }

  if (req.method === 'POST') {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const clientToken = req.headers['x-admin-token'];

    if (!adminPassword || clientToken !== adminPassword) {
      return res.status(401).json({ error: 'Unauthorized: invalid or missing admin token' });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { state } = body || {};

      if (!state) {
        return res.status(400).json({ error: 'Missing state in request body' });
      }

      await kv.set(STATE_KEY, state);
      const newVersion = await kv.incr(VERSION_KEY);

      return res.status(200).json({ ok: true, version: newVersion });
    } catch (error) {
      console.error('Error saving state to KV:', error);
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
