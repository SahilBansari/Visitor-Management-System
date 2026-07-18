const express = require('express');
const pool = require('../src/db');

const router = express.Router();

// GET all purposes from database
router.get('/', async (req, res) => {
  try {
    console.log('\n📋 GET /purposes - Fetching all purposes');
    const [purposes] = await pool.query(
      `SELECT 
        purpose_id as id,
        purpose_name as name
      FROM purpose
      ORDER BY purpose_id ASC`
    );
    
    console.log(`   ✅ Found ${purposes.length} purposes`);
    if (purposes.length > 0) {
      console.log('   🔍 Sample purposes:', purposes.slice(0, 3));
    }
    
    res.json(purposes);
  } catch (e) {
    console.error('   ❌ Error fetching purposes:', e);
    res.status(500).json({ error: 'Failed to fetch purposes', details: e.message });
  }
});

module.exports = router;
