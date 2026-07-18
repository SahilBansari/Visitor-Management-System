const express = require('express');
const pool = require('../src/db');

const router = express.Router();

// GET all offices (NO AUTH REQUIRED for testing)
router.get('/', async (req, res) => {
  try {
    console.log('\n📋 GET /offices - Fetching all offices');
    const [offices] = await pool.query(
      `SELECT 
        offices_id as id,
        office_name as name,
        office_address as address
       FROM offices
       ORDER BY offices_id ASC`
    );
    console.log(`   ✅ Found ${offices.length} offices`);
    res.json(offices);
  } catch (e) {
    console.error('   ❌ Error fetching offices:', e);
    res.status(500).json({ error: 'Failed to fetch offices', details: e.message });
  }
});

// POST - Add a new office
router.post('/', async (req, res) => {
  const { name, address } = req.body;

  try {
    console.log('\n📝 POST /offices - Adding new office');
    console.log('   Data:', { name, address });

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Office name is required' });
    }

    // Insert office into database
    const [result] = await pool.query(
      `INSERT INTO offices (office_name, office_address)
       VALUES (?, ?)`,
      [name, address || null]
    );

    console.log('   ✅ Office added with ID:', result.insertId);

    // Return the newly created office
    const [newOffice] = await pool.query(
      `SELECT 
        offices_id as id,
        office_name as name,
        office_address as address
       FROM offices
       WHERE offices_id = ?`,
      [result.insertId]
    );

    res.json({ success: true, office: newOffice[0] });
  } catch (e) {
    console.error('   ❌ Error adding office:', e);
    res.status(500).json({ error: 'Failed to add office', details: e.message });
  }
});

// GET office by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`\n📋 GET /offices/${id} - Fetching office by ID`);
    const [offices] = await pool.query(
      `SELECT 
        offices_id as id,
        office_name as name,
        office_address as address
       FROM offices
       WHERE offices_id = ?`,
      [id]
    );

    if (offices.length === 0) {
      return res.status(404).json({ error: 'Office not found' });
    }

    res.json(offices[0]);
  } catch (e) {
    console.error('   ❌ Error fetching office:', e);
    res.status(500).json({ error: 'Failed to fetch office', details: e.message });
  }
});

// PUT - Update an office
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;

  try {
    console.log(`\n✏️  PUT /offices/${id} - Updating office`);

    const [result] = await pool.query(
      `UPDATE offices 
       SET office_name = COALESCE(?, office_name),
           office_address = COALESCE(?, office_address)
       WHERE offices_id = ?`,
      [name || null, address || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Office not found' });
    }

    console.log('   ✅ Office updated');

    // Return updated office
    const [updatedOffice] = await pool.query(
      `SELECT 
        offices_id as id,
        office_name as name,
        office_address as address
       FROM offices
       WHERE offices_id = ?`,
      [id]
    );

    res.json({ success: true, office: updatedOffice[0] });
  } catch (e) {
    console.error('   ❌ Error updating office:', e);
    res.status(500).json({ error: 'Failed to update office', details: e.message });
  }
});

// DELETE an office
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`\n🗑️  DELETE /offices/${id} - Deleting office`);

    const [result] = await pool.query(
      `DELETE FROM offices WHERE offices_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Office not found' });
    }

    console.log('   ✅ Office deleted');
    res.json({ success: true, message: 'Office deleted successfully' });
  } catch (e) {
    console.error('   ❌ Error deleting office:', e);
    res.status(500).json({ error: 'Failed to delete office', details: e.message });
  }
});

module.exports = router;
