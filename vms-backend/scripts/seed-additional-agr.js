const mysql = require('mysql2/promise');

async function seedAdditionalData() {
  let connection;
  try {
    const config = {
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'vms_agriculture'
    };

    connection = await mysql.createConnection(config);
    console.log('✓ Connected to agriculture database');

    // Add more offices
    await connection.execute(`INSERT IGNORE INTO offices (offices_id, office_name, office_address) VALUES 
      (2, 'Agriculture Dept. North Region', 'North Region Office'),
      (3, 'Agriculture Dept. South Region', 'South Region Office'),
      (4, 'Crop Monitoring Division', 'Crop Monitoring Building'),
      (5, 'Agricultural Extension Section', 'Extension Office')
    `);
    console.log('✓ Additional offices added');

    // Add more officers
    await connection.execute(`INSERT IGNORE INTO officers (officers_id, officer_name, officer_designation, officer_email, officer_phone, officer_cabin, user_id, officer_status_id) VALUES 
      (2, 'Dr. Ramesh Singh', 'Senior Agronomist', 'ramesh.singh@agriculture.gov.in', '9876543332', 'A102', 2, 1),
      (3, 'Maya Verma', 'Crop Specialist', 'maya.verma@agriculture.gov.in', '9876543333', 'B201', NULL, 1),
      (4, 'Vikram Patel', 'Soil Expert', 'vikram.patel@agriculture.gov.in', '9876543334', 'C301', NULL, 1),
      (5, 'Harshita Singh', 'Agricultural Extension Officer', 'harshita.singh@agriculture.gov.in', '9876543335', 'D101', NULL, 1),
      (6, 'Arun Kumar', 'Fertilizer Inspector', 'arun.kumar@agriculture.gov.in', '9876543336', 'A103', NULL, 1),
      (7, 'Soumya Dutta', 'Horticulture Officer', 'soumya.dutta@agriculture.gov.in', '9876543337', 'B202', NULL, 1)
    `);
    console.log('✓ Additional officers added');

    await connection.end();
    console.log('\n✅ Additional data seeded to agriculture database successfully!');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
}

seedAdditionalData();
