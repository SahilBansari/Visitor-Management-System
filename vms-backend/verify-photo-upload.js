#!/usr/bin/env node

/**
 * Photo Upload Verification Script
 * Run this after submitting a visitor form with a photo
 * 
 * Usage: node verify-photo-upload.js
 */

const mysql = require('mysql2/promise');
const path = require('path');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'vms'
};

async function verifyPhotoUpload() {
  console.log('\n📸 PHOTO UPLOAD VERIFICATION\n');
  console.log('=' .repeat(60));
  
  try {
    // Connect to database
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');
    
    // Check if visitors table exists
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'visitors'`,
      [dbConfig.database]
    );
    
    if (tables.length === 0) {
      console.log('❌ Visitors table not found');
      return;
    }
    console.log('✅ Visitors table exists');
    
    // Check if visitor_photo_url column exists
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'visitors' AND COLUMN_NAME = 'visitor_photo_url'`,
      [dbConfig.database]
    );
    
    if (columns.length === 0) {
      console.log('❌ visitor_photo_url column NOT found');
      console.log('   Run: npm run init-db');
      connection.end();
      return;
    }
    console.log('✅ visitor_photo_url column exists');
    
    // Get latest 5 visitors with photos
    const [visitors] = await connection.query(
      `SELECT visitor_id, full_name, visitor_mobile_no, visitor_photo_url, created_at 
       FROM visitors 
       WHERE visitor_photo_url IS NOT NULL AND visitor_photo_url != ''
       ORDER BY created_at DESC 
       LIMIT 5`
    );
    
    if (visitors.length === 0) {
      console.log('\n⚠️  No visitors with photos found in database');
      console.log('   Next steps:');
      console.log('   1. Fill out the visitor form');
      console.log('   2. In Step 1: Capture a photo using the camera');
      console.log('   3. Complete all steps and submit');
      console.log('   4. Run this script again');
      connection.end();
      return;
    }
    
    console.log(`\n✅ Found ${visitors.length} visitor(s) with photos:\n`);
    
    visitors.forEach((visitor, index) => {
      console.log(`[${index + 1}] ${visitor.full_name}`);
      console.log(`    ID: ${visitor.visitor_id}`);
      console.log(`    Mobile: ${visitor.visitor_mobile_no}`);
      console.log(`    Photo URL: ${visitor.visitor_photo_url}`);
      console.log(`    Created: ${visitor.created_at}`);
      
      // Check if URL looks valid
      const isValidUrl = visitor.visitor_photo_url.includes('/vms/photos/');
      console.log(`    URL Valid: ${isValidUrl ? '✅' : '❌'}`);
      console.log('');
    });
    
    console.log('=' .repeat(60));
    console.log('\n✅ VERIFICATION COMPLETE\n');
    console.log('Next steps:');
    console.log('1. Check FileZilla for photos in /vms/photos/');
    console.log('2. Verify photo URL format: /vms/photos/PHOTO_[Name]_[Timestamp].jpg');
    console.log('3. Check admin dashboard to display visitor photos');
    
    connection.end();
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED\n');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Is MySQL running? (service mysql start)');
    console.error('2. Database credentials correct? (host, user, password)');
    console.error('3. Database initialized? (npm run init-db)');
  }
}

verifyPhotoUpload();
