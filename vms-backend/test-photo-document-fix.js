#!/usr/bin/env node

/**
 * Test Photo & Document URL Fix
 * Verifies that visitor_photo_url and document_url are properly stored
 * and returned through the visitor request API
 */

const http = require('http');

const API_BASE_URL = 'http://localhost:3001';

function makeRequest(method, endpoint, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => (responseData += chunk));
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

async function testPhotoDocumentFix() {
  console.log('\n📸 TESTING PHOTO & DOCUMENT URL FIX\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Create a visitor with photo and document URLs
    console.log('\n✅ Step 1: Creating visitor with photo and document URLs...');
    const visitorRes = await makeRequest('POST', `${API_BASE_URL}/visitors`, {
      full_name: 'Test Visitor ' + Date.now(),
      visitor_mobile_no: '9999999999',
      visitor_email: 'test@example.com',
      visitor_photo_url: '/vms/photos/PHOTO_TestVisitor_1234567890.jpg',
      document_url: '/vms/documents/ID_PROOF_TestVisitor_1234567890.pdf',
    });

    console.log('   Response Status:', visitorRes.status);
    console.log('   Visitor ID:', visitorRes.data.visitor_id);
    console.log('   Stored Photo URL:', visitorRes.data.visitor_photo_url);

    if (visitorRes.status !== 200) {
      console.error('❌ Failed to create visitor:', visitorRes.data);
      return;
    }

    const visitorId = visitorRes.data.visitor_id;

    // Step 2: Submit visitor request with photo and document URLs
    console.log('\n✅ Step 2: Submitting visitor request...');
    const requestRes = await makeRequest(
      'POST',
      `${API_BASE_URL}/visitors/submit-request`,
      {
        visitor_name: 'Test Visitor ' + Date.now(),
        visitor_type: 'Vendor',
        mobile_number: '9999999999',
        host_name: 'Rajesh Kumar',
        department: 'Hydrology Division',
        visit_date: new Date().toISOString().split('T')[0],
        visit_start_time: '09:00:00',
        visit_end_time: '09:30:00',
        number_of_visitors: 1,
        visitor_id: visitorId,
        visitor_photo_url: '/vms/photos/PHOTO_TestVisitor_1234567890.jpg',
        document_url: '/vms/documents/ID_PROOF_TestVisitor_1234567890.pdf',
      }
    );

    console.log('   Response Status:', requestRes.status);
    console.log('   Pass ID:', requestRes.data.pass_id);
    console.log('   Request ID:', requestRes.data.request_id);
    console.log('   Photo URL in response:', requestRes.data.visitor_photo_url);
    console.log('   Document URL in response:', requestRes.data.document_url);

    if (requestRes.status !== 200) {
      console.error('❌ Failed to submit request:', requestRes.data);
      return;
    }

    // Step 3: Fetch the request and verify URLs are present
    console.log('\n✅ Step 3: Fetching visitor requests...');
    const getRes = await makeRequest('GET', `${API_BASE_URL}/visitors/requests`);

    console.log('   Response Status:', getRes.status);
    console.log('   Total Requests:', getRes.data.count);

    if (getRes.data.data && getRes.data.data.length > 0) {
      const latestRequest = getRes.data.data[0];
      console.log('\n📋 Latest Request Details:');
      console.log('   Request ID:', latestRequest.request_id);
      console.log('   Visitor Name:', latestRequest.visitor_name);
      console.log('   Visitor ID:', latestRequest.visitor_id);
      console.log('   Photo URL:', latestRequest.visitor_photo_url);
      console.log('   Document URL:', latestRequest.document_url);

      // Verification
      console.log('\n🔍 VERIFICATION:');
      if (latestRequest.visitor_photo_url) {
        console.log('   ✅ Photo URL is present:', latestRequest.visitor_photo_url);
      } else {
        console.log('   ❌ Photo URL is NULL or empty');
      }

      if (latestRequest.document_url) {
        console.log('   ✅ Document URL is present:', latestRequest.document_url);
      } else {
        console.log('   ❌ Document URL is NULL or empty');
      }

      if (latestRequest.visitor_id === visitorId) {
        console.log('   ✅ Visitor ID is correctly linked:', latestRequest.visitor_id);
      } else {
        console.log('   ❌ Visitor ID mismatch. Expected:', visitorId, 'Got:', latestRequest.visitor_id);
      }
    } else {
      console.log('❌ No requests found');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST COMPLETED\n');
  } catch (err) {
    console.error('❌ Test Error:', err.message);
  }
}

// Run the test
testPhotoDocumentFix();
