const express = require('express');
const pool = require('../src/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, requireRole(['Admin','HOD','Clerk']), async (req, res) => {
  const { user_name, activity, description, status } = req.body;
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_name, activity, description, status, time)
       VALUES (?, ?, ?, ?, NOW())`,
      [user_name, activity, description, status]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

router.get('/', authenticate, requireRole(['Admin','HOD','Clerk']), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM audit_logs ORDER BY time DESC LIMIT 100');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
