#!/bin/bash

# Test Script for Visitor Photo URL Storage
# Verifies that photos are uploaded to FTP and URLs are stored in database

echo ""
echo "======================================================================"
echo "🧪 VISITOR PHOTO URL STORAGE TEST"
echo "======================================================================"
echo ""

# Test 1: Check FTP connection
echo "🔌 Test 1: Testing FTP connection..."
FTP_TEST=$(curl -s http://localhost:3001/ftp/test | jq '.success')
if [ "$FTP_TEST" == "true" ]; then
    echo "✅ FTP connection successful"
    echo ""
else
    echo "❌ FTP connection failed"
    exit 1
fi

# Test 2: List existing files in /vms/photos
echo "📋 Test 2: Listing files in /vms/photos..."
curl -s http://localhost:3001/ftp/list-files | jq '.data[] | select(.name | contains("PHOTO")) | .name'
echo ""

# Test 3: Check recent visitor records
echo "📊 Test 3: Checking recent visitor records in database..."
echo "Run the following SQL query:"
echo "SELECT visitor_id, full_name, visitor_photo_url, document_url FROM visitors ORDER BY visitor_id DESC LIMIT 5;"
echo ""
echo "Expected: Recent records should have visitor_photo_url like '/vms/photos/PHOTO_*'"
echo "Before fix: visitor_photo_url was NULL or 'proof_*'"
echo "After fix: visitor_photo_url should be '/vms/photos/PHOTO_FullName_Timestamp.jpg'"
echo ""

echo "======================================================================"
echo "✅ VERIFICATION STEPS COMPLETE"
echo "======================================================================"
echo ""
