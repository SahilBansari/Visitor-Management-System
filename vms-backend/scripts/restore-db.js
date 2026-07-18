const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'vms'
};

async function restoreDatabase(backupFile) {
  let connection;
  try {
    if (!backupFile) {
      // Find the latest backup file
      const backupDir = path.join(__dirname, '../backups');
      
      if (!fs.existsSync(backupDir)) {
        console.error('❌ No backup directory found. Please run backup-db.js first.');
        process.exit(1);
      }

      const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('backup-') && f.endsWith('.sql'))
        .sort()
        .reverse();

      if (files.length === 0) {
        console.error('❌ No backup files found. Please run backup-db.js first.');
        process.exit(1);
      }

      backupFile = path.join(backupDir, files[0]);
      console.log(`📁 Using latest backup: ${files[0]}`);
    }

    if (!fs.existsSync(backupFile)) {
      console.error(`❌ Backup file not found: ${backupFile}`);
      process.exit(1);
    }

    connection = await mysql.createConnection(config);
    console.log('🔄 Starting database restore...');

    const sql = fs.readFileSync(backupFile, 'utf8');
    
    // Split by newline and execute queries
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    let count = 0;
    for (const statement of statements) {
      try {
        await connection.execute(statement);
        count++;
      } catch (err) {
        // Skip certain errors
        if (!err.message.includes('already exists')) {
          console.warn(`⚠️  Warning: ${err.message}`);
        }
      }
    }

    console.log(`\n✅ Database restored successfully!`);
    console.log(`📊 Total statements executed: ${count}`);
    console.log(`📁 Restored from: ${backupFile}`);

  } catch (error) {
    console.error('❌ Error restoring database:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

// Get backup file from command line argument
const backupFile = process.argv[2];
restoreDatabase(backupFile);
