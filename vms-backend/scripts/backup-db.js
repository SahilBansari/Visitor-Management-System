const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'vms'
};

async function backupDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('🔄 Starting database backup...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);
    let backupSQL = '-- VMS Database Backup\n';
    backupSQL += `-- Timestamp: ${new Date().toISOString()}\n\n`;

    // Get list of all tables
    const [tables] = await connection.execute('SHOW TABLES');
    
    for (const tableObj of tables) {
      const tableName = Object.values(tableObj)[0];
      console.log(`  📋 Backing up table: ${tableName}`);

      // Get CREATE TABLE statement
      const [createResult] = await connection.execute(`SHOW CREATE TABLE ${tableName}`);
      backupSQL += `\n-- ========== ${tableName.toUpperCase()} ==========\n`;
      backupSQL += `DROP TABLE IF EXISTS ${tableName};\n`;
      backupSQL += createResult[0]['Create Table'] + ';\n\n';

      // Get all data
      const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
      
      if (rows.length > 0) {
        backupSQL += `-- Data for table ${tableName}\n`;
        for (const row of rows) {
          const columns = Object.keys(row).join(', ');
          const values = Object.values(row)
            .map(val => {
              if (val === null) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (val instanceof Date) return `'${val.toISOString()}'`;
              return val;
            })
            .join(', ');
          backupSQL += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
        }
        backupSQL += '\n';
      }
    }

    // Write backup file
    fs.writeFileSync(backupFile, backupSQL);
    console.log(`\n✅ Database backed up successfully!`);
    console.log(`📁 Backup file: ${backupFile}`);
    console.log(`📊 Total tables backed up: ${tables.length}`);

  } catch (error) {
    console.error('❌ Error backing up database:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

backupDatabase();
