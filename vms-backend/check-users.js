const pool = require('./src/db');

(async () => {
  try {
    console.log('\n👥 Checking users in database...\n');
    const [users] = await pool.query(`
      SELECT u.user_id, u.user_email, u.password_hash, r.role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON r.role_id = ur.role_id
      LIMIT 10
    `);
    
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      console.table(users);
      console.log('\n✅ Try logging in with one of these emails and the corresponding password_hash as password');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
