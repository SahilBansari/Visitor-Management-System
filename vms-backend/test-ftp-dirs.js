const Client = require('basic-ftp').Client;

const ftpConfig = {
  host: 'ftp.avanyatech.com',
  port: 21,
  user: 'dms@avanyatech.com',
  password: 'Orbit@123'
};

async function testFTP() {
  const client = new Client();
  
  try {
    console.log('🔗 Connecting to FTP server...');
    await client.access({
      host: ftpConfig.host,
      user: ftpConfig.user,
      password: ftpConfig.password,
      port: ftpConfig.port,
      secure: false
    });
    
    console.log('✅ Connected to FTP server');
    
    // List root directory
    console.log('\n📂 Listing root directory:');
    const list = await client.list('/');
    list.forEach(item => console.log(`  ${item.isDirectory ? '📁' : '📄'} ${item.name}`));
    
    // Check if /vms exists
    console.log('\n🔍 Checking /vms directory...');
    try {
      const vmsList = await client.list('/vms');
      console.log('✅ /vms directory exists');
      vmsList.forEach(item => console.log(`  ${item.isDirectory ? '📁' : '📄'} ${item.name}`));
    } catch (err) {
      console.log('❌ /vms directory not found, creating it...');
      try {
        await client.ensureDir('/vms');
        console.log('✅ /vms directory created');
      } catch (err2) {
        console.log('❌ Failed to create /vms:', err2.message);
      }
    }
    
    // Check if /vms/photos exists
    console.log('\n🔍 Checking /vms/photos directory...');
    try {
      const photosList = await client.list('/vms/photos');
      console.log('✅ /vms/photos directory exists');
      photosList.forEach(item => console.log(`  ${item.isDirectory ? '📁' : '📄'} ${item.name}`));
    } catch (err) {
      console.log('❌ /vms/photos directory not found, creating it...');
      try {
        await client.ensureDir('/vms/photos');
        console.log('✅ /vms/photos directory created');
      } catch (err2) {
        console.log('❌ Failed to create /vms/photos:', err2.message);
      }
    }
    
    // Check if /vms/documents exists
    console.log('\n🔍 Checking /vms/documents directory...');
    try {
      const docsList = await client.list('/vms/documents');
      console.log('✅ /vms/documents directory exists');
      docsList.forEach(item => console.log(`  ${item.isDirectory ? '📁' : '📄'} ${item.name}`));
    } catch (err) {
      console.log('❌ /vms/documents directory not found, creating it...');
      try {
        await client.ensureDir('/vms/documents');
        console.log('✅ /vms/documents directory created');
      } catch (err2) {
        console.log('❌ Failed to create /vms/documents:', err2.message);
      }
    }
    
    await client.close();
    console.log('\n✅ FTP test completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFTP();
