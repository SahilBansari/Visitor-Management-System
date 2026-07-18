const mysql = require('mysql2/promise');

async function verifyDatabases() {
  console.log('🔍 Verifying Multi-Database Setup...\n');

  const databases = [
    { name: 'vms', label: 'Irrigation' },
    { name: 'vms_agriculture', label: 'Agriculture' }
  ];

  for (const db of databases) {
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: db.name
      });

      console.log(`\n✅ ${db.label} Database (${db.name})`);
      console.log('─'.repeat(50));

      // Get table count
      const [tables] = await connection.query(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ?
      `, [db.name]);

      console.log(`📊 Total Tables: ${tables.length}`);

      // Get table details
      for (const table of tables) {
        const tableName = table.TABLE_NAME;
        const [[{ count }]] = await connection.query(
          `SELECT COUNT(*) as count FROM ${tableName}`
        );
        console.log(`   • ${tableName}: ${count} records`);
      }

      // Verify key data
      const [[users]] = await connection.query('SELECT COUNT(*) as count FROM users');
      const [[officers]] = await connection.query('SELECT COUNT(*) as count FROM officers');
      const [[roles]] = await connection.query('SELECT COUNT(*) as count FROM roles');

      console.log(`\n📋 Core Data Summary:`);
      console.log(`   • Users: ${users.count}`);
      console.log(`   • Officers: ${officers.count}`);
      console.log(`   • Roles: ${roles.count}`);

      // List test users
      const [testUsers] = await connection.query('SELECT user_id, user_email FROM users LIMIT 3');
      console.log(`\n👥 Test Users:`);
      testUsers.forEach(user => {
        console.log(`   • ${user.user_email} (ID: ${user.user_id})`);
      });

      await connection.end();

    } catch (error) {
      console.log(`\n❌ ${db.label} Database (${db.name})`);
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Multi-Database Verification Complete!');
  console.log('='.repeat(50));
}

verifyDatabases();
