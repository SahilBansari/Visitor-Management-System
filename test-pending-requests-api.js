const http = require('http');

function makeRequest(method, path, data = null) {
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
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        console.log(`${method} ${path} - Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(responseData);
          resolve(json);
        } catch {
          resolve(responseData);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing Visitor Requests API\n');

  try {
    // Test 1: Get all pending requests
    console.log('📍 Test 1: Fetching /visitors/requests?status=PENDING');
    console.log('─'.repeat(60));
    const response = await makeRequest('GET', '/visitors/requests?status=PENDING');
    
    console.log('\n📦 Response Structure:');
    console.log(`  - success: ${response.success}`);
    console.log(`  - count: ${response.count}`);
    console.log(`  - data type: ${Array.isArray(response.data) ? 'Array' : typeof response.data}`);
    
    if (response.data && response.data.length > 0) {
      console.log(`\n✅ Found ${response.data.length} pending requests!\n`);
      
      console.log('📋 First 3 Requests:');
      response.data.slice(0, 3).forEach((req, i) => {
        console.log(`\n  ${i + 1}. ${req.visitor_name}`);
        console.log(`     - Pass ID: ${req.pass_id}`);
        console.log(`     - Status: ${req.status}`);
        console.log(`     - Date: ${req.visit_date}`);
        console.log(`     - Time: ${req.visit_start_time} - ${req.visit_end_time}`);
        console.log(`     - Mobile: ${req.mobile_number}`);
        console.log(`     - Department: ${req.department}`);
      });
    } else {
      console.log('\n❌ No pending requests found!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ API Test Complete');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
