const pool = require('./src/db');

(async () => {
  try {
    console.log('Testing pending appointments query...');
    const [appointments] = await pool.query(`
      SELECT 
        a.appointments_id,
        a.appointment_visit_date,
        a.appointments_time_slot,
        a.number_of_visitors,
        v.full_name,
        v.visitor_mobile_no,
        v.visitor_email,
        astat.appointment_status_name,
        ts.time_slots_start_time,
        ts.time_slots_end_time
      FROM appointments a
      JOIN visitors v ON a.visitor_id = v.visitor_id
      JOIN appointment_status astat ON a.appointment_status_id = astat.appointment_status_id
      LEFT JOIN time_slots ts ON a.appointments_time_slot = ts.time_slots_id
      WHERE astat.appointment_status_name = 'pending'
      ORDER BY a.appointment_created_time DESC
    `);
    console.log('✅ Query result:');
    console.log(JSON.stringify(appointments, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
