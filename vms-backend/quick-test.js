// Simple test - login and call admin endpoints
const https = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:3001');
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  try {
    console.log('1. Logging in...');
    const login = await request('POST', '/auth/login', { email: 'admin@nic.in', password: 'admin' });
    console.log('Status:', login.status);
    if (login.status !== 200) {
      console.log('Login failed:', login.data);
      return;
    }
    const token = login.data.access_token;
    console.log('✅ Token:', token.substring(0, 30) + '...\n');

    console.log('2. Calling /admin/requests...');
    const req = await request('GET', '/admin/requests', null, token);
    console.log('Status:', req.status);
    console.log('Count:', req.data.length);
    console.log('Sample:', req.data.length > 0 ? req.data[0] : 'none');

    console.log('\n3. Calling /admin/appointments/pending...');
    const pending = await request('GET', '/admin/appointments/pending', null, token);
    console.log('Status:', pending.status);
    console.log('Count:', pending.data.length);
    console.log('Sample:', pending.data.length > 0 ? pending.data[0] : 'none');

  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
})();
