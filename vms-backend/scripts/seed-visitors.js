const mysql = require('mysql2/promise');
const config = require('../src/config');

async function seedVisitorRequests() {
  try {
    // Use agriculture database config
    const dbConfig = config.databases.agriculture;
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('\n📝 Seeding visitor requests...');
    
    const testRequests = [
      {
        visitor_name: "Nehru",
        visitor_type: "Officer",
        mobile_number: "9890335844238",
        pass_id: "PASS9890335844238",
        host_name: "Rajesh Kumar",
        department: "Hydrology Division",
        visit_date: "2026-01-28",
        visit_start_time: "09:00:00",
        visit_end_time: "09:30:00",
        number_of_visitors: 1,
        status: "PENDING"
      },
      {
        visitor_name: "Anisha",
        visitor_type: "Vendor",
        mobile_number: "98765432104",
        pass_id: "PASS98765432104",
        host_name: "Rajesh Kumar",
        department: "Hydrology Division",
        visit_date: "2026-01-28",
        visit_start_time: "09:00:00",
        visit_end_time: "09:30:00",
        number_of_visitors: 1,
        status: "PENDING"
      },
      {
        visitor_name: "Dhiraj",
        visitor_type: "Visitor",
        mobile_number: "98765432105",
        pass_id: "PASS98765432105",
        host_name: "Rajesh Kumar",
        department: "Irrigation Dept. HQ",
        visit_date: "2026-01-28",
        visit_start_time: "09:00:00",
        visit_end_time: "09:30:00",
        number_of_visitors: 1,
        status: "APPROVED"
      },
      {
        visitor_name: "Girija",
        visitor_type: "Visitor",
        mobile_number: "98765432106",
        pass_id: "PASS98765432106",
        host_name: "Rajesh Kumar",
        department: "Hydrology Division",
        visit_date: "2026-01-28",
        visit_start_time: "09:00:00",
        visit_end_time: "09:30:00",
        number_of_visitors: 1,
        status: "APPROVED"
      }
    ];
    
    for (const req of testRequests) {
      await connection.execute(
        `INSERT INTO visitor_requests 
        (visitor_name, visitor_type, mobile_number, pass_id, host_name, department, visit_date, visit_start_time, visit_end_time, number_of_visitors, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.visitor_name, req.visitor_type, req.mobile_number, req.pass_id,
          req.host_name, req.department, req.visit_date, req.visit_start_time,
          req.visit_end_time, req.number_of_visitors, req.status
        ]
      );
      console.log(`✅ Added: ${req.visitor_name} (${req.status})`);
    }
    
    await connection.end();
    console.log('\n✅ Visitor requests seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedVisitorRequests();
