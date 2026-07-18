const express = require('express');
const pool = require('../src/db');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Helper function to generate pass ID
const generatePassId = () => {
  return 'PASS' + Date.now().toString().slice(-8) + crypto.randomBytes(3).toString('hex').toUpperCase();
};

// Create visitor (Identity step)
router.post('/', async (req, res) => {
  const { full_name, visitor_mobile_no, visitor_email, visitor_photo_url, document_url } = req.body;
  
  console.log('👤 Creating visitor with data:', { 
    full_name, 
    visitor_mobile_no, 
    visitor_email, 
    visitor_photo_url,
    document_url 
  });
  
  try {
    if (!full_name) {
      console.warn('⚠️ Warning: full_name is missing or empty');
    }
    
    const [result] = await pool.query(
      `INSERT INTO visitors (full_name, visitor_mobile_no, visitor_email, visitor_photo_url, document_url)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name || '', visitor_mobile_no, visitor_email || null, visitor_photo_url || null, document_url || null]
    );
    
    console.log('✅ Visitor created with ID:', result.insertId);
    console.log('✅ Stored visitor_photo_url:', visitor_photo_url);
    res.json({ visitor_id: result.insertId, visitor_photo_url: visitor_photo_url });
  } catch (e) {
    console.error('❌ Error creating visitor:', e);
    res.status(500).json({ error: 'Failed to create visitor', details: e.message });
  }
});

// Submit visitor request (comprehensive)
router.post('/submit-request', async (req, res) => {
  const {
    visitor_name,
    visitor_type,
    mobile_number,
    host_name,
    department,
    visit_date,
    visit_start_time,
    visit_end_time,
    number_of_visitors,
    visitor_id,
    visitor_photo_url,
    document_url
  } = req.body;

  console.log('📝 Submitting visitor request:', req.body);
  console.log('📸 Photo URL from request:', visitor_photo_url);
  console.log('📄 Document URL from request:', document_url);
  console.log('👤 Visitor ID from request:', visitor_id);

  try {
    // Validate required fields
    if (!visitor_name || !mobile_number || !visit_date || !visit_start_time || !visit_end_time) {
      return res.status(400).json({ 
        error: 'Missing required fields: visitor_name, mobile_number, visit_date, visit_start_time, visit_end_time' 
      });
    }

    // Generate unique pass ID
    const pass_id = generatePassId();

    // Log what we're about to insert
    console.log('📝 Attempting to insert visitor request with visitor_id:', visitor_id);

    // Insert into visitor_requests table
    const [result] = await pool.query(
      `INSERT INTO visitor_requests 
       (visitor_id, visitor_name, visitor_type, mobile_number, pass_id, host_name, department, 
        visit_date, visit_start_time, visit_end_time, number_of_visitors, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        visitor_id || null,
        visitor_name,
        visitor_type || 'Visitor',
        mobile_number,
        pass_id,
        host_name,
        department,
        visit_date,
        visit_start_time,
        visit_end_time,
        number_of_visitors || 1
      ]
    );

    console.log('✅ Visitor request created:', result);
    console.log('✅ Request ID:', result.insertId);
    console.log('✅ Visitor ID linked:', visitor_id);

    // Fetch the created request with visitor details to verify URLs are present
    const [requests] = await pool.query(
      `SELECT 
        r.request_id,
        r.visitor_name,
        r.visitor_type,
        r.mobile_number,
        r.pass_id,
        r.host_name,
        r.department,
        r.visit_date,
        r.visit_start_time,
        r.visit_end_time,
        r.number_of_visitors,
        r.status,
        r.created_at,
        r.visitor_id,
        v.visitor_photo_url,
        v.document_url
       FROM visitor_requests r
       LEFT JOIN visitors v ON r.visitor_id = v.visitor_id
       WHERE r.request_id = ?`,
      [result.insertId]
    );

    if (requests.length > 0) {
      console.log('✅ Fetched request with visitor details:', requests[0]);
      console.log('✅ Photo URL in response:', requests[0].visitor_photo_url);
      console.log('✅ Document URL in response:', requests[0].document_url);
    }

    res.json({
      success: true,
      request_id: result.insertId,
      pass_id: pass_id,
      status: 'PENDING',
      message: 'Visitor request submitted successfully',
      visitor_photo_url: requests[0]?.visitor_photo_url || null,
      document_url: requests[0]?.document_url || null
    });
  } catch (e) {
    console.error('❌ Error submitting visitor request:', e);
    res.status(500).json({ error: 'Failed to submit visitor request', details: e.message });
  }
});

// Get all visitor requests with optional status filter
router.get('/requests', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        r.request_id,
        r.visitor_name,
        r.visitor_type,
        r.mobile_number,
        r.pass_id,
        r.host_name,
        r.department,
        r.visit_date,
        r.visit_start_time,
        r.visit_end_time,
        r.number_of_visitors,
        r.status,
        r.created_at,
        v.visitor_id,
        v.visitor_photo_url,
        v.document_url
      FROM visitor_requests r
      LEFT JOIN visitors v ON r.visitor_id = v.visitor_id
    `;

    const params = [];

    if (status) {
      query += ` WHERE r.status = ?`;
      params.push(status.toUpperCase());
    }

    query += ` ORDER BY r.created_at DESC`;

    const [requests] = await pool.query(query, params);

    console.log(`✅ Retrieved ${requests.length} visitor requests`);

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (e) {
    console.error('❌ Error fetching visitor requests:', e);
    res.status(500).json({ error: 'Failed to fetch visitor requests', details: e.message });
  }
});

// Get specific visitor request by pass_id
router.get('/request/:passId', async (req, res) => {
  try {
    const { passId } = req.params;

    const [requests] = await pool.query(
      `SELECT * FROM visitor_requests WHERE pass_id = ? LIMIT 1`,
      [passId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Visitor request not found' });
    }

    res.json({ success: true, data: requests[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// Update visitor request status (Approve/Reject/Wait) - PATCH with auth
// NOTE: This must come BEFORE the general /request/:requestId PATCH route
router.patch('/request/:requestId/status', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    // Role-based access control (only admins can update status)
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update visitor status' });
    }

    const validStatuses = ['PENDING', 'APPROVED', 'WAITING', 'REJECTED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Valid values: ' + validStatuses.join(', ') });
    }

    const [result] = await pool.query(
      `UPDATE visitor_requests SET status = ?, updated_at = NOW() WHERE request_id = ?`,
      [status, requestId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    console.log(`✅ Request ${requestId} status updated to ${status}`);

    res.json({ 
      success: true, 
      request_id: requestId,
      status: status, 
      message: `Request status updated to ${status} successfully` 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update request status', details: e.message });
  }
});

// PUT endpoint - Update visitor request status (allows unauthenticated for admin dashboard)
router.put('/request/:requestId/status', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, time_slots_id } = req.body;

    console.log(`\n📝 PUT /request/${requestId}/status - Updating status to ${status}`);
    console.log('   Auth header:', req.headers.authorization ? 'Present' : 'MISSING');
    if (time_slots_id) {
      console.log(`   📅 Time Slot ID: ${time_slots_id}`);
    }

    const validStatuses = ['PENDING', 'APPROVED', 'WAITING', 'REJECTED', 'COMPLETED', 'CHECKED_IN'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Valid values: ' + validStatuses.join(', ') });
    }

    // Validate request exists first
    const [existing] = await pool.query(
      `SELECT request_id FROM visitor_requests WHERE request_id = ?`,
      [requestId]
    );

    if (!existing || existing.length === 0) {
      console.log(`   ❌ Request ${requestId} not found`);
      return res.status(404).json({ error: 'Request not found' });
    }

    // Build update query dynamically based on whether time_slots_id is provided
    let updateQuery = `UPDATE visitor_requests SET status = ?`;
    const params = [status];
    
    if (time_slots_id) {
      updateQuery += `, time_slots_id = ?`;
      params.push(time_slots_id);
      console.log(`   ✅ Will store time slot ID: ${time_slots_id}`);
    }
    
    updateQuery += `, updated_at = NOW() WHERE request_id = ?`;
    params.push(requestId);

    const [result] = await pool.query(updateQuery, params);

    if (result.affectedRows === 0) {
      console.log(`   ❌ Failed to update - no rows affected`);
      return res.status(404).json({ error: 'Request not found' });
    }

    console.log(`   ✅ Request ${requestId} status updated to ${status}${time_slots_id ? ` with time_slots_id: ${time_slots_id}` : ''}`);

    res.json({ 
      success: true, 
      request_id: requestId,
      status: status,
      time_slots_id: time_slots_id || null,
      message: `Request status updated to ${status} successfully` 
    });
  } catch (e) {
    console.error('   ❌ Error:', e.message);
    res.status(500).json({ error: 'Failed to update request status', details: e.message });
  }
});

// Update visitor request details (name, purpose, time)
// NOTE: This comes AFTER /status routes so they match first
// NOTE: No authentication required - frontend uses mock auth (AuthContext not JWT)
router.patch('/request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { visitor_name, visitor_type, visit_start_time, visit_end_time } = req.body;

    console.log(`\n📝 PATCH /request/${requestId}`);
    console.log('   Request Body:', { visitor_name, visitor_type, visit_start_time, visit_end_time });
    console.log('   Request ID Type:', typeof requestId, 'Value:', requestId);

    // Validate requestId is a number
    const id = parseInt(requestId);
    if (isNaN(id)) {
      console.log(`   ❌ Invalid request ID: ${requestId}`);
      return res.status(400).json({ error: 'Invalid request ID', details: `Request ID "${requestId}" is not a valid number` });
    }

    // Validate that at least one field is provided
    const hasAtLeastOneField = [visitor_name, visitor_type, visit_start_time, visit_end_time].some(field => field !== undefined && field !== null && field !== '');
    if (!hasAtLeastOneField) {
      console.log(`   ⚠️ No valid fields to update (all empty or undefined)`);
      return res.status(400).json({ error: 'No valid fields to update', details: 'At least one field must be provided and non-empty' });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (visitor_name !== undefined && visitor_name !== '') {
      updates.push('visitor_name = ?');
      params.push(visitor_name);
      console.log(`   ✏️ Will update visitor_name to: "${visitor_name}"`);
    }
    if (visitor_type !== undefined && visitor_type !== '') {
      updates.push('visitor_type = ?');
      params.push(visitor_type);
      console.log(`   ✏️ Will update visitor_type to: "${visitor_type}"`);
    }
    if (visit_start_time !== undefined && visit_start_time !== '') {
      updates.push('visit_start_time = ?');
      params.push(visit_start_time);
      console.log(`   ✏️ Will update visit_start_time to: "${visit_start_time}"`);
    }
    if (visit_end_time !== undefined && visit_end_time !== '') {
      updates.push('visit_end_time = ?');
      params.push(visit_end_time);
      console.log(`   ✏️ Will update visit_end_time to: "${visit_end_time}"`);
    }

    if (updates.length === 0) {
      console.log(`   ⚠️ No fields to update after filtering empty values`);
      return res.status(400).json({ error: 'No valid fields to update', details: 'All provided fields are empty' });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const query = `UPDATE visitor_requests SET ${updates.join(', ')} WHERE request_id = ?`;
    console.log('   SQL Query:', query);
    console.log('   SQL Params (without id):', params.slice(0, -1));

    const [result] = await pool.query(query, params);

    console.log('   Query Result:', { affectedRows: result.affectedRows, changedRows: result.changedRows });

    if (result.affectedRows === 0) {
      console.log(`   ❌ No rows affected - Request ${id} may not exist in database`);
      return res.status(404).json({ error: 'Request not found', details: `No visitor request with ID ${id} exists in the database` });
    }

    console.log(`   ✅ Request ${id} updated - ${result.affectedRows} rows affected`);

    res.json({
      success: true,
      request_id: id,
      message: 'Request updated successfully'
    });
  } catch (e) {
    console.error('❌ Error updating request:', e.message);
    console.error('   Stack:', e.stack);
    res.status(500).json({ error: 'Failed to update request', details: e.message });
  }
});

// Alternative PUT endpoint - Update visitor request status (direct ID)
router.put('/:requestId/status', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, time_slots_id } = req.body;

    console.log(`\n📝 PUT /${requestId}/status - Updating status to ${status}`);
    if (time_slots_id) {
      console.log(`   📅 Time Slot ID: ${time_slots_id}`);
    }

    const validStatuses = ['PENDING', 'APPROVED', 'WAITING', 'REJECTED', 'COMPLETED', 'CHECKED_IN'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Valid values: ' + validStatuses.join(', ') });
    }

    // Build update query dynamically based on whether time_slots_id is provided
    let updateQuery = `UPDATE visitor_requests SET status = ?`;
    const params = [status];
    
    if (time_slots_id) {
      updateQuery += `, time_slots_id = ?`;
      params.push(time_slots_id);
      console.log(`   ✅ Will store time slot ID: ${time_slots_id}`);
    }
    
    updateQuery += ` WHERE request_id = ?`;
    params.push(requestId);

    const [result] = await pool.query(updateQuery, params);

    if (result.affectedRows === 0) {
      console.log(`   ❌ Request ${requestId} not found`);
      return res.status(404).json({ error: 'Request not found' });
    }

    console.log(`   ✅ Request ${requestId} status updated to ${status}`);

    res.json({ 
      success: true, 
      request_id: requestId,
      status: status, 
      message: `Request status updated to ${status} successfully` 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update request status', details: e.message });
  }
});

// Get visitor by ID (with photo URL)
router.get('/:visitor_id', async (req, res) => {
  try {
    const { visitor_id } = req.params;
    console.log('🔍 Fetching visitor:', visitor_id);
    
    const [rows] = await pool.query(
      `SELECT * FROM visitors WHERE visitor_id = ?`,
      [visitor_id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Visitor not found' });
    }
    
    const visitor = rows[0];
    console.log('✅ Visitor found:', visitor);
    res.json({ success: true, data: visitor });
  } catch (e) {
    console.error('❌ Error fetching visitor:', e);
    res.status(500).json({ error: 'Failed to fetch visitor', details: e.message });
  }
});

// Add visitor document
router.post('/documents', async (req, res) => {
  const { visitor_id, id_type_id, visitor_documents_number, visitor_documents_url } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO visitor_documents (visitor_id, id_type_id, visitor_documents_number, visitor_documents_url, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [visitor_id, id_type_id, visitor_documents_number, visitor_documents_url]
    );
    res.json({ visitor_documents_id: result.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to add document' });
  }
});

module.exports = router;
