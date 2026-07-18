const Client = require('basic-ftp').Client;
const ftpConfig = require('./ftpConfig');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class FTPConnectionPool extends EventEmitter {
  constructor(maxConnections = 3, connectionTimeout = 30000) {
    super();
    this.maxConnections = maxConnections;
    this.connectionTimeout = connectionTimeout;
    this.availableConnections = [];
    this.activeConnections = new Set();
    this.queue = [];
    this.stats = {
      created: 0,
      destroyed: 0,
      inUse: 0,
      queued: 0
    };
    
    console.log(`🏊 FTP Connection Pool initialized: max=${maxConnections}, timeout=${connectionTimeout}ms`);
  }

  async getConnection() {
    // If connection available, return it
    if (this.availableConnections.length > 0) {
      const conn = this.availableConnections.pop();
      console.log(`♻️  Reusing FTP connection (${this.activeConnections.size + 1}/${this.maxConnections} active)`);
      this.activeConnections.add(conn);
      return conn;
    }

    // If we can create more connections, do it
    if (this.activeConnections.size < this.maxConnections) {
      console.log(`➕ Creating new FTP connection (${this.activeConnections.size + 1}/${this.maxConnections})`);
      const conn = await this.createConnection();
      this.activeConnections.add(conn);
      this.stats.created++;
      return conn;
    }

    // Queue the request
    console.log(`⏳ Queueing FTP request (${this.queue.length + 1} waiting, ${this.activeConnections.size}/${this.maxConnections} active)`);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.queue.indexOf(request);
        if (index > -1) this.queue.splice(index, 1);
        reject(new Error('FTP connection request timeout'));
      }, this.connectionTimeout);

      const request = { resolve, reject, timeout };
      this.queue.push(request);
      this.stats.queued = this.queue.length;
    });
  }

  async createConnection() {
    const client = new Client();
    client.ftp.verbose = true;
    
    try {
      await client.access({
        host: ftpConfig.host,
        user: ftpConfig.user,
        password: ftpConfig.password,
        port: ftpConfig.port,
        secure: false
      });
      console.log(`✅ FTP connection established to ${ftpConfig.host}`);
      return client;
    } catch (error) {
      console.error(`❌ Failed to create FTP connection: ${error.message}`);
      throw error;
    }
  }

  releaseConnection(client) {
    this.activeConnections.delete(client);
    this.stats.inUse = this.activeConnections.size;

    // Try to assign to queued request
    if (this.queue.length > 0) {
      const request = this.queue.shift();
      this.stats.queued = this.queue.length;
      this.activeConnections.add(client);
      request.resolve(client);
      clearTimeout(request.timeout);
    } else {
      // Store for reuse
      this.availableConnections.push(client);
    }
  }

  getStats() {
    return {
      maxConnections: this.maxConnections,
      created: this.stats.created,
      destroyed: this.stats.destroyed,
      inUse: this.activeConnections.size,
      available: this.availableConnections.length,
      queued: this.queue.length,
      active: this.activeConnections.size
    };
  }

  async closeAll() {
    console.log('\n🔌 Closing all FTP connections...');
    
    for (const conn of this.availableConnections) {
      try {
        await conn.close();
        this.stats.destroyed++;
      } catch (err) {
        console.warn('Error closing connection:', err.message);
      }
    }
    
    for (const conn of this.activeConnections) {
      try {
        await conn.close();
        this.stats.destroyed++;
      } catch (err) {
        console.warn('Error closing connection:', err.message);
      }
    }
    
    this.availableConnections = [];
    this.activeConnections.clear();
    console.log(`✅ All FTP connections closed (${this.stats.destroyed} total closed)`);
  }
}

class FTPService {
  constructor() {
    this.pool = new FTPConnectionPool(3, 30000);
  }

  async executeWithConnection(operation) {
    const client = await this.pool.getConnection();
    try {
      return await operation(client);
    } finally {
      this.pool.releaseConnection(client);
    }
  }

  async testConnection() {
    console.log('\n🧪 Testing FTP Connection...');
    
    return this.executeWithConnection(async (client) => {
      try {
        const files = await client.list(ftpConfig.uploadPath);
        console.log(`✅ FTP test successful! Files in /vms: ${files.length}`);
        
        return {
          success: true,
          message: 'FTP Connection test successful',
          filesInVMS: files.length
        };
      } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        throw error;
      }
    });
  }

  async uploadFile(localFilePath, remoteFileName, uploadPath = null) {
    const basePath = uploadPath || ftpConfig.uploadPath;
    const remotePath = `${basePath}/${remoteFileName}`;

    console.log(`\n📤 Uploading file: ${localFilePath}`);
    console.log(`   Remote path: ${remotePath}`);
    console.log(`   Pool stats:`, this.getStats());

    return this.executeWithConnection(async (client) => {
      try {
        // Ensure remote directory exists
        try {
          await client.ensureDir(basePath);
        } catch (err) {
          console.warn('Could not ensure directory:', err.message);
        }

        // Upload file
        await client.uploadFrom(localFilePath, remotePath);
        console.log(`✅ File uploaded successfully: ${remoteFileName}`);
        
        return {
          success: true,
          fileName: remoteFileName,
          remotePath,
          message: `File uploaded to ${remotePath}`
        };
      } catch (error) {
        console.error('❌ File upload failed:', error.message);
        throw new Error(`Upload Error: ${error.message}`);
      }
    });
  }

  async uploadBuffer(buffer, remoteFileName, uploadPath = null) {
    const basePath = uploadPath || ftpConfig.uploadPath;
    const remotePath = `${basePath}/${remoteFileName}`;

    console.log(`\n📤 Uploading buffer: ${remoteFileName}`);
    console.log(`   Remote path: ${remotePath}`);

    return this.executeWithConnection(async (client) => {
      try {
        // Ensure remote directory exists
        try {
          await client.ensureDir(basePath);
        } catch (err) {
          console.warn('Could not ensure directory:', err.message);
        }

        // Upload from buffer
        await client.uploadFrom(buffer, remotePath);
        console.log(`✅ Buffer uploaded successfully: ${remoteFileName}`);
        
        return {
          success: true,
          fileName: remoteFileName,
          remotePath,
          message: `File uploaded to ${remotePath}`
        };
      } catch (error) {
        console.error('❌ Buffer upload failed:', error.message);
        throw new Error(`Upload Error: ${error.message}`);
      }
    });
  }

  async listFiles(dir = null) {
    const directory = dir || ftpConfig.uploadPath;
    console.log(`\n📋 Listing files in: ${directory}`);

    return this.executeWithConnection(async (client) => {
      try {
        const files = await client.list(directory);
        console.log(`✅ Found ${files.length} files`);
        
        return files.map(f => ({
          name: f.name,
          size: f.size,
          modifiedAt: f.modifiedAt,
          isDirectory: f.isDirectory
        }));
      } catch (error) {
        console.error('❌ List files failed:', error.message);
        throw new Error(`List Error: ${error.message}`);
      }
    });
  }

  async deleteFile(remoteFilePath) {
    console.log(`\n🗑️  Deleting file: ${remoteFilePath}`);

    return this.executeWithConnection(async (client) => {
      try {
        const fullPath = remoteFilePath.startsWith('/') ? remoteFilePath : `${ftpConfig.uploadPath}/${remoteFilePath}`;
        console.log(`   Full path: ${fullPath}`);

        await client.remove(fullPath);
        console.log(`✅ File deleted: ${fullPath}`);
        
        return {
          success: true,
          message: `File deleted: ${fullPath}`
        };
      } catch (error) {
        console.error('❌ Delete file failed:', error.message);
        throw new Error(`Delete Error: ${error.message}`);
      }
    });
  }

  async disconnect() {
    return this.pool.closeAll();
  }

  getStats() {
    return this.pool.getStats();
  }
}

// Create singleton instance
const ftpService = new FTPService();

// Graceful shutdown - don't auto-exit, let the app control lifecycle
process.on('exit', async () => {
  console.log('\n🛑 Process exiting, closing FTP connections...');
  try {
    await ftpService.disconnect();
  } catch (err) {
    console.error('Error during FTP disconnect:', err.message);
  }
});

// Handle interrupt signal
process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received, closing FTP connections...');
  try {
    await ftpService.disconnect();
  } catch (err) {
    console.error('Error during FTP disconnect:', err.message);
  }
  process.exit(0);
});

// Handle termination signal
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, closing FTP connections...');
  try {
    await ftpService.disconnect();
  } catch (err) {
    console.error('Error during FTP disconnect:', err.message);
  }
  process.exit(0);
});

module.exports = ftpService;
