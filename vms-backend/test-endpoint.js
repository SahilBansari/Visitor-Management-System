const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const http = require('http');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'gmfdmmzn_vms',
});

async function testEndpoint() {
  try {
    // Create a test token
    const token = jwt.sign({ id: '1', username: 'admin' }, 'supersecretkey', { expiresIn: '1h' });
    console.log('📋 Test token:', token);
    
    // Make the request
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/admin/appointments/pending',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('✅ Response status:', res.statusCode);
        const result = JSON.parse(data);
        console.log('📊 Response data count:', result.length);
        console.log('📋 First 2 records:');
        result.slice(0, 2).forEach(r => {
          console.log(`   - Pass: ${r.pass_id}, Name: ${r.full_name}, Host: ${r.officer_name}, Status: ${r.appointment_status_name}`);
        });
        process.exit(0);
      });
    });
    
    req.on('error', (e) => {
      console.error('❌ Error:', e.message);
      process.exit(1);
    });
    
    req.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Wait a moment for server to be ready, then test
setTimeout(testEndpoint, 1000);
