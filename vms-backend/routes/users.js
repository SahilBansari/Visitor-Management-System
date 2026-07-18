const express = require('express');
const pool = require('../src/db');

const router = express.Router();

// GET all users for dropdown
router.get('/', async (req, res) => {
  try {
    console.log('\n👥 GET /users - Fetching all users');
    const [users] = await pool.query(
      `SELECT user_id, user_email FROM users ORDER BY user_email`
    );
    console.log(`   ✅ Found ${users.length} users`);
    res.json(users);
  } catch (e) {
    console.error('   ❌ Error fetching users:', e);
    res.status(500).json({ error: 'Failed to fetch users', details: e.message });
  }
});

module.exports = router;
