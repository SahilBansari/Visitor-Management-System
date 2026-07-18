const express = require('express');
const router = express.Router();
const ftpService = require('../src/ftp');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

// Setup multer for file uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
});

// Rate limiter for FTP uploads (max 10 uploads per minute per IP)
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests
  message: 'Too many uploads from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Test FTP Connection
router.get('/test', async (req, res) => {
  try {
    console.log('\n🧪 GET /ftp/test - Testing FTP Connection');
    const result = await ftpService.testConnection();
    const stats = ftpService.getStats();
    res.json({ success: true, data: result, poolStats: stats });
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'FTP connection test failed',
      details: error.message 
    });
  }
});

// Upload file to local folder (saves to local filesystem instead of remote FTP)
router.post('/upload-local', uploadLimiter, upload.single('file'), async (req, res) => {
  let tempPath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file provided' 
      });
    }

    tempPath = req.file.path;
    const originalFileName = req.file.originalname;
    const uploadPath = req.body.uploadPath || '/vms'; // e.g., '/vms/photos' or '/vms/documents'
    const category = req.body.category || 'files';

    // Generate unique filename with timestamp and random ID to avoid caching issues
    const fileExt = path.extname(originalFileName);
    const fileBaseName = path.basename(originalFileName, fileExt);
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `${fileBaseName}_${timestamp}_${randomId}${fileExt}`;

    console.log(`\n📤 POST /ftp/upload-local - Saving ${originalFileName} locally`);
    console.log(`   Generated unique name: ${fileName}`);
    console.log(`   File size: ${req.file.size} bytes`);
    console.log(`   Category: ${category}`);
    console.log(`   From temp: ${tempPath}`);
    console.log(`   Local path: ${uploadPath}/${fileName}`);

    // Create local directory path
    const localFtpDir = path.join(__dirname, '../ftp/files');
    const targetDir = path.join(localFtpDir, uploadPath);
    const targetFilePath = path.join(targetDir, fileName);

    console.log(`   Target directory: ${targetDir}`);
    console.log(`   Target file: ${targetFilePath}`);

    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`✅ Created directory: ${targetDir}`);
    }

    // Copy file from temp to target location
    await fs.promises.copyFile(tempPath, targetFilePath);
    console.log(`✅ File saved locally: ${fileName}`);

    // Return response in expected format
    const remotePath = `${uploadPath}/${fileName}`;
    res.json({ 
      success: true, 
      data: {
        success: true,
        fileName: fileName,
        remotePath: remotePath,
        message: `File saved to ${remotePath}`
      },
      filePath: remotePath
    });
  } catch (error) {
    console.error('❌ Save failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'File save failed',
      details: error.message
    });
  } finally {
    if (tempPath) {
      fs.unlink(tempPath, (err) => {
        if (err) console.warn('Could not delete temp file:', err.message);
      });
    }
  }
});

// Upload file from local filesystem
router.post('/upload-file', uploadLimiter, upload.single('file'), async (req, res) => {
  let localPath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file provided' 
      });
    }

    localPath = req.file.path;
    const fileName = req.file.originalname;
    const uploadPath = req.body.uploadPath || '/vms';

    console.log(`\n📤 POST /ftp/upload-file - Uploading ${fileName}`);
    console.log(`   From: ${localPath}`);
    console.log(`   To: ${uploadPath}/${fileName}`);
    console.log(`   Pool stats:`, ftpService.getStats());

    const result = await ftpService.uploadFile(localPath, fileName, uploadPath);

    res.json({ 
      success: true, 
      data: result,
      poolStats: ftpService.getStats()
    });
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'File upload failed',
      details: error.message,
      poolStats: ftpService.getStats()
    });
  } finally {
    if (localPath) {
      fs.unlink(localPath, (err) => {
        if (err) console.warn('Could not delete temp file:', err.message);
      });
    }
  }
});

// Upload buffer/text content
router.post('/upload-content', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const { fileName, content, uploadPath } = req.body;

    if (!fileName || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing fileName or content' 
      });
    }

    const basePath = uploadPath || '/vms';
    console.log(`\n📤 POST /ftp/upload-content - Uploading ${fileName}`);
    console.log(`   Pool stats:`, ftpService.getStats());
    
    const buffer = Buffer.from(content, 'utf-8');
    const result = await ftpService.uploadBuffer(buffer, fileName, basePath);

    res.json({ 
      success: true, 
      data: result,
      poolStats: ftpService.getStats()
    });
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Content upload failed',
      details: error.message,
      poolStats: ftpService.getStats()
    });
  }
});

// List files from FTP
router.get('/list-files', async (req, res) => {
  try {
    console.log('\n📋 GET /ftp/list-files - Listing files');
    
    const files = await ftpService.listFiles();

    console.log(`   Pool stats:`, ftpService.getStats());
    
    res.json({ 
      success: true, 
      files,
      count: files.length,
      poolStats: ftpService.getStats()
    });
  } catch (error) {
    console.error('❌ List files failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to list files',
      details: error.message,
      poolStats: ftpService.getStats()
    });
  }
});

// Delete file from FTP
router.post('/delete-file', uploadLimiter, express.json(), async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing filePath' 
      });
    }

    console.log(`\n🗑️  POST /ftp/delete-file - Deleting ${filePath}`);
    console.log(`   Pool stats:`, ftpService.getStats());
    
    const result = await ftpService.deleteFile(filePath);

    res.json({ 
      success: true, 
      data: result,
      poolStats: ftpService.getStats()
    });
  } catch (error) {
    console.error('❌ Delete failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'File deletion failed',
      details: error.message,
      poolStats: ftpService.getStats()
    });
  }
});

// Get FTP connection status
router.get('/status', async (req, res) => {
  try {
    console.log('\n📊 GET /ftp/status - Getting connection status');
    
    const stats = ftpService.getStats();
    
    res.json({ 
      success: true,
      poolStatus: {
        maxConnections: stats.maxConnections || 3,
        created: stats.created,
        destroyed: stats.destroyed,
        available: stats.available,
        active: stats.active,
        queued: stats.queued,
        inUse: stats.inUse
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get status',
      details: error.message 
    });
  }
});

// Debug endpoint to check photos/documents in database
router.get('/debug/check-images', async (req, res) => {
  try {
    console.log('\n🔍 GET /ftp/debug/check-images - Checking for visitor photos/documents');
    const pool = require('../src/db');

    // Check visitors table
    const [visitors] = await pool.query(`
      SELECT 
        visitor_id,
        full_name,
        visitor_photo_url,
        document_url
      FROM visitors
      WHERE visitor_photo_url IS NOT NULL 
         OR document_url IS NOT NULL
      ORDER BY visitor_id DESC
      LIMIT 10
    `);

    console.log(`✅ Found ${visitors.length} visitors with photos/documents`);
    visitors.forEach((v, idx) => {
      console.log(`   ${idx + 1}. ${v.full_name}`);
      console.log(`      Photo: ${v.visitor_photo_url}`);
      console.log(`      Doc: ${v.document_url}`);
    });

    res.json({
      success: true,
      count: visitors.length,
      visitors: visitors
    });
  } catch (error) {
    console.error('❌ Error checking images:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to check images',
      details: error.message
    });
  }
});

// Download file from FTP - Use query parameter for file path
router.get('/download', async (req, res) => {
  try {
    const filePath = req.query.path;
    
    console.log(`\n📥 GET /ftp/download - Downloading file`);
    console.log(`   File path: ${filePath}`);

    if (!filePath) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing file path' 
      });
    }

    const { PassThrough } = require('stream');

    // Use connection pool for download
    return ftpService.pool.getConnection().then(async (client) => {
      try {
        console.log(`📂 Requesting file from FTP: /${filePath}`);

        // Create a PassThrough stream to buffer and proxy the file
        const passThrough = new PassThrough();
        
        // Determine content type based on file extension
        const ext = filePath.toLowerCase().split('.').pop();
        const contentTypeMap = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'pdf': 'application/pdf',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'txt': 'text/plain'
        };

        const contentType = contentTypeMap[ext] || 'application/octet-stream';
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${filePath.split('/').pop()}"`);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');

        passThrough.on('error', (err) => {
          console.error(`❌ Stream error: ${err.message}`);
          if (!res.headersSent) {
            res.status(500).json({ error: 'File stream error', details: err.message });
          }
          ftpService.pool.releaseConnection(client);
        });

        res.on('finish', () => {
          ftpService.pool.releaseConnection(client);
          console.log(`✅ Download completed for: ${filePath}`);
        });

        res.on('error', () => {
          ftpService.pool.releaseConnection(client);
        });

        // Start download
        await client.downloadTo(passThrough, `/${filePath}`);
        console.log(`✅ File stream started for: ${filePath}`);
        passThrough.pipe(res);
        
      } catch (ftpError) {
        console.error(`❌ Failed to download file from FTP: ${ftpError.message}`);
        console.error(`   Attempted path: /${filePath}`);
        
        ftpService.pool.releaseConnection(client);
        
        if (!res.headersSent) {
          res.status(404).json({
            success: false,
            error: 'File not found on FTP server',
            details: ftpError.message,
            attemptedPath: `/${filePath}`
          });
        }
      }
    }).catch((error) => {
      console.error('❌ Failed to get FTP connection:', error.message);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: 'FTP connection unavailable',
          details: error.message,
          poolStats: ftpService.getStats()
        });
      }
    });
  } catch (error) {
    console.error('❌ Download failed:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: 'File download failed',
        details: error.message 
      });
    }
  }
});

// Serve visitor photo/document via database URL path
router.get('/serve-file', async (req, res) => {
  try {
    const filePath = req.query.path;
    
    if (!filePath) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing file path parameter' 
      });
    }

    console.log(`\n📥 GET /ftp/serve-file - Serving file from local storage`);
    console.log(`   File path: ${filePath}`);

    // Extract the file path from database URL format (e.g., "/vms/photos/file.jpg")
    let cleanPath = String(filePath).trim();
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1); // Remove leading slash
    }

    console.log(`   Clean path: ${cleanPath}`);

    // Build full local file path
    const localFilePath = path.join(__dirname, '../ftp/files', cleanPath);
    
    console.log(`   Full local path: ${localFilePath}`);

    // Security check: ensure the file is within ftp/files directory
    const ftpFilesDir = path.resolve(path.join(__dirname, '../ftp/files'));
    const resolvedFilePath = path.resolve(localFilePath);
    
    if (!resolvedFilePath.startsWith(ftpFilesDir)) {
      console.error(`❌ Security violation: attempted to access file outside ftp/files directory`);
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if file exists
    if (!fs.existsSync(localFilePath)) {
      console.warn(`⚠️  File not found: ${localFilePath}`);
      return res.status(404).json({
        success: false,
        error: 'File not found',
        path: cleanPath
      });
    }

    console.log(`✅ Found file: ${localFilePath}`);

    // Determine content type based on file extension
    const ext = cleanPath.toLowerCase().split('.').pop();
    const contentTypeMap = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain'
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    const fileName = cleanPath.split('/').pop();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    // Set no-cache headers to prevent browser from caching old images
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Stream the file
    const fileStream = fs.createReadStream(localFilePath);

    fileStream.on('error', (err) => {
      console.error(`❌ File stream error: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({ error: 'File stream error', details: err.message });
      }
    });

    fileStream.on('end', () => {
      console.log(`✅ File served successfully: ${cleanPath}`);
    });

    fileStream.pipe(res);
    
  } catch (error) {
    console.error('❌ Error serving file:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: 'File serving failed',
        details: error.message 
      });
    }
  }
});

module.exports = router;
