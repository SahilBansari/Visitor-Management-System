#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n' + '='.repeat(70));
console.log('🔍 FTP SUBDIRECTORY ORGANIZATION - VERIFICATION REPORT');
console.log('='.repeat(70) + '\n');

const checks = [];

// Check 1: FTP Service
console.log('📋 Check 1: FTP Service Methods');
const ftpServicePath = path.join(__dirname, 'vms-backend/src/ftp.js');
if (fs.existsSync(ftpServicePath)) {
  const ftpContent = fs.readFileSync(ftpServicePath, 'utf8');
  const hasUploadPathParam = ftpContent.includes('uploadPath');
  const hasEnsureDir = ftpContent.includes('ensureDir');
  const hasBasePath = ftpContent.includes('basePath');
  
  checks.push({
    name: 'uploadPath parameter',
    status: hasUploadPathParam ? '✅' : '❌',
    file: 'vms-backend/src/ftp.js'
  });
  checks.push({
    name: 'ensureDir() call',
    status: hasEnsureDir ? '✅' : '❌',
    file: 'vms-backend/src/ftp.js'
  });
  checks.push({
    name: 'basePath variable',
    status: hasBasePath ? '✅' : '❌',
    file: 'vms-backend/src/ftp.js'
  });
  
  console.log(`  ${checks[0].status} ${checks[0].name}`);
  console.log(`  ${checks[1].status} ${checks[1].name}`);
  console.log(`  ${checks[2].status} ${checks[2].name}`);
} else {
  console.log('  ❌ File not found');
}

// Check 2: FTP Routes
console.log('\n📋 Check 2: FTP API Routes');
const ftpRoutesPath = path.join(__dirname, 'vms-backend/routes/ftp.js');
if (fs.existsSync(ftpRoutesPath)) {
  const routesContent = fs.readFileSync(ftpRoutesPath, 'utf8');
  const hasUploadPathInRoute = routesContent.match(/uploadPath\s*=\s*req\.body\.uploadPath/);
  const hasDefaultPath = routesContent.match(/\|\|\s*['"]\/vms['"]/);
  
  checks.push({
    name: 'uploadPath extraction',
    status: hasUploadPathInRoute ? '✅' : '❌',
    file: 'vms-backend/routes/ftp.js'
  });
  checks.push({
    name: 'Default path handling',
    status: hasDefaultPath ? '✅' : '❌',
    file: 'vms-backend/routes/ftp.js'
  });
  
  console.log(`  ${checks[3].status} ${checks[3].name}`);
  console.log(`  ${checks[4].status} ${checks[4].name}`);
} else {
  console.log('  ❌ File not found');
}

// Check 3: Visitors API
console.log('\n📋 Check 3: Visitors API');
const visitorsRoutesPath = path.join(__dirname, 'vms-backend/routes/visitors.js');
if (fs.existsSync(visitorsRoutesPath)) {
  const visitorsContent = fs.readFileSync(visitorsRoutesPath, 'utf8');
  const hasPhotoUrl = visitorsContent.includes('visitor_photo_url');
  const hasDocumentUrl = visitorsContent.includes('document_url');
  
  checks.push({
    name: 'visitor_photo_url field',
    status: hasPhotoUrl ? '✅' : '❌',
    file: 'vms-backend/routes/visitors.js'
  });
  checks.push({
    name: 'document_url field',
    status: hasDocumentUrl ? '✅' : '❌',
    file: 'vms-backend/routes/visitors.js'
  });
  
  console.log(`  ${checks[5].status} ${checks[5].name}`);
  console.log(`  ${checks[6].status} ${checks[6].name}`);
} else {
  console.log('  ❌ File not found');
}

// Check 4: Database Schema
console.log('\n📋 Check 4: Database Schema');
const initDbPath = path.join(__dirname, 'vms-backend/scripts/init-db.js');
if (fs.existsSync(initDbPath)) {
  const initDbContent = fs.readFileSync(initDbPath, 'utf8');
  const hasVisitorPhotoColumn = initDbContent.includes('visitor_photo_url');
  const hasDocumentColumn = initDbContent.includes('document_url');
  
  checks.push({
    name: 'visitor_photo_url column',
    status: hasVisitorPhotoColumn ? '✅' : '❌',
    file: 'vms-backend/scripts/init-db.js'
  });
  checks.push({
    name: 'document_url column',
    status: hasDocumentColumn ? '✅' : '❌',
    file: 'vms-backend/scripts/init-db.js'
  });
  
  console.log(`  ${checks[7].status} ${checks[7].name}`);
  console.log(`  ${checks[8].status} ${checks[8].name}`);
} else {
  console.log('  ❌ File not found');
}

// Check 5: FaceIdMatch Component
console.log('\n📋 Check 5: FaceIdMatch Component');
const faceIdPath = path.join(__dirname, 'components/FaceIdMatch/FaceIdMatch.tsx');
if (fs.existsSync(faceIdPath)) {
  const faceIdContent = fs.readFileSync(faceIdPath, 'utf8');
  const hasOnPhotoCapture = faceIdContent.includes('onPhotoCapture');
  const callsCallback = faceIdContent.includes('if (onPhotoCapture)');
  
  checks.push({
    name: 'onPhotoCapture callback',
    status: hasOnPhotoCapture ? '✅' : '❌',
    file: 'components/FaceIdMatch/FaceIdMatch.tsx'
  });
  checks.push({
    name: 'Callback invocation',
    status: callsCallback ? '✅' : '❌',
    file: 'components/FaceIdMatch/FaceIdMatch.tsx'
  });
  
  console.log(`  ${checks[9].status} ${checks[9].name}`);
  console.log(`  ${checks[10].status} ${checks[10].name}`);
} else {
  console.log('  ❌ File not found');
}

// Check 6: Step1Identity Component
console.log('\n📋 Check 6: Step1Identity Component');
const step1Path = path.join(__dirname, 'components/wizard/Step1Identity.tsx');
if (fs.existsSync(step1Path)) {
  const step1Content = fs.readFileSync(step1Path, 'utf8');
  const hasPhotoCaptureProp = step1Content.includes('onPhotoCapture');
  const updateFormDataPhoto = step1Content.includes('updateFormData(\'photo\'');
  
  checks.push({
    name: 'onPhotoCapture prop',
    status: hasPhotoCaptureProp ? '✅' : '❌',
    file: 'components/wizard/Step1Identity.tsx'
  });
  checks.push({
    name: 'Update form photo',
    status: updateFormDataPhoto ? '✅' : '❌',
    file: 'components/wizard/Step1Identity.tsx'
  });
  
  console.log(`  ${checks[11].status} ${checks[11].name}`);
  console.log(`  ${checks[12].status} ${checks[12].name}`);
} else {
  console.log('  ❌ File not found');
}

// Check 7: Step5Payment Component
console.log('\n📋 Check 7: Step5Payment Component');
const step5Path = path.join(__dirname, 'components/wizard/Step5Payment.tsx');
if (fs.existsSync(step5Path)) {
  const step5Content = fs.readFileSync(step5Path, 'utf8');
  const uploadPhotoPath = step5Content.includes("uploadPath', '/vms/photos'");
  const uploadDocPath = step5Content.includes("uploadPath', '/vms/documents'");
  const convertsDataUrl = step5Content.includes('await fetch(formData.photo)');
  
  checks.push({
    name: 'Photo upload to /vms/photos',
    status: uploadPhotoPath ? '✅' : '❌',
    file: 'components/wizard/Step5Payment.tsx'
  });
  checks.push({
    name: 'Document upload to /vms/documents',
    status: uploadDocPath ? '✅' : '❌',
    file: 'components/wizard/Step5Payment.tsx'
  });
  checks.push({
    name: 'Data URL to Blob conversion',
    status: convertsDataUrl ? '✅' : '❌',
    file: 'components/wizard/Step5Payment.tsx'
  });
  
  console.log(`  ${checks[13].status} ${checks[13].name}`);
  console.log(`  ${checks[14].status} ${checks[14].name}`);
  console.log(`  ${checks[15].status} ${checks[15].name}`);
} else {
  console.log('  ❌ File not found');
}

// Check 8: API Service
console.log('\n📋 Check 8: Frontend API Service');
const apiServicePath = path.join(__dirname, 'services/api.ts');
if (fs.existsSync(apiServicePath)) {
  const apiContent = fs.readFileSync(apiServicePath, 'utf8');
  const hasPhotoUrlParam = apiContent.includes('visitor_photo_url');
  const hasDocumentUrlParam = apiContent.includes('document_url');
  
  checks.push({
    name: 'visitor_photo_url in API',
    status: hasPhotoUrlParam ? '✅' : '❌',
    file: 'services/api.ts'
  });
  checks.push({
    name: 'document_url in API',
    status: hasDocumentUrlParam ? '✅' : '❌',
    file: 'services/api.ts'
  });
  
  console.log(`  ${checks[16].status} ${checks[16].name}`);
  console.log(`  ${checks[17].status} ${checks[17].name}`);
} else {
  console.log('  ❌ File not found');
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 SUMMARY');
console.log('='.repeat(70));

const passed = checks.filter(c => c.status === '✅').length;
const failed = checks.filter(c => c.status === '❌').length;
const total = checks.length;

console.log(`\n✅ Passed: ${passed}/${total}`);
console.log(`❌ Failed: ${failed}/${total}`);

if (failed === 0) {
  console.log('\n🎉 All checks passed! FTP subdirectory organization is properly configured.\n');
} else {
  console.log('\n⚠️  Some checks failed. Please review the output above.\n');
  console.log('Failed checks:');
  checks.filter(c => c.status === '❌').forEach(c => {
    console.log(`  - ${c.name} (${c.file})`);
  });
  console.log('');
}

// Expected FTP structure
console.log('📂 Expected FTP Directory Structure:');
console.log(`
    ftp.avanyatech.com
    └── /vms/
        ├── /photos/
        │   ├── PHOTO_FullName_1701234567890.jpg
        │   └── ...
        └── /documents/
            ├── ID_FullName_1701234567890.pdf
            └── ...
`);

console.log('='.repeat(70) + '\n');
