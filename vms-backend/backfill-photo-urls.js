#!/usr/bin/env node

/**
 * Backfill Photo & Document URLs for Existing Visitor Requests
 * 
 * This script updates existing visitor_requests that have a visitor_id
 * but null photo/document URLs by fetching the URLs from the linked
 * visitor records.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'vms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function backfillPhotoDocumentUrls() {
  console.log('\n📸 BACKFILL PHOTO & DOCUMENT URLs FOR EXISTING REQUESTS\n');
  console.log('='.repeat(70));

  let conn;
  try {
    conn = await pool.getConnection();
    
    // Step 1: Check how many requests have null URLs but valid visitor_id
    console.log('\n📊 Step 1: Analyzing missing URLs...');
    const [statsResult] = await conn.query(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN visitor_id IS NOT NULL THEN 1 ELSE 0 END) as with_visitor_id,
        SUM(CASE WHEN visitor_id IS NOT NULL AND visitor_photo_url IS NULL THEN 1 ELSE 0 END) as missing_photos,
        SUM(CASE WHEN visitor_id IS NOT NULL AND document_url IS NULL THEN 1 ELSE 0 END) as missing_docs
      FROM visitor_requests
    `);

    const stats = statsResult[0];
    console.log(`   Total Requests: ${stats.total_requests}`);
    console.log(`   With Visitor ID: ${stats.with_visitor_id}`);
    console.log(`   Missing Photos: ${stats.missing_photos}`);
    console.log(`   Missing Documents: ${stats.missing_docs}`);

    // Step 2: Get requests that need updating
    console.log('\n📋 Step 2: Finding requests to update...');
    const [requestsToUpdate] = await conn.query(`
      SELECT 
        r.request_id,
        r.visitor_id,
        r.visitor_name,
        r.visitor_photo_url as current_photo,
        r.document_url as current_doc,
        v.visitor_photo_url as visitor_photo,
        v.document_url as visitor_doc
      FROM visitor_requests r
      LEFT JOIN visitors v ON r.visitor_id = v.visitor_id
      WHERE r.visitor_id IS NOT NULL 
        AND (r.visitor_photo_url IS NULL OR r.document_url IS NULL)
        AND (v.visitor_photo_url IS NOT NULL OR v.document_url IS NOT NULL)
      LIMIT 20
    `);

    if (requestsToUpdate.length === 0) {
      console.log('   ✅ No requests need updating!');
      console.log('\n' + '='.repeat(70));
      console.log('✅ BACKFILL COMPLETE - All URLs are already present\n');
      return;
    }

    console.log(`   Found ${requestsToUpdate.length} requests to update:`);
    
    // Step 3: Display what will be updated
    console.log('\n📝 Step 3: Preview of updates:');
    let updateCount = 0;
    const updates = [];

    for (const req of requestsToUpdate) {
      const photoUrl = req.current_photo || req.visitor_photo;
      const docUrl = req.current_doc || req.visitor_doc;
      
      if (photoUrl || docUrl) {
        updateCount++;
        updates.push({ request_id: req.request_id, visitor_id: req.visitor_id, photoUrl, docUrl });
        console.log(`   Request ${req.request_id}:`);
        if (req.current_photo === null && req.visitor_photo) {
          console.log(`     📸 Photo: NULL → ${req.visitor_photo}`);
        }
        if (req.current_doc === null && req.visitor_doc) {
          console.log(`     📄 Document: NULL → ${req.visitor_doc}`);
        }
      }
    }

    if (updateCount === 0) {
      console.log('   No updates possible (visitor records also have null URLs)');
      console.log('\n' + '='.repeat(70));
      console.log('✅ BACKFILL COMPLETE\n');
      return;
    }

    // Step 4: Apply the updates
    console.log(`\n💾 Step 4: Applying updates to ${updateCount} requests...`);
    
    for (const update of updates) {
      if (update.photoUrl || update.docUrl) {
        const [result] = await conn.query(`
          UPDATE visitor_requests
          SET 
            visitor_photo_url = COALESCE(visitor_photo_url, ?),
            document_url = COALESCE(document_url, ?)
          WHERE request_id = ?
        `, [update.photoUrl || null, update.docUrl || null, update.request_id]);

        console.log(`   ✅ Updated request ${update.request_id}: ${result.affectedRows} row(s) affected`);
      }
    }

    // Step 5: Verify the updates
    console.log('\n✅ Step 5: Verifying updates...');
    const [verifyResult] = await conn.query(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN visitor_id IS NOT NULL AND visitor_photo_url IS NOT NULL THEN 1 ELSE 0 END) as with_photos,
        SUM(CASE WHEN visitor_id IS NOT NULL AND document_url IS NOT NULL THEN 1 ELSE 0 END) as with_docs,
        SUM(CASE WHEN visitor_id IS NOT NULL AND visitor_photo_url IS NULL THEN 1 ELSE 0 END) as still_missing_photos,
        SUM(CASE WHEN visitor_id IS NOT NULL AND document_url IS NULL THEN 1 ELSE 0 END) as still_missing_docs
      FROM visitor_requests
    `);

    const finalStats = verifyResult[0];
    console.log(`   Total Requests: ${finalStats.total_requests}`);
    console.log(`   With Photos: ${finalStats.with_photos}`);
    console.log(`   With Documents: ${finalStats.with_docs}`);
    console.log(`   Still Missing Photos: ${finalStats.still_missing_photos}`);
    console.log(`   Still Missing Documents: ${finalStats.still_missing_docs}`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ BACKFILL COMPLETE\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

backfillPhotoDocumentUrls();
