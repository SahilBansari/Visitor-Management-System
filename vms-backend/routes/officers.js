const express = require('express');
const pool = require('../src/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET all officers (NO AUTH REQUIRED for testing)
router.get('/', async (req, res) => {
  try {
    console.log('\n📋 GET /officers - Fetching all officers');
    const [officers] = await pool.query(
      `SELECT 
        o.officers_id as id,
        o.officer_name as name,
        o.officer_designation as \`rank\`,
        o.officer_email as email,
        o.officer_phone as phone,
        o.officer_cabin as cabin,
        o.user_id,
        COALESCE(os.officer_status_name, 'active') as status,
        DATE_FORMAT(o.created_at, '%e %b %Y') as lastActive
       FROM officers o
       LEFT JOIN officer_status os ON os.officer_status_id = o.officer_status_id
       ORDER BY o.created_at DESC`
    );
    console.log(`   ✅ Found ${officers.length} officers`);
    res.json(officers);
  } catch (e) {
    console.error('   ❌ Error fetching officers:', e);
    res.status(500).json({ error: 'Failed to fetch officers', details: e.message });
  }
});

// POST - Add a new officer (NO AUTH REQUIRED for testing)
router.post('/', async (req, res) => {
  const { name, rank, email, phone, cabin, department, user_id } = req.body;

  try {
    console.log('\n📝 POST /officers - Adding new officer');
    console.log('   Data:', { name, rank, email, phone, cabin, user_id });

    // Validate required fields
    if (!name || !rank) {
      return res.status(400).json({ error: 'Name and Rank are required' });
    }

    // Insert officer into database
    const [result] = await pool.query(
      `INSERT INTO officers (officer_name, officer_designation, officer_email, officer_phone, officer_cabin, officer_status_id, user_id)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      [name, rank, email || null, phone || null, cabin || 'TBD', user_id || null]
    );

    console.log('   ✅ Officer added with ID:', result.insertId);

    // Return the newly created officer
    const [newOfficer] = await pool.query(
      `SELECT 
        o.officers_id as id,
        o.officer_name as name,
        o.officer_designation as \`rank\`,
        o.officer_email as email,
        o.officer_phone as phone,
        o.officer_cabin as cabin,
        o.user_id,
        COALESCE(os.officer_status_name, 'active') as status,
        DATE_FORMAT(o.created_at, '%e %b %Y') as lastActive
       FROM officers o
       LEFT JOIN officer_status os ON os.officer_status_id = o.officer_status_id
       WHERE o.officers_id = ?`,
      [result.insertId]
    );

    res.json({ success: true, officer: newOfficer[0] });
  } catch (e) {
    console.error('   ❌ Error adding officer:', e);
    res.status(500).json({ error: 'Failed to add officer', details: e.message });
  }
});

// PUT - Update an officer
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, rank, email, phone, cabin, user_id } = req.body;

  try {
    console.log(`\n✏️  PUT /officers/${id} - Updating officer`);

    const [result] = await pool.query(
      `UPDATE officers 
       SET officer_name = COALESCE(?, officer_name),
           officer_designation = COALESCE(?, officer_designation),
           officer_email = COALESCE(?, officer_email),
           officer_phone = COALESCE(?, officer_phone),
           officer_cabin = COALESCE(?, officer_cabin),
           user_id = COALESCE(?, user_id)
       WHERE officers_id = ?`,
      [name || null, rank || null, email || null, phone || null, cabin || null, user_id || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Officer not found' });
    }

    console.log(`   ✅ Officer ${id} updated`);

    // Return updated officer
    const [updatedOfficer] = await pool.query(
      `SELECT 
        o.officers_id as id,
        o.officer_name as name,
        o.officer_designation as \`rank\`,
        o.officer_email as email,
        o.officer_phone as phone,
        o.officer_cabin as cabin,
        o.user_id,
        COALESCE(os.officer_status_name, 'active') as status,
        DATE_FORMAT(o.created_at, '%e %b %Y') as lastActive
       FROM officers o
       LEFT JOIN officer_status os ON os.officer_status_id = o.officer_status_id
       WHERE o.officers_id = ?`,
      [id]
    );

    res.json({ success: true, officer: updatedOfficer[0] });
  } catch (e) {
    console.error('   ❌ Error updating officer:', e);
    res.status(500).json({ error: 'Failed to update officer', details: e.message });
  }
});

// DELETE - Remove an officer (deactivate)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`\n🗑️  DELETE /officers/${id} - Deactivating officer`);

    // Set status to inactive (id=4)
    const [result] = await pool.query(
      `UPDATE officers SET officer_status_id = 4 WHERE officers_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Officer not found' });
    }

    console.log(`   ✅ Officer ${id} deactivated`);
    res.json({ success: true, message: 'Officer deactivated' });
  } catch (e) {
    console.error('   ❌ Error deactivating officer:', e);
    res.status(500).json({ error: 'Failed to deactivate officer', details: e.message });
  }
});

module.exports = router;
