const jwt = require('jsonwebtoken');
const http = require('http');

// Create a valid token for testing
const token = jwt.sign(
  { id: 1, email: 'admin@example.com', role: 'admin' },
  'supersecretkey',
  { expiresIn: '1h' }
);

console.log('🔑 Generated test token:', token);
console.log('\n🔄 Testing /admin/requests endpoint...\n');

// Test the endpoint
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/admin/requests',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}`);
  console.log(`📝 Headers: ${JSON.stringify(res.headers)}\n`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        console.log(`✅ SUCCESS! Received ${parsed.length} records`);
        if (parsed.length > 0) {
          console.log('\n📊 First 3 records:');
          parsed.slice(0, 3).forEach((rec, i) => {
            console.log(`   ${i + 1}. ${rec.full_name} - Status: ${rec.appointment_status_name} - Time: ${rec.visit_start_time} - ${rec.visit_end_time}`);
          });
        }
      } else {
        console.log('❌ Response is not an array:', typeof parsed);
        console.log(data);
      }
    } catch (e) {
      console.log('❌ Failed to parse response:', e.message);
      console.log('Raw response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
  process.exit(1);
});

req.end();
