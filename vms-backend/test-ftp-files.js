const ftpService = require('./src/ftp');

async function testFTP() {
  try {
    console.log('🧪 Testing FTP Connection and Files...\n');

    // Connect
    await ftpService.connect();
    console.log('✅ Connected to FTP\n');

    // List files in /vms/photos
    console.log('📸 Checking /vms/photos directory:');
    try {
      await ftpService.client.cd('/vms/photos');
      const photoFiles = await ftpService.client.list();
      console.log(`   Found ${photoFiles.length} files:`);
      photoFiles.slice(0, 10).forEach(f => {
        console.log(`   - ${f.name} (${f.size} bytes)`);
      });
    } catch (e) {
      console.log(`   ⚠️  Error accessing /vms/photos: ${e.message}`);
    }

    // List files in /vms/documents
    console.log('\n📄 Checking /vms/documents directory:');
    try {
      await ftpService.client.cd('/vms/documents');
      const docFiles = await ftpService.client.list();
      console.log(`   Found ${docFiles.length} files:`);
      docFiles.slice(0, 10).forEach(f => {
        console.log(`   - ${f.name} (${f.size} bytes)`);
      });
    } catch (e) {
      console.log(`   ⚠️  Error accessing /vms/documents: ${e.message}`);
    }

    // Try downloading one photo file
    console.log('\n🔄 Attempting to download a test photo file...');
    try {
      const chunks = [];
      const writable = {
        write: (data) => chunks.push(data),
        end: () => {}
      };
      
      await ftpService.client.downloadTo(writable, '/vms/photos/PHOTO_anuhska kakade_1769852974064.jpg');
      const buffer = Buffer.concat(chunks);
      console.log(`✅ Successfully downloaded file! Size: ${buffer.length} bytes`);
    } catch (e) {
      console.log(`❌ Error downloading file: ${e.message}`);
    }

    await ftpService.disconnect();
    console.log('\n✅ FTP tests completed');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testFTP();
