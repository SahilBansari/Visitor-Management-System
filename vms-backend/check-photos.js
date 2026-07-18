const pool = require('./src/db');

async function checkPhotos() {
  try {
    console.log('🔍 Checking for visitor photos and documents...\n');

    const [visitors] = await pool.query(`
      SELECT 
        visitor_id,
        full_name,
        visitor_photo_url,
        document_url,
        created_at
      FROM visitors
      WHERE visitor_photo_url IS NOT NULL 
         OR document_url IS NOT NULL
      ORDER BY visitor_id DESC
      LIMIT 20
    `);

    console.log(`✅ Found ${visitors.length} visitors with photos/documents\n`);

    if (visitors.length === 0) {
      console.log('⚠️  No photos or documents found in database');
      console.log('   Possible reasons:');
      console.log('   1. Visitors have not uploaded photos yet');
      console.log('   2. Photos are stored but URLs are NULL');
      console.log('   3. Check if visitors table has the columns');
      return;
    }

    visitors.forEach((v, idx) => {
      console.log(`${idx + 1}. ${v.full_name}`);
      console.log(`   ID: ${v.visitor_id}`);
      console.log(`   Photo URL: ${v.visitor_photo_url || '(none)'}`);
      console.log(`   Doc URL: ${v.document_url || '(none)'}`);
      console.log(`   Created: ${v.created_at}`);
      console.log('');
    });

    // Check total visitors
    const [total] = await pool.query('SELECT COUNT(*) as count FROM visitors');
    console.log(`\n📊 Total visitors in database: ${total[0].count}`);

    // Check request data
    const [requests] = await pool.query(`
      SELECT 
        r.request_id,
        r.visitor_name,
        r.visitor_id,
        v.visitor_photo_url,
        v.document_url
      FROM visitor_requests r
      LEFT JOIN visitors v ON r.visitor_id = v.visitor_id
      WHERE r.visitor_id IS NOT NULL
      LIMIT 5
    `);

    console.log(`\n📋 Sample visitor requests with visitor data:`);
    requests.forEach((r, idx) => {
      console.log(`${idx + 1}. Request ${r.request_id} - ${r.visitor_name}`);
      console.log(`   Visitor ID: ${r.visitor_id}`);
      console.log(`   Photo: ${r.visitor_photo_url || '(none)'}`);
      console.log(`   Doc: ${r.document_url || '(none)'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkPhotos();
