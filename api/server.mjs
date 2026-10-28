// Contact-form API for techadastra.com.
//   POST /api/contact     store an enquiry (JSON body from the site's contact form)
//   GET  /api/messages    list enquiries — needs  Authorization: Bearer $ADMIN_TOKEN
//   GET  /api/health
// Settings come from the environment: DATABASE_URL, ADMIN_TOKEN, PORT.

import http from 'node:http';
import { connect } from './db.mjs';

const PORT = Number(process.env.PORT || 3000);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const db = await connect(process.env.DATABASE_URL);

// Field → max length. Anything longer is rejected rather than silently cut.
const FIELDS = { name: 200, email: 254, phone: 50, language: 50, interest: 200, message: 5000, page: 500 };
const REQUIRED = ['name', 'email', 'message'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// At most 5 enquiries per IP per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const hits = new Map();
const limited = (ip) => {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
};
setInterval(() => {
  const now = Date.now();
  for (const [ip, ts] of hits) if (ts.every((t) => now - t >= WINDOW_MS)) hits.delete(ip);
}, WINDOW_MS).unref();

const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};

const readJson = (req) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > 64 * 1024) { reject(Object.assign(new Error('too large'), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch { reject(Object.assign(new Error('invalid json'), { status: 400 })); }
    });
    req.on('error', reject);
  });

async function createMessage(req, res) {
  const ip = String(req.headers['x-real-ip'] || req.socket.remoteAddress || '');
  if (limited(ip)) return send(res, 429, { error: 'too_many_requests' });

  const body = await readJson(req);
  if (body._gotcha) return send(res, 200, { ok: true }); // honeypot filled: pretend success

  const data = {};
  for (const [k, max] of Object.entries(FIELDS)) {
    const v = typeof body[k] === 'string' ? body[k].trim() : '';
    if (v.length > max) return send(res, 422, { error: 'too_long', field: k });
    data[k] = v;
  }
  const missing = REQUIRED.filter((k) => !data[k]);
  if (missing.length) return send(res, 422, { error: 'missing', fields: missing });
  if (!EMAIL.test(data.email)) return send(res, 422, { error: 'invalid', field: 'email' });

  const id = await db.insert({ ...data, ip, user_agent: String(req.headers['user-agent'] || '').slice(0, 500) });
  console.log(`contact #${id} from ${data.email}`);
  send(res, 201, { ok: true, id });
}

async function listMessages(req, res) {
  const auth = req.headers.authorization || '';
  if (!ADMIN_TOKEN || auth !== `Bearer ${ADMIN_TOKEN}`) return send(res, 401, { error: 'unauthorized' });
  send(res, 200, await db.list(200));
}

const server = http.createServer(async (req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  try {
    if (req.method === 'POST' && path === '/api/contact') return await createMessage(req, res);
    if (req.method === 'GET' && path === '/api/messages') return await listMessages(req, res);
    if (req.method === 'GET' && path === '/api/health') {
      await db.ping();
      return send(res, 200, { ok: true });
    }
    send(res, 404, { error: 'not_found' });
  } catch (err) {
    if (err.status) return send(res, err.status, { error: err.message });
    console.error(err);
    send(res, 500, { error: 'server_error' });
  }
});

// The database may still be starting when the container comes up.
for (let attempt = 1; ; attempt++) {
  try {
    await db.init();
    break;
  } catch (err) {
    if (attempt >= 30) throw err;
    console.log(`waiting for database (${err.code || err.message})…`);
    await new Promise((r) => setTimeout(r, 2000));
  }
}
server.listen(PORT, () => console.log(`contact API listening on :${PORT} (${db.dialect})`));
