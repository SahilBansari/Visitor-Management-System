const http = require('http');

const BASE_URL = 'http://localhost:3001';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testFlow() {
  console.log('\n🔐 Testing Frontend Authentication Flow\n');
  
  // Step 1: Login
  console.log('1️⃣ Attempting login...');
  try {
    const loginRes = await makeRequest('POST', '/auth/login', {
      email: 'admin@vms.local',
      password: 'admin123'
    });
    
    console.log('   Status:', loginRes.status);
    console.log('   Response:', JSON.stringify(loginRes.body, null, 2));
    
    if (loginRes.status !== 200) {
      console.log('   ❌ Login failed!');
      return;
    }
    
    const token = loginRes.body?.access_token;
    if (!token) {
      console.log('   ❌ No token returned!');
      return;
    }
    
    console.log('   ✅ Token obtained:', token.substring(0, 20) + '...');

    // Step 2: Call admin endpoints with token
    console.log('\n2️⃣ Calling /admin/requests with token...');
    const adminReq1 = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/admin/requests',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        console.log('   Status:', res.statusCode);
        if (res.statusCode === 200) {
          const parsed = JSON.parse(data);
          console.log('   ✅ Success! Found', parsed.length, 'records');
          console.log('   Sample:', parsed.length > 0 ? JSON.stringify(parsed[0], null, 2) : 'none');
        } else {
          console.log('   ❌ Error:', data);
        }
        
        // Step 3: Try pending appointments
        console.log('\n3️⃣ Calling /admin/appointments/pending with token...');
        const adminReq2 = http.request({
          hostname: 'localhost',
          port: 3001,
          path: '/admin/appointments/pending',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => {
            console.log('   Status:', res.statusCode);
            if (res.statusCode === 200) {
              const parsed = JSON.parse(data);
              console.log('   ✅ Success! Found', parsed.length, 'records');
              console.log('   Sample:', parsed.length > 0 ? JSON.stringify(parsed[0], null, 2) : 'none');
            } else {
              console.log('   ❌ Error:', data);
            }
          });
        });
        adminReq2.on('error', console.error);
        adminReq2.end();
      });
    });

    adminReq1.on('error', console.error);
    adminReq1.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFlow();
