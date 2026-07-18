#!/usr/bin/env node

/**
 * Test Script for Visitor Photo URL Storage
 * Verifies that photos are uploaded to FTP and URLs are stored in database
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3001';
const DB = require('./src/db');

async function testPhotoUpload() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 VISITOR PHOTO URL STORAGE TEST');
  console.log('='.repeat(70) + '\n');

  try {
    // Test 1: Create a test photo file (1x1 pixel JPEG)
    console.log('📸 Test 1: Creating test photo file...');
    const testPhotoPath = path.join(__dirname, 'test_photo.jpg');
    // Minimal JPEG data
    const jpegData = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09, 
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12, 
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32, 
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01, 
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 
      0x7F, 0xFF, 0xD9
    ]);
    fs.writeFileSync(testPhotoPath, jpegData);
    console.log('✅ Test photo created\n');

    // Test 2: Test FTP connection
    console.log('🔌 Test 2: Testing FTP connection...');
    const ftpTestRes = await fetch(`${API_URL}/ftp/test`);
    const ftpTestData = await ftpTestRes.json();
    if (ftpTestData.success) {
      console.log('✅ FTP connection successful\n');
    } else {
      throw new Error('FTP connection failed');
    }

    // Test 3: Upload photo to FTP
    console.log('📤 Test 3: Uploading test photo to FTP...');
    const form = new FormData();
    form.append('file', fs.createReadStream(testPhotoPath));
    form.append('remoteFileName', `PHOTO_TestScript_${Date.now()}.jpg`);
    form.append('uploadPath', '/vms/photos');

    const uploadRes = await fetch(`${API_URL}/ftp/upload-file`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    const uploadData = await uploadRes.json();
    if (uploadData.success) {
      const photoUrl = uploadData.data.remotePath;
      console.log(`✅ Photo uploaded to FTP: ${photoUrl}\n`);

      // Test 4: Create visitor with photo URL
      console.log('📝 Test 4: Creating visitor with photo URL...');
      const visitorRes = await fetch(`${API_URL}/visitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: `Test_${Date.now()}`,
          visitor_mobile_no: '9876543210',
          visitor_email: 'test@example.com',
          visitor_photo_url: photoUrl,
          document_url: null
        })
      });

      const visitorData = await visitorRes.json();
      if (visitorData.visitor_id) {
        console.log(`✅ Visitor created with ID: ${visitorData.visitor_id}\n`);

        // Test 5: Verify photo URL in database
        console.log('🔍 Test 5: Verifying photo URL in database...');
        const [rows] = await DB.query(
          'SELECT visitor_id, full_name, visitor_photo_url FROM visitors WHERE visitor_id = ?',
          [visitorData.visitor_id]
        );

        if (rows.length > 0) {
          const visitor = rows[0];
          console.log(`📊 Visitor Record:`);
          console.log(`   ID: ${visitor.visitor_id}`);
          console.log(`   Name: ${visitor.full_name}`);
          console.log(`   Photo URL: ${visitor.visitor_photo_url}`);
          
          if (visitor.visitor_photo_url === photoUrl) {
            console.log(`\n✅ VERIFICATION SUCCESSFUL!`);
            console.log(`   Photo URL correctly stored in database\n`);
          } else {
            console.log(`\n❌ VERIFICATION FAILED!`);
            console.log(`   Expected: ${photoUrl}`);
            console.log(`   Got: ${visitor.visitor_photo_url}\n`);
          }
        }
      } else {
        console.log(`❌ Failed to create visitor: ${visitorData.error}\n`);
      }
    } else {
      console.log(`❌ FTP upload failed: ${uploadData.error}\n`);
    }

    // Cleanup
    fs.unlinkSync(testPhotoPath);
    console.log('🧹 Test files cleaned up');
    console.log('='.repeat(70) + '\n');

  } catch (err) {
    console.error('❌ Test error:', err.message);
    process.exit(1);
  }

  process.exit(0);
}

testPhotoUpload();
