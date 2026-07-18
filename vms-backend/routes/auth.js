const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../src/db');
const { jwt: jwtCfg } = require('../src/config');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query(
      'SELECT u.user_id, u.password_hash FROM users u WHERE u.user_email = ? LIMIT 1',
      [email]
    );
    if (!users.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = users[0];
    // Compare plain text passwords
    if (password !== user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const [roles] = await pool.query(
      `SELECT r.role_name FROM user_roles ur 
       JOIN roles r ON r.role_id = ur.role_id 
       WHERE ur.user_id = ? LIMIT 1`,
      [user.user_id]
    );
    const role = roles.length ? roles[0].role_name : 'Viewer';

    const token = jwt.sign({ user_id: user.user_id, role }, jwtCfg.secret, { expiresIn: jwtCfg.expiresIn });
    res.json({ access_token: token, token_type: 'bearer', role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
