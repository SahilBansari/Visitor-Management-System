#!/usr/bin/env node

/**
 * Verify Photo & Document URLs Fix
 * Check specific requests to confirm URLs are now present
 */

const http = require('http');

const API_BASE_URL = 'http://localhost:3001';

function makeRequest(method, endpoint) {
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
    req.end();
  });
}

async function verifyFix() {
  console.log('\n✅ VERIFYING PHOTO & DOCUMENT URL FIX\n');
  console.log('='.repeat(70));

  try {
    // Fetch all visitor requests
    const res = await makeRequest('GET', `${API_BASE_URL}/visitors/requests`);

    if (res.status !== 200) {
      console.error('❌ Failed to fetch requests:', res.data);
      return;
    }

    const requests = res.data.data || [];
    console.log(`\n📊 Total Requests: ${requests.length}`);

    // Check specific requests
    const targetsToCheck = [51, 68, 70, 73, 75];
    console.log('\n📋 Checking specific requests:');
    console.log('='.repeat(70));

    for (const targetId of targetsToCheck) {
      const req = requests.find(r => r.request_id === targetId);
      if (req) {
        console.log(`\n✅ Request ID ${targetId}:`);
        console.log(`   Visitor Name: ${req.visitor_name}`);
        console.log(`   Visitor ID: ${req.visitor_id}`);
        console.log(`   Photo URL: ${req.visitor_photo_url ? '✅ ' + req.visitor_photo_url : '❌ NULL'}`);
        console.log(`   Document URL: ${req.document_url ? '✅ ' + req.document_url : '❌ NULL'}`);
      }
    }

    // Summary statistics
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 Summary Statistics:');
    const withPhotos = requests.filter(r => r.visitor_photo_url).length;
    const withDocs = requests.filter(r => r.document_url).length;
    const withBoth = requests.filter(r => r.visitor_photo_url && r.document_url).length;

    console.log(`   Total Requests: ${requests.length}`);
    console.log(`   With Photos: ${withPhotos} (${((withPhotos / requests.length) * 100).toFixed(1)}%)`);
    console.log(`   With Documents: ${withDocs} (${((withDocs / requests.length) * 100).toFixed(1)}%)`);
    console.log(`   With Both: ${withBoth} (${((withBoth / requests.length) * 100).toFixed(1)}%)`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ VERIFICATION COMPLETE\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

verifyFix();
