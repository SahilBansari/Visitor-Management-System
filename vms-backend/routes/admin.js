const express = require('express');
const pool = require('../src/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all visitor requests (with optional status filter) - Query from appointments table
router.get('/requests', authenticate, async (req, res) => {
  try {
    console.log('\n📋 GET /admin/requests - Fetching visitor requests');
    console.log('   Auth user:', req.user?.id || req.user?.email);
    const { status } = req.query;
    console.log('   Status filter:', status || 'none');
    
    let query = `
      SELECT 
        a.appointments_id as request_id,
        a.appointments_id as appointments_id,
        CONCAT('PASS-', a.appointments_id) as pass_id,
        v.full_name as full_name,
        v.full_name as visitor_name,
        'Visitor' as visitor_type,
        v.visitor_mobile_no as visitor_mobile_no,
        v.visitor_mobile_no as mobile_number,
        COALESCE(astat.appointment_status_name, 'pending') as appointment_status_name,
        COALESCE(astat.appointment_status_name, 'pending') as status,
        'Not Assigned' as officer_name,
        'Not Assigned' as officer_department,
        'Not Assigned' as host_name,
        'Not Assigned' as department,
        a.appointment_visit_date as visit_date,
        ts.time_slots_start_time as visit_start_time,
        ts.time_slots_end_time as visit_end_time,
        COALESCE(vr.time_slots_id, ts.time_slots_id) as time_slots_id,
        a.number_of_visitors,
        a.appointment_created_time as created_at,
        v.visitor_photo_url,
        v.document_url
      FROM appointments a
      LEFT JOIN visitors v ON a.visitor_id = v.visitor_id
      LEFT JOIN time_slots ts ON a.appointments_time_slot = ts.time_slots_id
      LEFT JOIN appointment_status astat ON a.appointment_status_id = astat.appointment_status_id
      LEFT JOIN visitor_requests vr ON a.appointments_id = vr.request_id
      ORDER BY 
        CASE WHEN astat.appointment_status_name = 'pending' THEN 1
             WHEN astat.appointment_status_name = 'approved' THEN 2
             WHEN astat.appointment_status_name = 'rejected' THEN 3
             WHEN astat.appointment_status_name = 'completed' THEN 4
             ELSE 5 END,
        a.appointment_created_time DESC
    `;
    
    const [requests] = await pool.query(query);
    console.log(`   ✅ Found ${requests.length} visitor requests`);
    
    if (requests.length > 0) {
      console.log('   🔍 Sample request:', requests[0]);
      console.log('   📸 Photo URL:', requests[0].visitor_photo_url);
      console.log('   📄 Document URL:', requests[0].document_url);
    }
    
    res.json(requests);
  } catch (e) {
    console.error('   ❌ Error fetching visitor requests:', e);
    res.status(500).json({ error: 'Failed to fetch visitor requests', details: e.message });
  }
});

// Get pending appointments/requests - Query from appointments table (where new records are saved)
router.get('/appointments/pending', authenticate, async (req, res) => {
  try {
    console.log('\n📋 GET /admin/appointments/pending - Fetching pending appointments');
    console.log('   Auth user:', req.user?.id || req.user?.email);
    
    const [appointments] = await pool.query(`
      SELECT 
        a.appointments_id as request_id,
        a.appointments_id as appointments_id,
        CONCAT('PASS-', a.appointments_id) as pass_id,
        v.full_name as full_name,
        v.full_name as visitor_name,
        'Visitor' as visitor_type,
        v.visitor_mobile_no as visitor_mobile_no,
        v.visitor_mobile_no as mobile_number,
        a.appointment_status_id,
        COALESCE(astat.appointment_status_name, 'pending') as appointment_status_name,
        COALESCE(astat.appointment_status_name, 'pending') as status,
        'Not Assigned' as officer_name,
        'Not Assigned' as officer_department,
        'Not Assigned' as host_name,
        'Not Assigned' as department,
        a.appointment_visit_date as visit_date,
        ts.time_slots_start_time as visit_start_time,
        ts.time_slots_end_time as visit_end_time,
        COALESCE(vr.time_slots_id, ts.time_slots_id) as time_slots_id,
        a.number_of_visitors,
        a.appointment_created_time as created_at,
        v.visitor_photo_url,
        v.document_url
      FROM appointments a
      LEFT JOIN visitors v ON a.visitor_id = v.visitor_id
      LEFT JOIN time_slots ts ON a.appointments_time_slot = ts.time_slots_id
      LEFT JOIN appointment_status astat ON a.appointment_status_id = astat.appointment_status_id
      LEFT JOIN visitor_requests vr ON a.appointments_id = vr.request_id
      ORDER BY 
        CASE WHEN astat.appointment_status_name = 'pending' THEN 1
             WHEN astat.appointment_status_name = 'approved' THEN 2
             WHEN astat.appointment_status_name = 'rejected' THEN 3
             WHEN astat.appointment_status_name = 'completed' THEN 4
             ELSE 5 END,
        a.appointment_created_time DESC
    `);
    console.log(`   ✅ Found ${appointments.length} appointments from appointments table`);
    
    // Debug: log first appointment to see data
    if (appointments.length > 0) {
      console.log('   🔍 First appointment data:', appointments[0]);
      console.log('   📸 Photo URL:', appointments[0].visitor_photo_url);
      console.log('   📄 Document URL:', appointments[0].document_url);
    }
    
    res.json(appointments);
  } catch (e) {
    console.error('   ❌ Error fetching pending appointments:', e);
    res.status(500).json({ error: 'Failed to fetch pending appointments', details: e.message });
  }
});

// Update visitor request status - Update appointments table
router.put('/requests/:id/status', authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    console.log(`🔄 Updating appointment ${id} status to ${status}`);
    
    // Map status string to appointment_status_id
    let statusName = 'pending';
    if (status.toUpperCase() === 'APPROVED') statusName = 'approved';
    else if (status.toUpperCase() === 'REJECTED') statusName = 'rejected';
    else if (status.toUpperCase() === 'COMPLETED') statusName = 'completed';
    
    const [statusRows] = await pool.query(
      'SELECT appointment_status_id FROM appointment_status WHERE appointment_status_name = ? LIMIT 1',
      [statusName]
    );
    
    if (!statusRows || statusRows.length === 0) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const statusId = statusRows[0].appointment_status_id;
    const [result] = await pool.query(
      'UPDATE appointments SET appointment_status_id = ?, appointment_updated_time = NOW() WHERE appointments_id = ?',
      [statusId, id]
    );
    
    console.log(`✅ Updated appointment ${id}: ${result.affectedRows} rows affected`);
    
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Return updated appointment data
    const [updated] = await pool.query(
      `SELECT 
        a.appointments_id, 
        CONCAT('PASS-', a.appointments_id) as pass_id,
        v.full_name as visitor_name,
        astat.appointment_status_name as status
       FROM appointments a
       LEFT JOIN visitors v ON a.visitor_id = v.visitor_id
       LEFT JOIN appointment_status astat ON a.appointment_status_id = astat.appointment_status_id
       WHERE a.appointments_id = ?`,
      [id]
    );
    
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error(`❌ Error updating appointment status:`, error);
    res.status(500).json({ error: 'Failed to update status', details: error.message });
  }
});

router.post('/appointments/:id/approve', authenticate, requireRole(['Admin','HOD','Clerk']), async (req, res) => {
  const { id } = req.params;
  try {
    console.log('📝 Approving appointment:', id);
    const [approvedRows] = await pool.query(
      'SELECT appointment_status_id FROM appointment_status WHERE appointment_status_name = ? LIMIT 1',
      ['approved']
    );
    console.log('🔍 Approved status lookup:', approvedRows);
    if (!approvedRows || approvedRows.length === 0) return res.status(500).json({ error: 'Missing approved status' });

    const approved = approvedRows[0];
    const [result] = await pool.query(
      'UPDATE appointments SET appointment_status_id = ?, appointment_updated_time = NOW() WHERE appointments_id = ?',
      [approved.appointment_status_id, id]
    );
    console.log('✅ Update result:', result);
    if (!result.affectedRows) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ status: 'approved' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to approve' });
  }
});

router.post('/appointments/:id/wait', authenticate, requireRole(['Admin','HOD','Clerk']), async (req, res) => {
  const { id } = req.params;
  try {
    console.log('📝 Setting appointment to wait:', id);
    const [waitingRows] = await pool.query(
      'SELECT appointment_status_id FROM appointment_status WHERE appointment_status_name = ? LIMIT 1',
      ['pending']
    );
    console.log('🔍 Pending status lookup:', waitingRows);
    if (!waitingRows || waitingRows.length === 0) return res.status(500).json({ error: 'Missing pending status' });
    
    const waiting = waitingRows[0];
    const [result] = await pool.query(
      'UPDATE appointments SET appointment_status_id = ?, appointment_updated_time = NOW() WHERE appointments_id = ?',
      [waiting.appointment_status_id, id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ status: 'pending' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to set wait' });
  }
});

router.post('/appointments/:id/disapprove', authenticate, requireRole(['Admin','HOD','Clerk']), async (req, res) => {
  const { id } = req.params;
  try {
    console.log('📝 Disapproving appointment:', id);
    const [rejectedRows] = await pool.query(
      'SELECT appointment_status_id FROM appointment_status WHERE appointment_status_name = ? LIMIT 1',
      ['rejected']
    );
    console.log('🔍 Rejected status lookup:', rejectedRows);
    if (!rejectedRows || rejectedRows.length === 0) return res.status(500).json({ error: 'Missing rejected status' });
    
    const rejected = rejectedRows[0];
    const [result] = await pool.query(
      'UPDATE appointments SET appointment_status_id = ?, appointment_updated_time = NOW() WHERE appointments_id = ?',
      [rejected.appointment_status_id, id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ status: 'rejected' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to disapprove' });
  }
});

module.exports = router;
