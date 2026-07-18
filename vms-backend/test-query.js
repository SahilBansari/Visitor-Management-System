const pool = require('./src/db');

(async () => {
  try {
    const [requests] = await pool.query(`
      SELECT 
        vr.request_id as appointments_id,
        vr.pass_id,
        vr.visitor_name as full_name,
        vr.visitor_type,
        vr.mobile_number as visitor_mobile_no,
        vr.status as appointment_status_name,
        vr.host_name as officer_name,
        vr.department as officer_department,
        vr.visit_date as appointment_visit_date,
        vr.visit_start_time,
        vr.visit_end_time,
        vr.number_of_visitors
      FROM visitor_requests vr
      ORDER BY 
        CASE WHEN vr.status = 'PENDING' THEN 1
             WHEN vr.status = 'WAITING' THEN 2
             WHEN vr.status = 'APPROVED' THEN 3
             WHEN vr.status = 'REJECTED' THEN 4
             WHEN vr.status = 'COMPLETED' THEN 5
             ELSE 6 END,
        vr.created_at DESC
      LIMIT 3
    `);
    
    console.log('✅ Query successful!');
    console.log(`📊 Found ${requests.length} records`);
    console.log('\n📝 Sample data:');
    requests.forEach(r => {
      console.log(`  - ${r.full_name} (${r.appointment_status_name}) - ${r.visit_start_time} to ${r.visit_end_time}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
