#!/usr/bin/env node

/**
 * Test FTP File Serving
 * Check if files are accessible via HTTP endpoint
 */

const http = require('http');

const API_BASE_URL = 'http://localhost:3001';

function makeRequest(method, url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => (responseData += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, size: responseData.length, data: responseData.substring(0, 100) });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testFileServing() {
  console.log('\n🔍 TESTING FTP FILE SERVING\n');
  console.log('='.repeat(70));

  const filesToTest = [
    '/ftp/files/vms/photos/captured_photo_1769940537976.jpg',
    '/ftp/files/vms/documents/Screenshot 2025-07-12 115204_1769940530354.png',
  ];

  for (const filePath of filesToTest) {
    try {
      const url = API_BASE_URL + filePath;
      console.log(`\n📥 Testing: ${filePath}`);
      console.log(`   URL: ${url}`);
      
      const result = await makeRequest('GET', url);
      
      console.log(`   Status: ${result.status}`);
      console.log(`   Content-Type: ${result.headers['content-type']}`);
      console.log(`   Size: ${result.size} bytes`);
      
      if (result.status === 200) {
        console.log(`   ✅ File is accessible!`);
      } else if (result.status === 404) {
        console.log(`   ❌ File not found (404)`);
      } else {
        console.log(`   ⚠️  Status: ${result.status}`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ TESTING COMPLETE\n');
}

testFileServing();
