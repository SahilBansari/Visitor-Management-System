const express = require('express');
const pool = require('../src/db');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Helper function to generate pass ID
const generatePassId = () => {
  return 'PASS' + Date.now().toString().slice(-8) + crypto.randomBytes(3).toString('hex').toUpperCase();
};

// Create appointment (Purpose + Date/Time + Summary)
router.post('/', async (req, res) => {
  const {
    visitor_id, officer_id, office_id, purpose_id,
    appointment_visit_date, appointments_time_slot, number_of_visitors,
    visitor_name, visitor_type, mobile_number, host_name, department
  } = req.body;

  console.log('📝 Creating appointment with data:', req.body);

  try {
    if (!visitor_id) throw new Error('Missing visitor_id');
    if (!appointments_time_slot) throw new Error('Missing appointments_time_slot');
    if (!appointment_visit_date) throw new Error('Missing appointment_visit_date');

    // Validate time slot exists
    console.log('🔍 Looking up time slot:', appointments_time_slot);
    const [slots] = await pool.query(
      'SELECT time_slots_id, time_slots_start_time, time_slots_end_time, time_slots_max_capacity FROM time_slots WHERE time_slots_id = ?',
      [appointments_time_slot]
    );
    console.log('🔍 Slot lookup result:', slots);
    if (!slots || slots.length === 0) {
      return res.status(400).json({ error: 'Invalid time slot', provided: appointments_time_slot });
    }

    const timeSlot = slots[0];

    // Ensure 'pending' status exists
    console.log('🔍 Looking up pending status');
    const [statusRows] = await pool.query(
      'SELECT appointment_status_id FROM appointment_status WHERE appointment_status_name = ? LIMIT 1',
      ['pending']
    );
    console.log('🔍 Status lookup result:', statusRows);
    if (!statusRows || statusRows.length === 0) {
      return res.status(500).json({ error: 'Missing pending status in database' });
    }

    const statusId = statusRows[0].appointment_status_id;
    console.log('✅ Using status ID:', statusId);

    // Capacity check (approved count per slot/date)
    console.log('🔍 Checking capacity for slot', appointments_time_slot, 'on date', appointment_visit_date);
    const [approvedCountResult] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM appointments 
       WHERE appointments_time_slot = ? AND appointment_visit_date = ? 
       AND appointment_status_id = (SELECT appointment_status_id FROM appointment_status WHERE appointment_status_name = 'approved')`,
      [appointments_time_slot, appointment_visit_date]
    );
    console.log('🔍 Capacity check result:', approvedCountResult);
    const approvedCount = approvedCountResult && approvedCountResult.length > 0 ? approvedCountResult[0].cnt : 0;
    console.log('✅ Approved count:', approvedCount, 'Max capacity:', timeSlot.time_slots_max_capacity);
    
    if (approvedCount >= timeSlot.time_slots_max_capacity) {
      return res.status(409).json({ error: 'Slot at capacity' });
    }

    // Create the appointment
    console.log('📋 Inserting appointment with visitor_id:', visitor_id);
    const [result] = await pool.query(
      `INSERT INTO appointments 
       (visitor_id, officer_id, office_id, purpose_id, appointment_visit_date, appointments_time_slot, number_of_visitors, appointment_status_id, appointment_created_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [visitor_id, officer_id || 1, office_id || 1, purpose_id || 1, appointment_visit_date, appointments_time_slot, number_of_visitors || 1, statusId]
    );
    
    console.log('✅ Appointment created successfully:', result);

    // Also create a visitor request record for tracking
    const pass_id = generatePassId();
    try {
      await pool.query(
        `INSERT INTO visitor_requests 
         (visitor_id, visitor_name, visitor_type, mobile_number, pass_id, host_name, department,
          visit_date, visit_start_time, visit_end_time, number_of_visitors, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
        [
          visitor_id,
          visitor_name || 'Unknown',
          visitor_type || 'Visitor',
          mobile_number || '',
          pass_id,
          host_name || '',
          department || '',
          appointment_visit_date,
          timeSlot.time_slots_start_time,
          timeSlot.time_slots_end_time,
          number_of_visitors || 1
        ]
      );
      console.log('✅ Visitor request record created with pass_id:', pass_id);
    } catch (vErr) {
      console.warn('⚠️ Warning: Could not create visitor request record:', vErr.message);
    }

    res.json({ 
      request_id: result.insertId, 
      status: 'pending', 
      appointment_id: result.insertId,
      visitor_id: visitor_id,
      pass_id: pass_id
    });
  } catch (e) {
    console.error('❌ Error creating appointment:', e.message);
    console.error('❌ Full error:', e);
    res.status(500).json({ error: 'Failed to create appointment', details: e.message });
  }
});

// List available time slots (for Date/Time UI)
router.get('/slots', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM time_slots ORDER BY time_slots_start_time ASC');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// GET all appointments (NO AUTH REQUIRED for testing)
router.get('/', async (req, res) => {
  try {
    console.log('\n📋 GET /appointments - Fetching all appointments');
    const [appointments] = await pool.query(
      `SELECT 
        a.appointments_id as id,
        a.visitor_id,
        a.officer_id,
        a.office_id,
        a.purpose_id,
        a.appointment_visit_date as visit_date,
        a.appointments_time_slot as time_slot,
        a.number_of_visitors,
        COALESCE(asn.appointment_status_name, 'pending') as status,
        DATE_FORMAT(a.appointment_created_time, '%e %b %Y %h:%i %p') as created_at,
        DATE_FORMAT(a.appointment_updated_time, '%e %b %Y %h:%i %p') as updated_at
       FROM appointments a
       LEFT JOIN appointment_status asn ON asn.appointment_status_id = a.appointment_status_id
       ORDER BY a.appointment_created_time DESC`
    );
    console.log(`   ✅ Found ${appointments.length} appointments`);
    res.json(appointments);
  } catch (e) {
    console.error('   ❌ Error fetching appointments:', e);
    res.status(500).json({ error: 'Failed to fetch appointments', details: e.message });
  }
});

module.exports = router;
