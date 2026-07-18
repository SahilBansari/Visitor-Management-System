#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing FTP Endpoints...\n');

const endpoints = [
  { method: 'GET', path: '/ftp/test', name: 'Test FTP Connection' },
  { method: 'GET', path: '/ftp/status', name: 'Get Connection Status' },
  { method: 'GET', path: '/ftp/list-files', name: 'List FTP Files' },
  { method: 'GET', path: '/ftp/debug/check-images', name: 'Check Database Images' },
];

async function testEndpoint(method, path, name) {
  return new Promise((resolve) => {
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
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✅ ${name}`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Response:`, JSON.stringify(json, null, 2));
        } catch (e) {
          console.log(`⚠️ ${name}`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Response: ${data}`);
        }
        console.log('');
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error(`❌ ${name}`);
      console.error(`   Error: ${err.message}`);
      console.log('');
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing FTP Configuration:\n');
  console.log('FTP_HOST: ftp.avanyatech.com');
  console.log('FTP_PORT: 21');
  console.log('FTP_USER: dms@avanyatech.com');
  console.log('FTP_PASSWORD: Orbit@123');
  console.log('Upload Path: /vms\n');
  console.log('=' .repeat(60));
  console.log('');

  for (const endpoint of endpoints) {
    await testEndpoint(endpoint.method, endpoint.path, endpoint.name);
  }

  console.log('=' .repeat(60));
  console.log('✅ Testing complete!');
}

runTests().catch(console.error);
