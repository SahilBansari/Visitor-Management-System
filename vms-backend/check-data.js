const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'vms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function checkData() {
  try {
    console.log('\n=== DATABASE DIAGNOSTIC CHECK ===\n');

    // Check visitors table
    const [visitors] = await pool.query('SELECT COUNT(*) as count FROM visitors');
    console.log(`📊 Total visitors in database: ${visitors[0].count}`);
    
    const [visitorsData] = await pool.query('SELECT visitor_id, full_name, visitor_mobile_no FROM visitors ORDER BY visitor_id DESC LIMIT 5');
    console.log('📋 Last 5 visitors:');
    visitorsData.forEach(v => console.log(`   - ID: ${v.visitor_id}, Name: ${v.full_name}, Mobile: ${v.visitor_mobile_no}`));

    // Check appointments table
    const [appointments] = await pool.query('SELECT COUNT(*) as count FROM appointments');
    console.log(`\n📊 Total appointments in database: ${appointments[0].count}`);
    
    const [appointmentsData] = await pool.query(`
      SELECT a.appointments_id, a.visitor_id, a.appointment_visit_date, astat.appointment_status_name
      FROM appointments a
      LEFT JOIN appointment_status astat ON a.appointment_status_id = astat.appointment_status_id
      ORDER BY a.appointments_id DESC LIMIT 5
    `);
    console.log('📋 Last 5 appointments:');
    appointmentsData.forEach(a => console.log(`   - ID: ${a.appointments_id}, Visitor ID: ${a.visitor_id}, Date: ${a.appointment_visit_date}, Status: ${a.appointment_status_name}`));

    // Check visitor_requests table
    const [vr] = await pool.query('SELECT COUNT(*) as count FROM visitor_requests');
    console.log(`\n📊 Total visitor requests in database: ${vr[0].count}`);
    
    const [vrData] = await pool.query(`
      SELECT vr.request_id, vr.visitor_id, vr.pass_id, vr.status, vr.visitor_name
      FROM visitor_requests vr
      ORDER BY vr.request_id DESC LIMIT 5
    `);
    console.log('📋 Last 5 visitor requests:');
    vrData.forEach(v => console.log(`   - Request ID: ${v.request_id}, Visitor ID: ${v.visitor_id}, Pass ID: ${v.pass_id}, Name: ${v.visitor_name}, Status: ${v.status}`));

    // Check the JOIN result that admin dashboard uses
    console.log('\n=== ADMIN DASHBOARD QUERY RESULT ===\n');
    const [dashboardData] = await pool.query(`
      SELECT 
        vr.request_id,
        vr.pass_id,
        vr.visitor_name,
        vr.visitor_type,
        vr.mobile_number,
        vr.status,
        vr.host_name,
        vr.department,
        vr.visit_date
      FROM visitor_requests vr
      WHERE LOWER(vr.status) = 'pending'
      ORDER BY vr.request_id DESC
      LIMIT 5
    `);
    console.log(`📊 Pending requests that should show on dashboard: ${dashboardData.length}`);
    if (dashboardData.length > 0) {
      console.log('📋 Dashboard data:');
      dashboardData.forEach(d => console.log(`   - Pass: ${d.pass_id}, Name: ${d.visitor_name}, Type: ${d.visitor_type}, Host: ${d.host_name}, Status: ${d.status}`));
    } else {
      console.log('⚠️ No pending requests found');
    }

    console.log('\n✅ Diagnostic complete\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkData();
