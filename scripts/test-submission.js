// Test script for deal assumptions submission (CommonJS version)
// This script will simulate the form submission flow and test each tab's submission to the database

const http = require('http');
const https = require('https');

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(responseBody);
          resolve({ status: res.statusCode, headers: res.headers, data: parsedBody });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: responseBody });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// URL of the API (change this to match your local environment)
const API_BASE_URL = 'http://localhost:3000/api';

// Test data for creating a deal
const testDeal = {
  deal_name: 'Test Deal Submission',
  property_name: 'Test Hotel Property',
  property_address: '123 Test Street',
  city: 'Test City',
  state: 'NY',
  number_of_rooms: 150,
  property_type: 'Luxury',
  investment_amount: 1500000,
  expected_return: 8.2,
  hold_period: 5,
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
  status: 'Draft'
};

// Test data for each assumption tab
const tabsData = {
  // Property tab data is handled during deal creation
  
  acquisition: {
    acquisition_month: 6,
    acquisition_year: 2025,
    acquisition_costs: 125000,
    cap_rate_going_in: 8.5,
    hold_period: 5,
    purchase_price: 1500000,
    purchase_price_method: 'Per Room',
    purchase_price_per_key: 10000
  },
  
  financing: {
    loan_to_value: 65,
    interest_rate: 4.5,
    loan_term: 5,
    amortization_period: 30,
    debt_amount: 975000,
    equity_amount: 525000,
    lender_fee: 1.0,
    debt_coverage_ratio: 1.25
  },
  
  disposition: {
    cap_rate_exit: 9.0,
    sales_expense: 2.0,
    disposition_month: 6,
    disposition_year: 2030
  },
  
  capital: {
    capex_type: 'Standard',
    owner_funded_capex: 10.0,
    capital_expense_year1: 50000,
    capital_expense_year2: 25000,
    capital_expense_year3: 25000,
    capital_expense_year4: 25000,
    capital_expense_year5: 25000
  },
  
  inflation: {
    inflation_rate_general: 2.5,
    inflation_rate_revenue: 3.0,
    inflation_rate_expenses: 2.8,
    inflation_assumptions: 'Standard'
  },
  
  penetration: {
    comp_name: 'Comp Set A',
    comp_nbr_of_rooms: 150,
    market_adr_change: 3.0,
    market_occupancy_pct: 70.0,
    market_penetration: 100.0,
    occupied_room_growth_pct: 2.0,
    property_adr_change: 3.5,
    sample_hotel_occupancy: 75.0
  },
  
  'operating-revenue': {
    adr_base: 195.0,
    adr_growth: 3.0,
    other_revenue_percentage: 25.0,
    revpar_base: 146.25,
    revenues_total: 8000000
  },
  
  'departmental-expenses': {
    rooms_expense_par: 35.0,
    rooms_expense_por: 25.0,
    food_beverage_expense_par: 20.0,
    food_beverage_expense_por: 75.0,
    other_dept_expense_par: 10.0,
    other_dept_expense_por: 50.0,
    expenses_total: 3500000
  },
  
  'management-franchise': {
    management_fee_base: 3.0,
    management_fee_incentive: 10.0,
    management_fee_percentage: 3.0,
    franchise_fee_base: 5.0,
    franchise_fee_percentage: 5.0,
    brand_marketing_fee: 2.0
  },
  
  'undistributed-expenses-1': {
    admin_general_par: 15.0,
    admin_general_por: 6.0,
    sales_marketing_par: 12.0,
    sales_marketing_por: 5.0,
    property_ops_maintenance_par: 15.0,
    property_ops_maintenance_por: 6.0
  },
  
  'undistributed-expenses-2': {
    utilities_costs_par: 10.0,
    utilities_costs_por: 4.0,
    it_systems_par: 5.0,
    it_systems_por: 2.0
  },
  
  'non-operating-expenses': {
    property_taxes_par: 25.0,
    property_taxes_por: 4.5,
    insurance_par: 8.0,
    insurance_por: 1.5,
    income_tax_rate: 21.0
  },
  
  'ffe-reserve': {
    ffe_reserve_percentage: 4.0,
    ffe_reserve_par: 2000,
    ffe_reserve_minimum: 1500
  }
};

// Maps tab names to API endpoint parameters
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

// Create a test deal and then test each tab's submission
async function runTest() {
  console.log('Starting deal assumptions submission test...');
  let dealId = null;
  const results = {
    success: [],
    failure: []
  };
  
  try {
    // Step 1: Create a test deal
    console.log('Creating test deal...');
    
    const createDealOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/deals',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const createDealResponse = await makeRequest(createDealOptions, testDeal);
    
    if (createDealResponse.status !== 200 && createDealResponse.status !== 201) {
      throw new Error(`Failed to create deal: ${JSON.stringify(createDealResponse.data)}`);
    }
    
    dealId = createDealResponse.data.deal_id || createDealResponse.data.id;
    console.log(`Successfully created deal with ID: ${dealId}`);
    results.success.push('Create Deal');
    
    // Step 2: Test each tab's submission
    for (const [tabName, tabData] of Object.entries(tabsData)) {
      const apiTabName = tabTypeMap[tabName];
      
      if (!apiTabName) {
        console.warn(`Unknown tab name: ${tabName}. Skipping...`);
        continue;
      }
      
      console.log(`Testing submission for ${tabName} tab...`);
      
      // Add deal_id to the tab data
      const tabPayload = {
        deal_id: dealId,
        ...tabData
      };
      
      const submitTabOptions = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/deals/assumptions/${apiTabName}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      try {
        const submitTabResponse = await makeRequest(submitTabOptions, tabPayload);
        
        if (submitTabResponse.status !== 200 && submitTabResponse.status !== 201) {
          throw new Error(`Failed to submit ${tabName} tab: ${JSON.stringify(submitTabResponse.data)}`);
        }
        
        console.log(`✅ Successfully submitted ${tabName} tab`);
        results.success.push(tabName);
      } catch (tabError) {
        console.error(`❌ Error submitting ${tabName} tab:`, tabError.message);
        results.failure.push({ tab: tabName, error: tabError.message });
      }
    }
    
    // Print final results
    console.log('\n--- TEST RESULTS ---');
    console.log(`Total tests: ${results.success.length + results.failure.length}`);
    console.log(`Successful: ${results.success.length}`);
    console.log(`Failed: ${results.failure.length}`);
    
    if (results.failure.length > 0) {
      console.log('\nFailed tabs:');
      results.failure.forEach(failure => {
        console.log(`- ${failure.tab}: ${failure.error}`);
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest();
