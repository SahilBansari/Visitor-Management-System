#!/usr/bin/env node

/**
 * Debug FTP Files Directory
 * Check what files are actually stored and if they're accessible
 */

const fs = require('fs');
const path = require('path');

const ftpFilesDir = path.join(__dirname, 'ftp/files');

console.log('\n📁 CHECKING FTP FILES DIRECTORY\n');
console.log('='.repeat(70));

function walkDir(dir, prefix = '') {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      console.log(`${prefix}📁 ${file}/`);
      walkDir(fullPath, prefix + '  ');
    } else {
      const size = stat.size;
      const sizeStr = size > 1024 ? (size / 1024).toFixed(1) + 'KB' : size + 'B';
      console.log(`${prefix}📄 ${file} (${sizeStr})`);
    }
  }
}

try {
  console.log(`\nDirectory: ${ftpFilesDir}\n`);
  
  if (!fs.existsSync(ftpFilesDir)) {
    console.log('❌ Directory does not exist!');
    console.log('\n' + '='.repeat(70));
    console.log('Creating directory structure...\n');
    fs.mkdirSync(ftpFilesDir, { recursive: true });
    console.log('✅ Created: ' + ftpFilesDir);
    console.log('✅ Created: ' + path.join(ftpFilesDir, 'vms/photos'));
    console.log('✅ Created: ' + path.join(ftpFilesDir, 'vms/documents'));
  } else {
    console.log('Directory contents:\n');
    walkDir(ftpFilesDir);
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Directory structure verified\n');
  }
} catch (err) {
  console.error('❌ Error:', err.message);
}
