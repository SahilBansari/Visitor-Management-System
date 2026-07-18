const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function populateTestImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    // Test images - using publicly available sample images
    const testPhotoUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=testvisitor&backgroundColor=random';
    const testDocumentUrl = 'https://via.placeholder.com/600x800.png?text=ID+Document';

    // Get first 5 visitor requests
    const [rows] = await connection.query('SELECT request_id FROM visitor_requests LIMIT 5');

    console.log(`Found ${rows.length} visitor requests to update`);

    for (const row of rows) {
      await connection.query(
        'UPDATE visitor_requests SET visitor_photo_url = ?, document_url = ? WHERE request_id = ?',
        [testPhotoUrl, testDocumentUrl, row.request_id]
      );
      console.log(`✅ Updated request ${row.request_id} with test images`);
    }

    console.log('\n🎉 All visitor requests updated with test image URLs');
    console.log(`Photo URL: ${testPhotoUrl}`);
    console.log(`Document URL: ${testDocumentUrl}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

populateTestImages();
