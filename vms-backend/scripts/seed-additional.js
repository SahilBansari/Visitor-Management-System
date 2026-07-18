const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedAdditionalData() {
  let connection;
  try {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'gmfdmmzn_vms',
      password: process.env.DB_PASSWORD || 'Orbit@123',
      database: process.env.DB_NAME || 'gmfdmmzn_vms'
    };

    connection = await mysql.createConnection(config);
    console.log('✓ Connected to database');

    // Add more offices
    await connection.execute(`INSERT IGNORE INTO offices (offices_id, office_name, office_address) VALUES 
      (2, 'Irrigation Dept. North District', 'North District Office'),
      (3, 'Irrigation Dept. South District', 'South District Office'),
      (4, 'Water Resources Division', 'Water Resources Building'),
      (5, 'Dam Management Section', 'Dam Management Office')
    `);
    console.log('✓ Additional offices added');

    // Add more officers
    await connection.execute(`INSERT IGNORE INTO officers (officers_id, officer_name, officer_designation, officer_email, officer_phone, officer_cabin, user_id, officer_status_id) VALUES 
      (2, 'Priya Singh', 'Senior Engineer', 'priya.singh@nic.in', '9876543222', 'A102', 2, 1),
      (3, 'Amit Patel', 'Project Manager', 'amit.patel@nic.in', '9876543223', 'B201', NULL, 1),
      (4, 'Neha Sharma', 'Assistant Engineer', 'neha.sharma@nic.in', '9876543224', 'C301', NULL, 1),
      (5, 'Rohan Kumar', 'Chief Clerk', 'rohan.kumar@nic.in', '9876543225', 'D101', NULL, 1),
      (6, 'Deepak Verma', 'Inspector', 'deepak.verma@nic.in', '9876543226', 'A103', NULL, 1),
      (7, 'Anjali Desai', 'Supervisor', 'anjali.desai@nic.in', '9876543227', 'B202', NULL, 1)
    `);
    console.log('✓ Additional officers added');

    await connection.end();
    console.log('\n✅ Additional data seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
}

seedAdditionalData();
