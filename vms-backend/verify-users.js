const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'vms'
  });
  
  const [rows] = await conn.execute('SELECT user_id, user_email, password_hash FROM users');
  console.log('\n✅ Users in database (passwords stored as plain text):');
  console.log('═══════════════════════════════════════════════════════');
  rows.forEach(row => {
    console.log(`ID: ${row.user_id} | Email: ${row.user_email} | Password: ${row.password_hash}`);
  });
  console.log('═══════════════════════════════════════════════════════\n');
  
  await conn.end();
})();
