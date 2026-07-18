const jwt = require('jsonwebtoken');
const { jwt: jwtCfg } = require('../src/config');

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  console.log('\n🔑 AUTH MIDDLEWARE - Checking token');
  console.log('   Headers:', Object.keys(req.headers));
  console.log('   Authorization header:', auth ? 'Present' : 'MISSING');
  
  if (!auth || !auth.startsWith('Bearer ')) {
    console.log('   ❌ No Bearer token found');
    return res.status(401).json({ error: 'Missing token' });
  }
  
  const token = auth.split(' ')[1];
  console.log('   Token:', token.substring(0, 20) + '...');
  
  try {
    const payload = jwt.verify(token, jwtCfg.secret);
    console.log('   ✅ Token verified! Payload:', payload);
    req.user = payload; // { user_id, role }
    next();
  } catch (err) {
    console.log('   ❌ Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid token', details: err.message });
  }
}

function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient privileges' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
