#!/usr/bin/env node

/**
 * Quick script to check what photo URLs are in the database
 */

const mysql = require('mysql2/promise');

async function checkDatabase() {
  console.log('\n📊 CHECKING DATABASE FOR PHOTO URLS\n');
  console.log('='.repeat(70));

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'vms'
  });

  try {
    // Check irrigation database
    console.log('\n🌾 IRRIGATION DATABASE (vms):');
    console.log('-'.repeat(70));
    
    const [rows] = await connection.execute(
      `SELECT visitor_id, full_name, visitor_photo_url FROM visitors LIMIT 10`
    );
    
    if (rows.length === 0) {
      console.log('❌ No visitors found in irrigation database');
    } else {
      console.log(`✅ Found ${rows.length} visitors:\n`);
      rows.forEach((row, idx) => {
        console.log(`${idx + 1}. ID: ${row.visitor_id}, Name: ${row.full_name}`);
        console.log(`   Photo URL: ${row.visitor_photo_url || '❌ NULL/EMPTY'}\n`);
      });
    }

    // Check agriculture database
    console.log('\n🥬 AGRICULTURE DATABASE (vms_agriculture):');
    console.log('-'.repeat(70));
    
    try {
      const connectionAg = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'vms_agriculture'
      });

      const [rowsAg] = await connectionAg.execute(
        `SELECT visitor_id, full_name, visitor_photo_url FROM visitors LIMIT 10`
      );
      
      if (rowsAg.length === 0) {
        console.log('❌ No visitors found in agriculture database');
      } else {
        console.log(`✅ Found ${rowsAg.length} visitors:\n`);
        rowsAg.forEach((row, idx) => {
          console.log(`${idx + 1}. ID: ${row.visitor_id}, Name: ${row.full_name}`);
          console.log(`   Photo URL: ${row.visitor_photo_url || '❌ NULL/EMPTY'}\n`);
        });
      }

      await connectionAg.end();
    } catch (err) {
      console.log('⚠️  Could not connect to agriculture database:', err.message);
    }

    // Check schema
    console.log('\n🔍 SCHEMA CHECK - Visitors Table Columns:');
    console.log('-'.repeat(70));
    
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'visitors' AND TABLE_SCHEMA = 'vms'
    `);

    columns.forEach(col => {
      const nullable = col.IS_NULLABLE === 'YES' ? '✅' : '❌';
      console.log(`${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (Nullable: ${nullable}, Default: ${col.COLUMN_DEFAULT || 'None'})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
    console.log('\n' + '='.repeat(70) + '\n');
  }
}

checkDatabase();
