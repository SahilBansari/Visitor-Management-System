const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Helper function for HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test functions
async function testOfficers() {
  console.log('\n🧪 Testing Officers API\n');

  try {
    // Test 1: Get all officers
    console.log('1️⃣  GET /officers');
    const getResult = await makeRequest('GET', '/officers');
    console.log(`   Status: ${getResult.status}`);
    console.log(`   Officers count: ${Array.isArray(getResult.data) ? getResult.data.length : 0}`);
    if (getResult.data && getResult.data.length > 0) {
      console.log(`   First officer: ${getResult.data[0].name}`);
    }

    // Test 2: Add a new officer
    console.log('\n2️⃣  POST /officers (Add new officer)');
    const newOfficer = {
      name: 'Test Officer',
      rank: 'Senior Engineer',
      email: 'test@nic.in',
      phone: '+91 9876543210',
      cabin: 'ABC-101',
      department: 'Engineering'
    };
    const addResult = await makeRequest('POST', '/officers', newOfficer);
    console.log(`   Status: ${addResult.status}`);
    console.log(`   Response:`, addResult.data);

    if (addResult.status === 200 && addResult.data.success && addResult.data.officer) {
      const newOfficerId = addResult.data.officer.id;
      console.log(`   ✅ Officer added with ID: ${newOfficerId}`);

      // Test 3: Get all officers again to verify
      console.log('\n3️⃣  GET /officers (Verify new officer)');
      const getResult2 = await makeRequest('GET', '/officers');
      console.log(`   Status: ${getResult2.status}`);
      console.log(`   Officers count: ${Array.isArray(getResult2.data) ? getResult2.data.length : 0}`);

      // Test 4: Update the officer
      console.log('\n4️⃣  PUT /officers/:id (Update officer)');
      const updateData = {
        name: 'Updated Test Officer',
        rank: 'Chief Engineer',
        cabin: 'XYZ-202'
      };
      const updateResult = await makeRequest('PUT', `/officers/${newOfficerId}`, updateData);
      console.log(`   Status: ${updateResult.status}`);
      console.log(`   Updated officer:`, updateResult.data.officer);

      // Test 5: Delete/Deactivate the officer
      console.log('\n5️⃣  DELETE /officers/:id (Deactivate officer)');
      const deleteResult = await makeRequest('DELETE', `/officers/${newOfficerId}`);
      console.log(`   Status: ${deleteResult.status}`);
      console.log(`   Response:`, deleteResult.data);
    }

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOfficers();
