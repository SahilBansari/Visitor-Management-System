const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Migration: Add time_slots_id column to visitor_requests table
 * This allows storing the selected time slot when admin approves a visitor request
 */

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log('🔄 Running migration: Add time_slots_id to visitor_requests...\n');

    // Check if column already exists
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'visitor_requests' AND COLUMN_NAME = 'time_slots_id'`
    );

    if (columns.length > 0) {
      console.log('✅ Column time_slots_id already exists in visitor_requests table');
      await connection.end();
      return;
    }

    // Add the column if it doesn't exist
    console.log('📝 Adding time_slots_id column to visitor_requests table...');
    
    await connection.execute(`
      ALTER TABLE visitor_requests 
      ADD COLUMN time_slots_id INT DEFAULT NULL,
      ADD FOREIGN KEY (time_slots_id) REFERENCES time_slots(time_slots_id) ON DELETE SET NULL
    `);

    console.log('✅ Successfully added time_slots_id column');
    console.log('   - Column: time_slots_id (INT, nullable)');
    console.log('   - Foreign Key: References time_slots(time_slots_id)');
    console.log('   - Action: ON DELETE SET NULL (preserves request if slot is deleted)');

    await connection.end();
    console.log('\n✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await connection.end();
    process.exit(1);
  }
}

migrate();
