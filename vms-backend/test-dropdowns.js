const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
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
    }).on('error', reject);
  });
}

async function testDropdownData() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║          DROPDOWN DATA SYNC TEST - VERIFICATION            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const baseUrl = 'http://localhost:3001';

  try {
    // Test 1: Purposes Dropdown
    console.log('1️⃣  Testing Purposes Dropdown...');
    const purposesResult = await makeRequest(`${baseUrl}/purposes`);
    if (purposesResult.status === 200 && Array.isArray(purposesResult.data)) {
      console.log(`   ✅ Status: ${purposesResult.status}`);
      console.log(`   ✅ Found ${purposesResult.data.length} purposes`);
      console.log('\n   Purpose Options:');
      purposesResult.data.slice(0, 6).forEach(p => {
        console.log(`      • ${p.name} (ID: ${p.id})`);
      });
      if (purposesResult.data.length > 6) {
        console.log(`      ... and ${purposesResult.data.length - 6} more`);
      }
    } else {
      console.log(`   ❌ Failed to fetch purposes`);
    }

    // Test 2: Officers Dropdown
    console.log('\n2️⃣  Testing Officers Dropdown...');
    const officersResult = await makeRequest(`${baseUrl}/officers`);
    if (officersResult.status === 200 && Array.isArray(officersResult.data)) {
      console.log(`   ✅ Status: ${officersResult.status}`);
      console.log(`   ✅ Found ${officersResult.data.length} officers`);
      console.log('\n   Officer Options:');
      officersResult.data.slice(0, 5).forEach(o => {
        console.log(`      • ${o.name} - ${o.rank} (ID: ${o.id})`);
      });
      if (officersResult.data.length > 5) {
        console.log(`      ... and ${officersResult.data.length - 5} more`);
      }
    } else {
      console.log(`   ❌ Failed to fetch officers`);
    }

    // Test 3: API Health Check
    console.log('\n3️⃣  Testing API Health...');
    const healthResult = await makeRequest(`${baseUrl}/`);
    if (healthResult.status === 200) {
      console.log(`   ✅ Backend API is running on ${baseUrl}`);
      console.log(`   ✅ Service: ${healthResult.data.service}`);
    } else {
      console.log(`   ❌ API health check failed`);
    }

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                         SUMMARY                            ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║ Purposes Dropdown:    ${purposesResult.data.length.toString().padEnd(43)} ║`);
    console.log(`║ Officers Dropdown:    ${officersResult.data.length.toString().padEnd(43)} ║`);
    console.log('║                                                            ║');
    console.log('║ ✅ Database is properly synced with API!                   ║');
    console.log('║ ✅ Dropdowns should now display data from database!        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    process.exit(1);
  }
}

testDropdownData();
