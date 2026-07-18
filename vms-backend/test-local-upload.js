const http = require('http');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

/**
 * Test the local file upload endpoint
 * Usage: node test-local-upload.js
 */

async function testLocalUpload() {
  try {
    // Create a test image file (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
      0x54, 0x08, 0x99, 0x63, 0xf8, 0x0f, 0x00, 0x00,
      0x01, 0x01, 0x00, 0x00, 0xae, 0xf1, 0x40, 0x3a,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44,
      0xae, 0x42, 0x60, 0x82
    ]);

    const testImagePath = path.join(__dirname, 'test_image.png');
    fs.writeFileSync(testImagePath, testImageBuffer);

    console.log('🧪 Testing Local File Upload\n');
    console.log('📁 Uploading test image...\n');

    // Upload photo
    const photoResult = await uploadFile(testImagePath, 'photo');
    console.log('✅ Photo Upload Response:');
    console.log(JSON.stringify(photoResult, null, 2));

    // Upload document
    const docResult = await uploadFile(testImagePath, 'document');
    console.log('\n✅ Document Upload Response:');
    console.log(JSON.stringify(docResult, null, 2));

    // Clean up test file
    fs.unlinkSync(testImagePath);

    console.log('\n✅ Test completed successfully!');
    console.log('\n📝 Usage in your form:');
    console.log(`
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('category', 'photos');  // or 'documents'
    formData.append('uploadType', 'vms');

    const response = await fetch('http://localhost:3001/ftp/upload-local', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log('File path:', result.filePath);  // e.g., /vms/photos/visitor_1706799000.png
    `);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function uploadFile(filePath, type) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('category', type === 'photo' ? 'photos' : 'documents');
    form.append('uploadType', 'vms');

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/ftp/upload-local',
      method: 'POST',
      headers: form.getHeaders()
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON response: ' + data));
        }
      });
    });

    req.on('error', reject);
    form.pipe(req);
  });
}

testLocalUpload();
