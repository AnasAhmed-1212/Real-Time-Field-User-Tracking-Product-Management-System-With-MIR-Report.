// Local API double: browser tests exercise the real Next.js proxy without production data.
import { createServer } from 'node:http';

let collections;
let profile;
let settings;
let failure;
const reset = () => {
  collections = { 'field-users': [], products: [], releases: [] };
  profile = { id: 'admin-1', name: 'Test Administrator', email: 'admin@example.com', role: 'Administrator' };
  settings = {
    organization: { companyName: 'Test Company', administratorEmail: 'admin@example.com' },
    tracking: { enabled: true, highAccuracy: true, updateIntervalSeconds: 30, inactiveAfterMinutes: 5, staleAfterMinutes: 15 },
    attendance: { workdayStarts: '09:00', workdayEnds: '18:00', lateGraceMinutes: 15, minimumFullDayHours: 8, requireLocationForCheckIn: true },
    security: { administratorSessionMinutes: 60 },
    data: { maximumImageUploadMb: 5 },
  };
  failure = null;
};
reset();

createServer(async (req, res) => {
  const reply = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json', 'X-Request-Id': 'crud-test' });
    res.end(status === 204 ? undefined : JSON.stringify(data));
  };
  let raw = '';
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  if (req.url === '/__test/reset') { reset(); return reply(200, {}); }
  if (req.url === '/__test/failure') { failure = body; return reply(200, {}); }
  if (req.headers.authorization !== 'Bearer test-session') return reply(401, { message: 'Authentication required' });
  if (raw && !req.headers['content-type']?.includes('application/json')) return reply(415, { message: 'JSON required' });
  const [, api, admin, resource, id, action] = new URL(req.url, 'http://localhost').pathname.split('/');
  if (api !== 'api' || admin !== 'admin') return reply(404, { message: 'Route not found' });
  if (failure && req.method !== 'GET') return reply(failure.status, { message: failure.message });
  if (resource === 'profile') {
    if (req.method === 'PATCH') profile = { ...profile, ...body };
    return reply(200, profile);
  }
  if (resource === 'settings') {
    if (req.method === 'PUT') settings = body;
    return reply(200, settings);
  }
  const rows = collections[resource];
  if (!rows) return reply(404, { message: 'Route not found' });
  if (req.method === 'GET') return reply(200, rows);
  if (req.method === 'POST' && !id) {
    const row = { ...body, id: String(rows.length + 1), databaseId: String(rows.length + 1), active: false, online: false, lastLocation: null, lastSeenAt: null, publishedAt: new Date().toISOString() };
    if (resource !== 'releases') row.active = true;
    rows.push(row);
    return reply(201, row);
  }
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) return reply(404, { message: 'Record not found' });
  if (req.method === 'DELETE') { rows.splice(index, 1); return reply(204); }
  if (req.method === 'POST' && action === 'reset-password') return reply(200, { id, passwordReset: true });
  if (req.method === 'PATCH') {
    rows[index] = { ...rows[index], ...body, ...(action === 'activate' ? { active: true } : {}) };
    return reply(200, rows[index]);
  }
  return reply(405, { message: 'Method not allowed' });
}).listen(4319, '127.0.0.1');
