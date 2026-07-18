const mysql = require('mysql2/promise');

async function createDatabaseUser() {
  try {
    // Root credentials
    const rootPassword = 'root';
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: rootPassword
    });

    console.log('✓ Connected to MySQL as root');

    // Create the database user
    const dbUser = 'gmfdmmzn_vms';
    const dbPassword = 'Orbit@123';
    const dbName = 'gmfdmmzn_vms';

    // Drop user if exists (to reset permissions)
    try {
      await connection.execute(`DROP USER IF EXISTS '${dbUser}'@'localhost'`);
      console.log('✓ Removed existing user (if any)');
    } catch (err) {
      // User might not exist, that's ok
    }

    // Create new user
    await connection.execute(`CREATE USER '${dbUser}'@'localhost' IDENTIFIED BY '${dbPassword}'`);
    console.log(`✓ Created user '${dbUser}'@'localhost'`);

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✓ Created database '${dbName}'`);

    // Grant all privileges on this database to the user
    await connection.execute(`GRANT ALL PRIVILEGES ON ${dbName}.* TO '${dbUser}'@'localhost'`);
    await connection.execute(`GRANT ALL PRIVILEGES ON ${dbName}_agr.* TO '${dbUser}'@'localhost'`);
    console.log(`✓ Granted privileges to '${dbUser}' on '${dbName}' and '${dbName}_agr'`);

    // Flush privileges to apply changes
    await connection.execute(`FLUSH PRIVILEGES`);
    console.log('✓ Flushed privileges');

    await connection.end();
    console.log('\n✅ Database user setup complete!');
    console.log('You can now run: npm run init-db');
    
  } catch (error) {
    console.error('❌ Error setting up database user:');
    console.error(error.message);
    process.exit(1);
  }
}

createDatabaseUser();
