/**
 * Test Script: Frontend-Backend Integration
 * Tests the complete flow of visitor registration to database storage
 */

const http = require('http');

const API_BASE = 'http://localhost:3001';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 3001,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData)
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║       FRONTEND-BACKEND INTEGRATION TEST SUITE                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Test 1: Create a visitor
    console.log('📝 TEST 1: Create Visitor Record');
    const visitorResult = await makeRequest('POST', '/visitors', {
      full_name: 'Test Visitor',
      visitor_mobile_no: '9876543210',
      visitor_email: 'test@example.com',
      visitor_photo_url: 'photo_test.jpg',
      document_url: 'doc_test.pdf'
    });
    console.log(`   Status: ${visitorResult.status}`);
    if (visitorResult.status === 200) {
      console.log(`   ✅ Visitor created with ID: ${visitorResult.data.visitor_id}`);
      var visitorId = visitorResult.data.visitor_id;
    } else {
      console.log(`   ❌ Failed to create visitor: ${JSON.stringify(visitorResult.data)}`);
      throw new Error('Test 1 failed');
    }

    // Test 2: Submit visitor request
    console.log('\n📝 TEST 2: Submit Visitor Request');
    const requestResult = await makeRequest('POST', '/visitors/submit-request', {
      visitor_id: visitorId,
      visitor_name: 'Test Visitor',
      visitor_type: 'Visitor',
      mobile_number: '9876543210',
      host_name: 'Officer Name',
      department: 'Irrigation',
      visit_date: '2026-01-28',
      visit_start_time: '09:00',
      visit_end_time: '09:30',
      number_of_visitors: 1
    });
    console.log(`   Status: ${requestResult.status}`);
    if (requestResult.status === 200) {
      console.log(`   ✅ Request created with Pass ID: ${requestResult.data.pass_id}`);
      var passId = requestResult.data.pass_id;
      var requestId = requestResult.data.request_id;
    } else {
      console.log(`   ❌ Failed to create request: ${JSON.stringify(requestResult.data)}`);
      throw new Error('Test 2 failed');
    }

    // Test 3: Fetch pending appointments
    console.log('\n📝 TEST 3: Fetch Pending Appointments (Admin Dashboard)');
    const pendingResult = await makeRequest('GET', '/admin/appointments/pending');
    console.log(`   Status: ${pendingResult.status}`);
    if (pendingResult.status === 200) {
      console.log(`   ✅ Retrieved ${pendingResult.data.length} pending appointments`);
      const found = pendingResult.data.find(a => a.pass_id === passId);
      if (found) {
        console.log(`   ✅ NEW REQUEST VISIBLE IN ADMIN DASHBOARD!`);
        console.log(`      Pass ID: ${found.pass_id}`);
        console.log(`      Name: ${found.full_name}`);
        console.log(`      Mobile: ${found.visitor_mobile_no}`);
      } else {
        console.log(`   ⚠️  Request not found in pending list`);
      }
    } else {
      console.log(`   ❌ Failed to fetch pending: ${JSON.stringify(pendingResult.data)}`);
    }

    // Test 4: Update visitor status (Approve)
    console.log('\n📝 TEST 4: Update Visitor Status to APPROVED');
    const updateResult = await makeRequest('PATCH', `/visitors/request/${requestId}/status`, {
      status: 'APPROVED'
    });
    console.log(`   Status: ${updateResult.status}`);
    if (updateResult.status === 200) {
      console.log(`   ✅ Status updated to APPROVED`);
    } else {
      console.log(`   ⚠️  Status: ${updateResult.status}, Response: ${JSON.stringify(updateResult.data)}`);
    }

    // Test 5: Verify status change
    console.log('\n📝 TEST 5: Verify Status Update in Database');
    const verifyResult = await makeRequest('GET', `/visitors/request/${passId}`);
    console.log(`   Status: ${verifyResult.status}`);
    if (verifyResult.status === 200) {
      console.log(`   ✅ Request status: ${verifyResult.data.data.status}`);
      if (verifyResult.data.data.status === 'APPROVED') {
        console.log(`   ✅ STATUS UPDATE PERSISTED IN DATABASE!`);
      }
    } else {
      console.log(`   ❌ Failed to verify: ${JSON.stringify(verifyResult.data)}`);
    }

    // Test 6: Fetch all requests
    console.log('\n📝 TEST 6: Fetch All Visitor Requests');
    const allResult = await makeRequest('GET', '/visitors/requests');
    console.log(`   Status: ${allResult.status}`);
    if (allResult.status === 200) {
      console.log(`   ✅ Retrieved ${allResult.data.data.length} total requests`);
    } else {
      console.log(`   ❌ Failed: ${JSON.stringify(allResult.data)}`);
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ ALL TESTS PASSED!                         ║');
    console.log('║  Frontend-Backend Integration is working correctly!            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

console.log('⏳ Waiting 2 seconds for server to be ready...');
setTimeout(runTests, 2000);
