#!/usr/bin/env node
/**
 * Visitor Request API Integration Test
 * Tests the complete visitor request submission and retrieval workflow
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
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
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 Starting Visitor Request API Tests...\n');

  try {
    // Test 1: Submit a visitor request
    console.log('1️⃣  Testing POST /visitors/submit-request');
    const submitRes = await makeRequest('POST', '/visitors/submit-request', {
      visitor_name: 'Ramesh Gupta',
      visitor_type: 'Vendor',
      mobile_number: '9876543210',
      host_name: 'Officer Sharma',
      department: 'Irrigation',
      visit_date: '2024-01-20',
      visit_start_time: '09:00:00',
      visit_end_time: '09:30:00',
      number_of_visitors: 1
    });
    
    if (submitRes.status === 201) {
      console.log('✅ Request submitted successfully');
      console.log('   Pass ID:', submitRes.data.pass_id);
      console.log('   Request ID:', submitRes.data.request_id);
    } else {
      console.log('❌ Failed to submit request:', submitRes.data);
    }

    // Test 2: Get all pending requests
    console.log('\n2️⃣  Testing GET /visitors/requests?status=PENDING');
    const pendingRes = await makeRequest('GET', '/visitors/requests?status=PENDING');
    
    if (pendingRes.status === 200) {
      console.log('✅ Fetched pending requests');
      console.log('   Count:', pendingRes.data.length);
      if (pendingRes.data.length > 0) {
        console.log('   First request:', pendingRes.data[0].visitor_name);
      }
    } else {
      console.log('❌ Failed to fetch pending requests:', pendingRes.data);
    }

    // Test 3: Get specific request by pass ID
    if (submitRes.data.pass_id) {
      console.log('\n3️⃣  Testing GET /visitors/request/:passId');
      const getRes = await makeRequest('GET', `/visitors/request/${submitRes.data.pass_id}`);
      
      if (getRes.status === 200) {
        console.log('✅ Fetched specific request');
        console.log('   Visitor:', getRes.data.visitor_name);
        console.log('   Status:', getRes.data.status);
      } else {
        console.log('❌ Failed to fetch request:', getRes.data);
      }
    }

    // Test 4: Update request status
    if (submitRes.data.request_id) {
      console.log('\n4️⃣  Testing PATCH /visitors/request/:requestId/status');
      const updateRes = await makeRequest('PATCH', `/visitors/request/${submitRes.data.request_id}/status`, {
        status: 'APPROVED'
      });
      
      if (updateRes.status === 200) {
        console.log('✅ Request status updated to APPROVED');
      } else {
        console.log('❌ Failed to update status:', updateRes.data);
      }
    }

    // Test 5: Verify status update
    console.log('\n5️⃣  Verifying status update');
    const verifyRes = await makeRequest('GET', '/visitors/requests?status=APPROVED');
    
    if (verifyRes.status === 200) {
      console.log('✅ Fetched approved requests');
      console.log('   Count:', verifyRes.data.length);
    } else {
      console.log('❌ Failed to fetch approved requests:', verifyRes.data);
    }

    console.log('\n✨ All tests completed!\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run tests
runTests();
