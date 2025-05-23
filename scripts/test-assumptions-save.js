// Test script to verify the assumptions saving functionality
const axios = require('axios');

// Test data
const testData = {
  dealId: 1, // Replace with a valid deal ID
  tabs: [
    {
      name: 'acquisition',
      data: {
        acquisition_month: 'January',
        acquisition_year: 2024,
        acquisition_costs: 50000,
        cap_rate_going_in: 8.5,
        hold_period: 5,
        purchase_price: 5000000,
        purchase_price_method: 'Per Room'
      }
    },
    {
      name: 'financing',
      data: {
        loan_to_value: 65,
        interest_rate: 4.5,
        loan_term: 10,
        amortization_period: 25,
        debt_coverage_ratio: 1.25,
        lender_fee: 2
      }
    },
    {
      name: 'disposition',
      data: {
        cap_rate_exit: 9.0,
        sales_expense: 3.0,
        disposition_month: 'December',
        disposition_year: 2029
      }
    }
  ]
};

// Function to test saving an assumption tab
async function testSaveAssumption(tabName, dealId, tabData) {
  try {
    console.log(`Testing ${tabName} tab save...`);
    
    // Get the endpoint based on the tab name
    const tabTypeMap = {
      'property': 'property',
      'acquisition': 'acquisition',
      'financing': 'financing',
      'disposition': 'disposition',
      'capital': 'capital-expense',
      'inflation': 'inflation',
      'penetration': 'penetration',
      'operating-revenue': 'revenue',
      'departmental-expenses': 'dept-expense',
      'management-franchise': 'mgmt-fee',
      'undistributed-expenses-1': 'undist1',
      'undistributed-expenses-2': 'undist2', 
      'non-operating-expenses': 'nonop-expense',
      'ffe-reserve': 'ffe'
    };
    
    const endpoint = `http://localhost:3000/api/deals/assumptions/${tabTypeMap[tabName]}`;
      console.log(`Saving ${tabName} to endpoint ${endpoint}`);
    console.log('Payload:', { deal_id: dealId, ...tabData });
    
    const response = await axios({
      method: 'POST',
      url: endpoint,
      headers: { 'Content-Type': 'application/json' },
      data: { deal_id: dealId, ...tabData }
    });
    
    console.log(`${tabName} response status: ${response.status}`);
    console.log(`${tabName} response:`, response.data);
    
    return {
      tabName,
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      response: response.data
    };  } catch (error) {
    console.error(`Error testing ${tabName} tab:`, error);
    
    // Handle axios error responses
    if (error.response) {
      console.error('Error response data:', error.response.data);
      return {
        tabName,
        success: false,
        status: error.response.status,
        error: error.response.data
      };
    }
    
    return {
      tabName,
      success: false,
      error: error.message
    };
  }
}

// Main test function
async function runTests() {
  console.log('Starting assumption save tests...');
  
  const results = [];
  
  // Test each tab
  for (const tab of testData.tabs) {
    const result = await testSaveAssumption(tab.name, testData.dealId, tab.data);
    results.push(result);
  }
  
  // Summary
  console.log('\n=== TEST RESULTS ===');
  const successful = results.filter(r => r.success).length;
  console.log(`${successful} of ${results.length} tests passed`);
  
  for (const result of results) {
    console.log(`${result.tabName}: ${result.success ? 'PASS' : 'FAIL'}`);
    if (!result.success) {
      console.log(`  Error: ${result.error || JSON.stringify(result.response)}`);
    }
  }
}

// Run the tests
runTests().catch(console.error);
