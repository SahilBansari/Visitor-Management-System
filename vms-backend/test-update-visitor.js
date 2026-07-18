const axios = require('axios');

async function testUpdateVisitor() {
  try {
    console.log('🧪 Testing visitor update endpoint...\n');
    
    const requestId = 1; // Change this to an actual request ID from your database
    const updateData = {
      visitor_name: 'Test Name Updated',
      visitor_type: 'Test Purpose',
      visit_start_time: '10:00',
      visit_end_time: '11:00'
    };

    console.log(`📡 PATCH http://localhost:3001/visitors/request/${requestId}`);
    console.log('   Body:', JSON.stringify(updateData, null, 2));

    const response = await axios.patch(
      `http://localhost:3001/visitors/request/${requestId}`,
      updateData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Success Response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\n❌ Error:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('   No response received:', error.request);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

testUpdateVisitor();
