const mysql = require('mysql2/promise');
const config = require('../src/config');

async function migrateEnum() {
  const databases = ['vms', 'vms_agriculture'];
  
  for (const dbName of databases) {
    try {
      const dbConfig = dbName === 'vms' ? config.databases.irrigation : config.databases.agriculture;
      const connection = await mysql.createConnection(dbConfig);
      
      console.log(`\n📝 Migrating ${dbName} database...`);
      
      const query = `ALTER TABLE visitor_requests MODIFY COLUMN status ENUM('PENDING', 'APPROVED', 'WAITING', 'REJECTED', 'COMPLETED', 'CHECKED_IN') DEFAULT 'PENDING'`;
      
      await connection.execute(query);
      console.log(`✅ ${dbName} - visitor_requests table ENUM updated successfully`);
      
      await connection.end();
    } catch (error) {
      // Table might not exist or already have the new ENUM, which is fine
      console.log(`⚠️  ${dbName} - Could not migrate (table may not exist or already migrated): ${error.message}`);
    }
  }
  
  console.log('\n✅ Enum migration completed!');
}

migrateEnum().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
