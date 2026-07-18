const http = require('http');

const API_BASE = 'http://localhost:3001';

// Simple HTTP request wrapper
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, ok: res.statusCode >= 200 && res.statusCode < 300 });
        } catch (e) {
          resolve({ status: res.statusCode, data: { error: data }, ok: false });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test the PATCH /visitors/request/:id endpoint with the fix
async function testEditFix() {
  console.log('\n🧪 Testing PATCH /visitors/request/:id endpoint\n');

  try {
    // First, create a test request
    console.log('1️⃣ Creating a test visitor request...');
    const createResponse = await makeRequest('POST', '/visitors/submit-request', {
      visitor_name: 'Test Visitor',
      visitor_type: 'Visitor',
      mobile_number: '9876543210',
      host_name: 'Officer Name',
      department: 'IT',
      visit_date: '2026-02-01',
      visit_start_time: '10:00:00',
      visit_end_time: '11:00:00',
      number_of_visitors: 1
    });

    const requestId = createResponse.data.request_id;
    console.log(`✅ Created request ID: ${requestId}\n`);

    // Test 1: Valid update with one field
    console.log('2️⃣ Test 1: Update visitor_name only');
    const test1Response = await makeRequest('PATCH', `/visitors/request/${requestId}`, {
      visitor_name: 'Updated Name'
    });
    console.log(`Status: ${test1Response.status}`);
    console.log(`Response:`, test1Response.data);
    console.log(`${test1Response.ok ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 2: Valid update with multiple fields
    console.log('3️⃣ Test 2: Update multiple fields');
    const test2Response = await makeRequest('PATCH', `/visitors/request/${requestId}`, {
      visitor_name: 'Another Name',
      visit_start_time: '14:00:00',
      visit_end_time: '15:00:00'
    });
    console.log(`Status: ${test2Response.status}`);
    console.log(`Response:`, test2Response.data);
    console.log(`${test2Response.ok ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 3: Invalid update with all empty fields
    console.log('4️⃣ Test 3: Update with all empty fields (should fail)');
    const test3Response = await makeRequest('PATCH', `/visitors/request/${requestId}`, {
      visitor_name: '',
      visitor_type: '',
      visit_start_time: '',
      visit_end_time: ''
    });
    console.log(`Status: ${test3Response.status}`);
    console.log(`Response:`, test3Response.data);
    console.log(`${!test3Response.ok ? '✅ PASS (correctly rejected)' : '❌ FAIL (should have failed)'}\n`);

    // Test 4: Invalid request ID
    console.log('5️⃣ Test 4: Invalid request ID (should fail)');
    const test4Response = await makeRequest('PATCH', '/visitors/request/invalid-id', {
      visitor_name: 'Test'
    });
    console.log(`Status: ${test4Response.status}`);
    console.log(`Response:`, test4Response.data);
    console.log(`${!test4Response.ok ? '✅ PASS (correctly rejected)' : '❌ FAIL (should have failed)'}\n`);

    // Test 5: Nonexistent request ID
    console.log('6️⃣ Test 5: Nonexistent request ID (should fail)');
    const test5Response = await makeRequest('PATCH', '/visitors/request/99999', {
      visitor_name: 'Test'
    });
    console.log(`Status: ${test5Response.status}`);
    console.log(`Response:`, test5Response.data);
    console.log(`${!test5Response.ok ? '✅ PASS (correctly rejected)' : '❌ FAIL (should have failed)'}\n`);

    console.log('🎉 All tests completed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

testEditFix();
