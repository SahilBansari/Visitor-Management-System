const mysql = require('mysql2/promise');
const config = require('./config');

// Create default pool (irrigation database)
const db = config.db;
const pool = mysql.createPool({
  host: db.host,
  user: db.user,
  password: db.password,
  database: db.database,
  port: db.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create database-specific pools
const pools = {};
for (const [dbName, dbConfig] of Object.entries(config.databases)) {
  pools[dbName] = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    port: dbConfig.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log(`✓ Connection pool created for ${dbName} database`);
}

module.exports = pool;
module.exports.getPool = (databaseName = 'gmfdmmzn_vms') => {
  return pools[databaseName] || pool;
};
module.exports.pools = pools;
