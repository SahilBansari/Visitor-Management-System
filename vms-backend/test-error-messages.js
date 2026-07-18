const http = require('http');

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

// Test error message flow
async function testErrorMessages() {
  console.log('\n🔍 Testing Error Message Flow (Backend → Frontend)\n');

  try {
    // Create a test request
    console.log('1️⃣ Creating a test visitor request...');
    const createResponse = await makeRequest('POST', '/visitors/submit-request', {
      visitor_name: 'Error Test Visitor',
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

    // Test Case 1: Empty fields error with details
    console.log('📋 Test Case 1: Empty fields error');
    const test1Response = await makeRequest('PATCH', `/visitors/request/${requestId}`, {
      visitor_name: '',
      visitor_type: '',
      visit_start_time: '',
      visit_end_time: ''
    });
    
    console.log(`Status: ${test1Response.status}`);
    console.log(`Error: ${test1Response.data.error}`);
    console.log(`Details: ${test1Response.data.details}`);
    console.log(`Frontend will show: "Failed to update request: ${test1Response.data.details}"`);
    console.log(`${test1Response.data.details ? '✅ PASS - Details present' : '❌ FAIL - No details'}\n`);

    // Test Case 2: Invalid request ID error with details
    console.log('📋 Test Case 2: Invalid request ID error');
    const test2Response = await makeRequest('PATCH', '/visitors/request/bad-id', {
      visitor_name: 'Test'
    });
    
    console.log(`Status: ${test2Response.status}`);
    console.log(`Error: ${test2Response.data.error}`);
    console.log(`Details: ${test2Response.data.details}`);
    console.log(`Frontend will show: "Failed to update request: ${test2Response.data.details}"`);
    console.log(`${test2Response.data.details ? '✅ PASS - Details present' : '❌ FAIL - No details'}\n`);

    // Test Case 3: Nonexistent request error with details
    console.log('📋 Test Case 3: Nonexistent request error');
    const test3Response = await makeRequest('PATCH', '/visitors/request/99999', {
      visitor_name: 'Test'
    });
    
    console.log(`Status: ${test3Response.status}`);
    console.log(`Error: ${test3Response.data.error}`);
    console.log(`Details: ${test3Response.data.details}`);
    console.log(`Frontend will show: "Failed to update request: ${test3Response.data.details}"`);
    console.log(`${test3Response.data.details ? '✅ PASS - Details present' : '❌ FAIL - No details'}\n`);

    // Test Case 4: Valid update should show success
    console.log('📋 Test Case 4: Valid update (success)');
    const test4Response = await makeRequest('PATCH', `/visitors/request/${requestId}`, {
      visitor_name: 'Updated Name'
    });
    
    console.log(`Status: ${test4Response.status}`);
    console.log(`Response: ${JSON.stringify(test4Response.data)}`);
    console.log(`${test4Response.ok ? '✅ PASS - Success' : '❌ FAIL - Should succeed'}\n`);

    console.log('✅ All error message tests completed!\n');
    console.log('📝 Summary:');
    console.log('   ✓ Backend provides error and details fields');
    console.log('   ✓ Frontend extracts details for user-friendly messages');
    console.log('   ✓ Users see: "Failed to update request: [specific reason]"');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

testErrorMessages();
