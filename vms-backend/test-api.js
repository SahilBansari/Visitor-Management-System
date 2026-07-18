#!/usr/bin/env node
const http = require('http');

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    
    const r = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(d) });
        } catch {
          resolve({ status: res.statusCode, data: d });
        }
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

(async () => {
  try {
    console.log('1️⃣ LOGIN');
    const login = await req('POST', '/auth/login', { email: 'admin@nic.in', password: 'admin' });
    console.log('   Status:', login.status, login.status === 200 ? '✅' : '❌');
    if (login.status !== 200) { console.log('Error:', login.data); return; }
    const token = login.data.access_token;
    console.log('   Token:', token.substring(0, 25) + '...\n');

    console.log('2️⃣ GET /admin/requests');
    const r1 = await req('GET', '/admin/requests', null, token);
    console.log('   Status:', r1.status, r1.status === 200 ? '✅' : '❌');
    console.log('   Records:', r1.data.length);
    if (r1.data.length > 0) console.log('   Sample:', r1.data[0].full_name, r1.data[0].visitor_mobile_no, r1.data[0].appointment_status_name);

    console.log('\n3️⃣ GET /admin/appointments/pending');
    const r2 = await req('GET', '/admin/appointments/pending', null, token);
    console.log('   Status:', r2.status, r2.status === 200 ? '✅' : '❌');
    console.log('   Records:', r2.data.length);
    if (r2.data.length > 0) console.log('   Sample:', r2.data[0].full_name, r2.data[0].visitor_mobile_no);

    process.exit(0);
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
