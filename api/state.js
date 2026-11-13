// api/state.js — Vercel serverless endpoint để đồng bộ dữ liệu giải Pickleball
// GET  /api/state           → trả về {state, version} (công khai cho Vận động viên & Khán giả)
// POST /api/state           → ghi state mới, xác thực quyền Admin HOẶC Trọng tài

const { kv } = require('@vercel/kv');
const crypto = require('crypto');

const STATE_KEY = 'pkl-qt-2026-state';
const VERSION_KEY = 'pkl-qt-2026-version';

function hashPw(pw, salt) {
  return crypto.createHash('sha256').update(salt + pw).digest('hex');
}

module.exports = async function handler(req, res) {
  // CORS cho phép mở từ bất kỳ domain nào xem
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token, x-auth-user, x-auth-role');
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
      const user = req.headers['x-auth-user'];
      const expectedAdminPass = process.env.ADMIN_PASSWORD;

      let isAuthorized = false;

      // 1. Khớp mật khẩu ADMIN_PASSWORD cấu hình trên Vercel
      if (expectedAdminPass && token === expectedAdminPass) {
        isAuthorized = true;
      }

      // 2. Khớp mật khẩu Admin mặc định
      if (!isAuthorized && token === 'Antam2025@') {
        isAuthorized = true;
      }

      // 3. Xác thực tài khoản Admin hoặc Trọng tài từ dữ liệu trên KV
      if (!isAuthorized && token && user) {
        const existingState = await kv.get(STATE_KEY);
        const username = String(user).toLowerCase().trim();
        const acc = existingState?.auth?.accounts?.[username];
        if (acc && acc.salt && acc.hash) {
          if (hashPw(token, acc.salt) === acc.hash) {
            if (acc.role === 'admin' || acc.role === 'referee') {
              isAuthorized = true;
            }
          }
        }
      }

      if (!isAuthorized) {
        return res.status(401).json({ error: 'unauthorized: sai thông tin xác thực quản trị hoặc trọng tài' });
      }

      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch(e) {}
      }
      if (!body || typeof body.state !== 'object') {
        return res.status(400).json({ error: 'body thiếu state' });
      }

      const currentVer = Number(await kv.get(VERSION_KEY)) || 0;
      const newVersion = currentVer + 1;
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
