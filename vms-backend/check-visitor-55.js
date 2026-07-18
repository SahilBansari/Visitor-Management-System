#!/usr/bin/env node

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'vms',
});

async function checkVisitor55() {
  console.log('\n🔍 CHECKING VISITOR 55\n');
  console.log('='.repeat(70));

  let conn;
  try {
    conn = await pool.getConnection();
    
    // Get visitor 55 details
    const [visitors] = await conn.query(`
      SELECT * FROM visitors WHERE visitor_id = 55
    `);

    if (visitors.length === 0) {
      console.log('\n❌ Visitor 55 not found in database');
      return;
    }

    const visitor = visitors[0];
    console.log('\n✅ Visitor 55 Details:');
    console.log(`   ID: ${visitor.visitor_id}`);
    console.log(`   Name: ${visitor.full_name}`);
    console.log(`   Mobile: ${visitor.visitor_mobile_no}`);
    console.log(`   Email: ${visitor.visitor_email}`);
    console.log(`   Photo URL: ${visitor.visitor_photo_url || 'NULL'}`);
    console.log(`   Document URL: ${visitor.document_url || 'NULL'}`);
    console.log(`   Created: ${visitor.created_at}`);

    // Get requests for visitor 55
    const [requests] = await conn.query(`
      SELECT request_id, visitor_name, status FROM visitor_requests WHERE visitor_id = 55
    `);

    console.log(`\n📋 Requests for Visitor 55: ${requests.length}`);
    for (const req of requests) {
      console.log(`   Request ID ${req.request_id}: ${req.visitor_name} (${req.status})`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('ℹ️  This visitor was created without photos/documents');
    console.log('ℹ️  Requests linked to this visitor will show null URLs');
    console.log('\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

checkVisitor55();
