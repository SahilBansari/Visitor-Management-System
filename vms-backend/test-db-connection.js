/**
 * Database Connection Diagnostic Script
 * Tests MySQL connectivity and provides troubleshooting information
 */

const mysql = require('mysql2/promise');
const os = require('os');

// Get local IP addresses
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  
  return ips;
}

async function testDatabaseConnection() {
  console.log('\n🔧 DATABASE CONNECTION DIAGNOSTIC\n');
  console.log('=' .repeat(60));
  
  // Show local network info
  console.log('\n📡 Your Local Network Info:');
  console.log('   Local IPs:', getLocalIPs());
  
  // Database configuration
  const dbConfig = {
    host: process.env.DB_HOST || '103.102.234.161',
    user: process.env.DB_USER || 'gmfdmmzn_vms',
    password: process.env.DB_PASSWORD || 'Orbit@123',
    database: process.env.DB_NAME || 'gmfdmmzn_vms',
    port: process.env.DB_PORT || 3306
  };
  
  console.log('\n🗄️  Database Configuration:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   User: ${dbConfig.user}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   Password: ${dbConfig.password ? '***' : 'NOT SET'}`);
  
  console.log('\n🔗 Attempting Connection...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ SUCCESS! Database connection established!\n');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test Query Successful:', rows);
    
    await connection.end();
    return true;
  } catch (error) {
    console.log('❌ CONNECTION FAILED!\n');
    console.log('Error Details:');
    console.log('   Code:', error.code);
    console.log('   Message:', error.message);
    console.log('   Errno:', error.errno);
    
    // Provide specific troubleshooting advice
    console.log('\n🛠️  Troubleshooting Guide:\n');
    
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('   Issue: Connection lost to database server');
      console.log('   Solution: Verify the database server is running and accessible');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('   Issue: Access Denied - Username/Password incorrect OR IP not whitelisted');
      console.log('   Solutions:');
      console.log('   1. Verify DB_USER and DB_PASSWORD are correct');
      console.log('   2. Contact your database provider to whitelist your IP');
      console.log('   3. Check if the database accepts remote connections');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   Issue: Cannot resolve database hostname');
      console.log('   Solution: Verify the DB_HOST is correct and DNS is working');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   Issue: Connection refused by database server');
      console.log('   Solutions:');
      console.log('   1. Verify the database server is running');
      console.log('   2. Verify the port number is correct');
      console.log('   3. Check if firewall is blocking the connection');
    } else if (error.message && error.message.includes('IP not allowed')) {
      console.log('   Issue: Your IP address is not whitelisted');
      console.log('   Solution: Contact your hosting provider to add your IP to the whitelist');
    }
    
    console.log('\n📋 Common Issues:');
    console.log('   - Database host is incorrect');
    console.log('   - Credentials are wrong');
    console.log('   - Database server has IP whitelisting enabled');
    console.log('   - Firewall blocking the connection');
    console.log('   - Database server is offline');
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Contact your hosting provider for IP whitelisting');
    console.log('   2. Verify your current public IP is registered');
    console.log('   3. Test credentials using a MySQL client (e.g., MySQL Workbench)');
    console.log('   4. Check database provider documentation for remote access setup\n');
    
    return false;
  }
}

// Run diagnostic
testDatabaseConnection()
  .then(success => {
    console.log('=' .repeat(60) + '\n');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
