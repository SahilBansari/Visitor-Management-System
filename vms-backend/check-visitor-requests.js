const mysql = require('mysql2/promise');

async function checkRequests() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'vms'
    });

    console.log('📋 Checking Visitor Requests in Database:\n');

    // Check all requests
    const [allRequests] = await conn.query('SELECT COUNT(*) as total FROM visitor_requests');
    console.log(`📊 Total requests in database: ${allRequests[0].total}`);

    // Check pending requests
    const [pendingRequests] = await conn.query('SELECT * FROM visitor_requests WHERE status = ? ORDER BY created_at DESC LIMIT 10', ['PENDING']);
    console.log(`\n⏳ Pending Requests (${pendingRequests.length}):`);
    
    if (pendingRequests.length === 0) {
      console.log('❌ NO PENDING REQUESTS FOUND!');
      console.log('\n🔍 This is the issue - the form data is not being saved.');
    } else {
      pendingRequests.forEach((r, i) => {
        console.log(`\n  ${i + 1}. ${r.visitor_name}`);
        console.log(`     - Pass ID: ${r.pass_id}`);
        console.log(`     - Status: ${r.status}`);
        console.log(`     - Date: ${r.visit_date}`);
        console.log(`     - Time: ${r.visit_start_time} - ${r.visit_end_time}`);
        console.log(`     - Created: ${r.created_at}`);
      });
    }

    // Check approved requests
    const [approvedRequests] = await conn.query('SELECT COUNT(*) as total FROM visitor_requests WHERE status = ?', ['APPROVED']);
    console.log(`\n✅ Approved Requests: ${approvedRequests[0].total}`);

    // Check visitors table
    const [visitors] = await conn.query('SELECT COUNT(*) as total FROM visitors');
    console.log(`\n👥 Total Visitors: ${visitors[0].total}`);

    await conn.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkRequests();
