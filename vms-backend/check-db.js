const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'vms'
  });
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 VMS DATABASE DIAGNOSTIC');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Check visitors
  const [visitors] = await conn.execute('SELECT * FROM visitors ORDER BY created_at DESC LIMIT 5');
  console.log('👥 RECENT VISITORS:');
  console.log('─────────────────────────────────────────────────────');
  if (visitors.length === 0) {
    console.log('No visitors found');
  } else {
    console.table(visitors);
  }
  
  // Check appointments
  console.log('\n📅 RECENT APPOINTMENTS:');
  console.log('─────────────────────────────────────────────────────');
  const [appointments] = await conn.execute(`
    SELECT 
      a.appointments_id,
      v.full_name,
      v.visitor_mobile_no,
      a.appointment_visit_date,
      astat.appointment_status_name,
      a.appointment_created_time
    FROM appointments a
    LEFT JOIN visitors v ON a.visitor_id = v.visitor_id
    LEFT JOIN appointment_status astat ON a.appointment_status_id = astat.appointment_status_id
    ORDER BY a.appointment_created_time DESC
    LIMIT 5
  `);
  
  if (appointments.length === 0) {
    console.log('No appointments found');
  } else {
    console.table(appointments);
  }
  
  // Check pending requests
  console.log('\n⏳ PENDING REQUESTS:');
  console.log('─────────────────────────────────────────────────────');
  const [pending] = await conn.execute(`
    SELECT 
      a.appointments_id,
      v.full_name,
      v.visitor_mobile_no,
      a.appointment_visit_date,
      ts.time_slots_start_time,
      ts.time_slots_end_time
    FROM appointments a
    JOIN visitors v ON a.visitor_id = v.visitor_id
    JOIN appointment_status astat ON a.appointment_status_id = astat.appointment_status_id
    LEFT JOIN time_slots ts ON a.appointments_time_slot = ts.time_slots_id
    WHERE astat.appointment_status_name = 'pending'
  `);
  
  if (pending.length === 0) {
    console.log('No pending requests found');
  } else {
    console.table(pending);
  }
  
  console.log('\n═══════════════════════════════════════════════════════\n');
  
  await conn.end();
})();
