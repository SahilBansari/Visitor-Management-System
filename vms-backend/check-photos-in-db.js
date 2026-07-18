const pool = require('./src/db');

async function checkPhotos() {
  try {
    const [visitors] = await pool.query(`
      SELECT 
        visitor_id, 
        full_name, 
        visitor_photo_url, 
        document_url,
        created_at
      FROM visitors 
      LIMIT 10
    `);

    console.log('\n📸 Visitors in database:');
    console.log('=' .repeat(80));
    
    if (visitors.length === 0) {
      console.log('❌ No visitors found');
    } else {
      visitors.forEach((v, idx) => {
        console.log(`\n[${idx + 1}] ${v.full_name}`);
        console.log(`    ID: ${v.visitor_id}`);
        console.log(`    Photo URL: ${v.visitor_photo_url || 'NULL'}`);
        console.log(`    Document URL: ${v.document_url || 'NULL'}`);
        console.log(`    Created: ${v.created_at}`);
      });
    }

    // Also check visitor_requests
    console.log('\n\n📋 Visitor Requests:');
    console.log('=' .repeat(80));
    
    const [requests] = await pool.query(`
      SELECT 
        r.request_id,
        r.visitor_name,
        r.visitor_id,
        r.status,
        v.visitor_photo_url,
        v.document_url
      FROM visitor_requests r
      LEFT JOIN visitors v ON r.visitor_id = v.visitor_id
      LIMIT 10
    `);

    if (requests.length === 0) {
      console.log('❌ No requests found');
    } else {
      requests.forEach((req, idx) => {
        console.log(`\n[${idx + 1}] ${req.visitor_name} (Request #${req.request_id})`);
        console.log(`    Status: ${req.status}`);
        console.log(`    Visitor ID: ${req.visitor_id}`);
        console.log(`    Photo URL: ${req.visitor_photo_url || 'NULL'}`);
        console.log(`    Document URL: ${req.document_url || 'NULL'}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPhotos();
