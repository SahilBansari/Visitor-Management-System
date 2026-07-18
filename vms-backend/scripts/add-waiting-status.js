const mysql = require('mysql2/promise');
const config = require('../src/config');

(async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database
    });

    console.log('📝 Adding WAITING status to visitor_requests table...');
    
    // Alter the enum to include WAITING
    await connection.execute(`
      ALTER TABLE visitor_requests 
      MODIFY COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'WAITING') DEFAULT 'PENDING'
    `);

    console.log('✅ WAITING status added successfully!');

    await connection.end();
  } catch (error) {
    console.error('❌ Error adding WAITING status:', error.message);
    process.exit(1);
  }
})();
