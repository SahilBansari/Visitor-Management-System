const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Orbit@123',
  database: process.env.DB_NAME || 'vms'
};

async function initializeDatabase() {
  let connection;
  try {
    // First connect without database to create it if it doesn't exist
    const connection1 = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root'
    });
    
    // Create database only if it doesn't exist (preserves existing data)
    await connection1.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'gmfdmmzn_vms'}`);
    await connection1.end();
    console.log('✓ Database exists or created');

    // Now connect to the vms database
    connection = await mysql.createConnection(config);
    console.log('Connected to VMS database');

    // Create tables
    console.log('Creating tables...');

    // Roles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        role_id INT AUTO_INCREMENT PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL UNIQUE
      )
    `);
    console.log('✓ Roles table created');

    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        user_mobile VARCHAR(20),
        designation_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // User roles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_role_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
      )
    `);
    console.log('✓ User roles table created');

    // Visitors table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS visitors (
        visitor_id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        visitor_mobile_no VARCHAR(20),
        visitor_email VARCHAR(255),
        visitor_photo_url VARCHAR(255),
        document_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Visitors table created');

    // Add document_url column if it doesn't exist
    try {
      await connection.execute(`ALTER TABLE visitors ADD COLUMN document_url VARCHAR(500)`);
      console.log('✓ Added document_url column to visitors table');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    // Visitor Requests table (for tracking requests with all details)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS visitor_requests (
        request_id INT AUTO_INCREMENT PRIMARY KEY,
        visitor_id INT,
        visitor_name VARCHAR(255) NOT NULL,
        visitor_type ENUM('Visitor', 'Vendor', 'Officer') DEFAULT 'Visitor',
        mobile_number VARCHAR(20) NOT NULL,
        pass_id VARCHAR(50) UNIQUE NOT NULL,
        host_name VARCHAR(255),
        department VARCHAR(255),
        visit_date DATE NOT NULL,
        visit_start_time TIME NOT NULL,
        visit_end_time TIME NOT NULL,
        number_of_visitors INT DEFAULT 1,
        status ENUM('PENDING', 'APPROVED', 'WAITING', 'REJECTED', 'COMPLETED', 'CHECKED_IN') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE SET NULL
      )
    `);
    console.log('✓ Visitor Requests table created');

    // Appointments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        appointments_id INT AUTO_INCREMENT PRIMARY KEY,
        visitor_id INT NOT NULL,
        officer_id INT,
        office_id INT,
        purpose_id INT,
        appointment_visit_date DATE,
        appointments_time_slot INT,
        number_of_visitors INT DEFAULT 1,
        appointment_status_id INT,
        appointment_created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        appointment_updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id)
      )
    `);
    console.log('✓ Appointments table created');

    // Appointment status table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS appointment_status (
        appointment_status_id INT AUTO_INCREMENT PRIMARY KEY,
        appointment_status_name VARCHAR(50) NOT NULL UNIQUE
      )
    `);
    console.log('✓ Appointment status table created');

    // Time slots table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS time_slots (
        time_slots_id INT AUTO_INCREMENT PRIMARY KEY,
        time_slots_start_time TIME,
        time_slots_end_time TIME,
        time_slots_max_capacity INT DEFAULT 10
      )
    `);
    console.log('✓ Time slots table created');

    // Officer status table - MUST be created before officers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS officer_status (
        officer_status_id INT AUTO_INCREMENT PRIMARY KEY,
        officer_status_name VARCHAR(50)
      )
    `);
    console.log('✓ Officer status table created');

    // Purpose table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS purpose (
        purpose_id INT AUTO_INCREMENT PRIMARY KEY,
        purpose_name VARCHAR(255) NOT NULL UNIQUE
      )
    `);
    console.log('✓ Purpose table created');

    // Offices table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS offices (
        offices_id INT AUTO_INCREMENT PRIMARY KEY,
        office_name VARCHAR(255),
        office_address VARCHAR(255)
      )
    `);
    console.log('✓ Offices table created');

    // Officers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS officers (
        officers_id INT AUTO_INCREMENT PRIMARY KEY,
        officer_name VARCHAR(255) NOT NULL,
        officer_designation VARCHAR(100),
        officer_email VARCHAR(255),
        officer_phone VARCHAR(20),
        officer_cabin VARCHAR(50),
        user_id INT,
        officer_status_id INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (officer_status_id) REFERENCES officer_status(officer_status_id)
      )
    `);
    console.log('✓ Officers table created');

    // Add missing columns to officers table if they don't exist
    try {
      await connection.execute(`ALTER TABLE officers ADD COLUMN officer_email VARCHAR(255)`);
      console.log('✓ Added officer_email column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    try {
      await connection.execute(`ALTER TABLE officers ADD COLUMN officer_phone VARCHAR(20)`);
      console.log('✓ Added officer_phone column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    try {
      await connection.execute(`ALTER TABLE officers ADD COLUMN officer_cabin VARCHAR(50)`);
      console.log('✓ Added officer_cabin column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    try {
      await connection.execute(`ALTER TABLE officers ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
      console.log('✓ Added created_at column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    try {
      await connection.execute(`ALTER TABLE officers ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
      console.log('✓ Added updated_at column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    // Audit logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        audit_id INT AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(255),
        activity VARCHAR(255),
        description TEXT,
        status VARCHAR(50),
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Audit logs table created');

    // Seed default data
    console.log('\nSeeding default data...');

    // Insert roles
    await connection.execute(`INSERT IGNORE INTO roles (role_id, role_name) VALUES 
      (1, 'Admin'),
      (2, 'HOD'),
      (3, 'Clerk'),
      (4, 'Officer'),
      (5, 'Viewer')
    `);
    console.log('✓ Roles seeded');

    // Insert officer statuses
    await connection.execute(`INSERT IGNORE INTO officer_status (officer_status_id, officer_status_name) VALUES 
      (1, 'active'),
      (2, 'meeting'),
      (3, 'leave'),
      (4, 'inactive')
    `);
    console.log('✓ Officer statuses seeded');

    // Insert appointment statuses
    await connection.execute(`INSERT IGNORE INTO appointment_status (appointment_status_id, appointment_status_name) VALUES 
      (1, 'pending'),
      (2, 'approved'),
      (3, 'rejected'),
      (4, 'completed')
    `);
    console.log('✓ Appointment statuses seeded');

    // Insert purposes
    await connection.execute(`INSERT IGNORE INTO purpose (purpose_id, purpose_name) VALUES 
      (1, 'Official Work'),
      (2, 'Meeting'),
      (3, 'Inquiry'),
      (4, 'Vendor/Contractor'),
      (5, 'Personal'),
      (6, 'Other'),
      (7, 'सरकारी काम'),
      (8, 'बैठक'),
      (9, 'पूछताछ'),
      (10, 'विक्रेता / ठेकेदार'),
      (11, 'व्यक्तिगत'),
      (12, 'अन्य'),
      (13, 'शासकीय काम'),
      (14, 'बैठक'),
      (15, 'चौकशी'),
      (16, 'विक्रेता / कंत्राटदार'),
      (17, 'वैयक्तिक'),
      (18, 'इतर')
    `);
    console.log('✓ Purposes seeded');

    // Insert time slots (30-minute intervals)
    await connection.execute(`INSERT IGNORE INTO time_slots (time_slots_id, time_slots_start_time, time_slots_end_time, time_slots_max_capacity) VALUES 
      (1, '09:00:00', '09:30:00', 10),
      (2, '09:30:00', '10:00:00', 10),
      (3, '10:00:00', '10:30:00', 10),
      (4, '10:30:00', '11:00:00', 10),
      (5, '11:00:00', '11:30:00', 10),
      (6, '11:30:00', '12:00:00', 10),
      (7, '14:00:00', '14:30:00', 10),
      (8, '14:30:00', '15:00:00', 10),
      (9, '15:00:00', '15:30:00', 10),
      (10, '15:30:00', '16:00:00', 10),
      (11, '16:00:00', '16:30:00', 10),
      (12, '16:30:00', '17:00:00', 10)
    `);
    console.log('✓ Time slots seeded');

    // Insert test users with plain text passwords
    await connection.execute(`INSERT IGNORE INTO users (user_id, user_email, password_hash, user_mobile) VALUES 
      (1, 'admin@nic.in', 'admin', '9876543210'),
      (2, 'hod@nic.in', 'hod', '9876543211'),
      (3, 'clerk@nic.in', 'clerk', '9876543212')
    `);
    console.log('✓ Test users seeded (admin@nic.in, hod@nic.in, clerk@nic.in)');

    // Assign roles to users
    await connection.execute(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES 
      (1, 1),
      (2, 2),
      (3, 3)
    `);
    console.log('✓ User roles assigned');

    // Insert office
    await connection.execute(`INSERT IGNORE INTO offices (offices_id, office_name, office_address) VALUES 
      (1, 'Irrigation Dept. HQ', 'HQ'),
      (2, 'Irrigation Dept. North District', 'North District Office'),
      (3, 'Irrigation Dept. South District', 'South District Office'),
      (4, 'Water Resources Division', 'Water Resources Building'),
      (5, 'Dam Management Section', 'Dam Management Office')
    `);
    console.log('✓ Offices seeded');

    // Insert officers
    await connection.execute(`INSERT IGNORE INTO officers (officers_id, officer_name, officer_designation, user_id, officer_status_id) VALUES 
      (1, 'Rajesh Kumar', 'Chief Engineer', 2, 1)
    `);
    console.log('✓ Officers seeded');

    // Insert test visitors
    await connection.execute(`INSERT IGNORE INTO visitors (visitor_id, full_name, visitor_mobile_no, visitor_email) VALUES 
      (1, 'Amit Sharma', '9876543210', 'amit@example.com'),
      (2, 'Priya Patel', '9876543211', 'priya@example.com'),
      (3, 'Rahul Singh', '9876543212', 'rahul@example.com'),
      (4, 'Neha Gupta', '9876543213', 'neha@example.com'),
      (5, 'Vikram Reddy', '9876543214', 'vikram@example.com')
    `);
    console.log('✓ Test visitors seeded');

    // Insert sample appointments
    await connection.execute(`INSERT IGNORE INTO appointments (appointments_id, visitor_id, officer_id, office_id, purpose_id, appointment_visit_date, appointments_time_slot, number_of_visitors, appointment_status_id, appointment_created_time, appointment_updated_time) VALUES 
      (1, 1, 1, 1, 1, '2026-02-20', 1, 1, 2, NOW(), NOW()),
      (2, 2, 1, 2, 2, '2026-02-20', 2, 2, 2, NOW(), NOW()),
      (3, 3, 1, 3, 3, '2026-02-21', 3, 1, 1, NOW(), NOW()),
      (4, 4, 1, 1, 4, '2026-02-21', 4, 3, 2, NOW(), NOW()),
      (5, 5, 1, 4, 5, '2026-02-22', 5, 1, 3, NOW(), NOW())
    `);
    console.log('✓ Sample appointments seeded');

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\nTest Credentials:');
    console.log('  Email: admin@nic.in | Password: admin');
    console.log('  Email: hod@nic.in | Password: hod');
    console.log('  Email: clerk@nic.in | Password: clerk');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initializeDatabase();
