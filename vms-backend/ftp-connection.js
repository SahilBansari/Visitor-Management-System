/**
 * FTP Connection Module
 * Establishes and manages FTP connections to ftp.avanyatech.com
 */

const FtpClient = require('ftp');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Create and connect to FTP server
 * @returns {Promise<FtpClient>} Connected FTP client
 */
async function connectFTP() {
  return new Promise((resolve, reject) => {
    const ftpClient = new FtpClient();

    const ftpConfig = {
      host: process.env.FTP_HOST || 'ftp.avanyaedge.com',
      user: process.env.FTP_USER || 'vms@avanyaedge.com',
      password: process.env.FTP_PASSWORD || 'Orbit@123',
      port: parseInt(process.env.FTP_PORT || '21'),
    };

    console.log(`Connecting to FTP server: ${ftpConfig.host}:${ftpConfig.port}`);
    console.log(`Username: ${ftpConfig.user}`);

    ftpClient.on('ready', () => {
      console.log('✓ FTP connection established successfully!');
      resolve(ftpClient);
    });

    ftpClient.on('error', (err) => {
      console.error('✗ FTP Connection Error:', err.message);
      reject(err);
    });

    ftpClient.on('close', () => {
      console.log('FTP connection closed.');
    });

    ftpClient.on('end', () => {
      console.log('FTP connection ended.');
    });

    ftpClient.connect(ftpConfig);
  });
}

/**
 * Disconnect from FTP server
 * @param {FtpClient} ftpClient - FTP client instance
 * @returns {Promise<void>}
 */
async function disconnectFTP(ftpClient) {
  return new Promise((resolve, reject) => {
    ftpClient.end();
    resolve();
  });
}

/**
 * List files in FTP directory
 * @param {FtpClient} ftpClient - FTP client instance
 * @param {string} dir - Directory path (default: '/')
 * @returns {Promise<Array>} List of files
 */
async function listFiles(ftpClient, dir = '/') {
  return new Promise((resolve, reject) => {
    ftpClient.list(dir, (err, list) => {
      if (err) reject(err);
      else resolve(list);
    });
  });
}

/**
 * Upload file to FTP server
 * @param {FtpClient} ftpClient - FTP client instance
 * @param {string} localPath - Local file path
 * @param {string} remotePath - Remote file path
 * @returns {Promise<void>}
 */
async function uploadFile(ftpClient, localPath, remotePath) {
  const fs = require('fs');
  return new Promise((resolve, reject) => {
    ftpClient.put(fs.createReadStream(localPath), remotePath, (err) => {
      if (err) reject(err);
      else {
        console.log(`✓ File uploaded: ${remotePath}`);
        resolve();
      }
    });
  });
}

/**
 * Download file from FTP server
 * @param {FtpClient} ftpClient - FTP client instance
 * @param {string} remotePath - Remote file path
 * @param {string} localPath - Local file path to save
 * @returns {Promise<void>}
 */
async function downloadFile(ftpClient, remotePath, localPath) {
  const fs = require('fs');
  return new Promise((resolve, reject) => {
    ftpClient.get(remotePath, (err, stream) => {
      if (err) reject(err);
      stream.once('close', () => {
        console.log(`✓ File downloaded: ${localPath}`);
        resolve();
      });
      stream.pipe(fs.createWriteStream(localPath));
    });
  });
}

// Export functions
module.exports = {
  connectFTP,
  disconnectFTP,
  listFiles,
  uploadFile,
  downloadFile,
};

// Test connection if run directly
if (require.main === module) {
  (async () => {
    try {
      console.log('Starting FTP connection test...\n');
      const ftpClient = await connectFTP();

      // List root directory
      console.log('\nListing root directory:');
      const files = await listFiles(ftpClient);
      files.forEach(file => {
        console.log(`  ${file.name} (${file.type === 'd' ? 'DIR' : 'FILE'} - ${file.size} bytes)`);
      });

      console.log('\n✓ FTP connection test completed successfully!');
      await disconnectFTP(ftpClient);
      process.exit(0);
    } catch (error) {
      console.error('✗ Test failed:', error.message);
      process.exit(1);
    }
  })();
}
