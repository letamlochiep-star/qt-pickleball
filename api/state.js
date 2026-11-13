// api/state.js — Vercel serverless endpoint để đồng bộ dữ liệu giải Pickleball
// GET  /api/state           → trả về {state, version} (công khai)
// POST /api/state           → ghi state mới, cần header x-admin-token khớp env ADMIN_PASSWORD

const { kv } = require('@vercel/kv');

const STATE_KEY = 'pkl-qt-2026-state';
const VERSION_KEY = 'pkl-qt-2026-version';

module.exports = async function handler(req, res) {
  // CORS cho phép mở từ bất kỳ domain nào xem (không bắt buộc)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const [state, version] = await Promise.all([
        kv.get(STATE_KEY),
        kv.get(VERSION_KEY)
      ]);
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(200).json({
        state: state || null,
        version: Number(version) || 0
      });
    }

    if (req.method === 'POST') {
      const token = req.headers['x-admin-token'];
      const expected = process.env.ADMIN_PASSWORD;
      if (!expected) {
        return res.status(500).json({ error: 'ADMIN_PASSWORD chưa cấu hình trên Vercel' });
      }
      if (!token || token !== expected) {
        return res.status(401).json({ error: 'unauthorized: sai x-admin-token' });
      }
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch(e) {}
      }
      if (!body || typeof body.state !== 'object') {
        return res.status(400).json({ error: 'body thiếu state' });
      }
      const current = Number(await kv.get(VERSION_KEY)) || 0;
      const newVersion = current + 1;
      await Promise.all([
        kv.set(STATE_KEY, body.state),
        kv.set(VERSION_KEY, newVersion)
      ]);
      return res.status(200).json({ ok: true, version: newVersion });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (err) {
    console.error('[state.js]', err);
    return res.status(500).json({ error: err.message });
  }
};
