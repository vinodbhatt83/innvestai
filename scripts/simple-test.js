// Small debug script to send a request to our API endpoint
const axios = require('axios');
const PORT = process.env.PORT || 3001;

async function testAcquisition() {
  try {
    console.log(`Testing acquisition endpoint on http://localhost:${PORT}/api/deals/assumptions/acquisition`);
    
    const payload = {
      deal_id: 1,
      acquisition_month: 'January',
      acquisition_year: 2024,
      acquisition_costs: 50000,
      cap_rate_going_in: 8.5,
      hold_period: 5,
      purchase_price: 5000000,
      purchase_price_method: 'Per Room'
    };
    
    console.log('Sending payload:', payload);
    
    const response = await axios({
      method: 'POST',
      url: `http://localhost:${PORT}/api/deals/assumptions/acquisition`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: payload,
      validateStatus: () => true // Accept any status code
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    if (response.status >= 200 && response.status < 300) {
      console.log('✓ Test successful!');
      process.exit(0);
    } else {
      console.log('✗ Test failed with status:', response.status);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during test:', error.message);
    process.exit(1);
  }
}

testAcquisition();
