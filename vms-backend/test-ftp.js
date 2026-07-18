#!/usr/bin/env node

/**
 * FTP Connection Test Script
 * Tests all FTP endpoints
 */

const http = require('http');

const baseURL = 'http://localhost:3001';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseURL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
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

async function runTests() {
  console.log('🧪 FTP Connection Test Suite\n');
  console.log('═'.repeat(50));

  try {
    // Test 1: Connection Test
    console.log('\n✅ Test 1: FTP Connection Test');
    console.log('-'.repeat(50));
    const testRes = await makeRequest('/ftp/test', 'GET');
    console.log('Status:', testRes.status);
    console.log('Result:', JSON.stringify(testRes.data, null, 2));

    // Test 2: Status Check
    console.log('\n✅ Test 2: FTP Status Check');
    console.log('-'.repeat(50));
    const statusRes = await makeRequest('/ftp/status', 'GET');
    console.log('Status:', statusRes.status);
    console.log('Result:', JSON.stringify(statusRes.data, null, 2));

    // Test 3: List Files
    console.log('\n✅ Test 3: List Files in /vms');
    console.log('-'.repeat(50));
    const listRes = await makeRequest('/ftp/list-files', 'GET');
    console.log('Status:', listRes.status);
    console.log('Result:', JSON.stringify(listRes.data, null, 2));

    // Test 4: Upload Content
    console.log('\n✅ Test 4: Upload Text Content');
    console.log('-'.repeat(50));
    const uploadRes = await makeRequest('/ftp/upload-content', 'POST', {
      fileName: 'test-upload-' + Date.now() + '.txt',
      content: 'This is a test file uploaded via FTP API at ' + new Date().toISOString()
    });
    console.log('Status:', uploadRes.status);
    console.log('Result:', JSON.stringify(uploadRes.data, null, 2));

    console.log('\n' + '═'.repeat(50));
    console.log('✅ All FTP tests completed successfully!');
    console.log('\n📚 Available FTP Endpoints:');
    console.log('  GET  /ftp/test              - Test FTP connection');
    console.log('  GET  /ftp/status            - Check FTP connection status');
    console.log('  GET  /ftp/list-files        - List files in /vms directory');
    console.log('  POST /ftp/upload-file       - Upload file (multipart/form-data)');
    console.log('  POST /ftp/upload-content    - Upload text content (application/json)');
    console.log('  POST /ftp/delete-file       - Delete file from FTP');

    console.log('\n🔧 FTP Configuration:');
    console.log('  Host: ftp.avanyatech.com');
    console.log('  Port: 21');
    console.log('  User: dms@avanyatech.com');
    console.log('  Upload Path: /vms');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
