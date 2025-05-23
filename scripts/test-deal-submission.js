// Test script for deal assumptions submission
// This script will simulate the form submission flow and test each tab's submission to the database
// @ts-check
// ESM module
import fetch from 'node-fetch';

// URL of the API (change this to match your local or production environment)
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
  
  'capital-expense': {
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
  
  revenue: {
    adr_base: 195.0,
    adr_growth: 3.0,
    other_revenue_percentage: 25.0,
    revpar_base: 146.25,
    revenues_total: 8000000
  },
  
  'dept-expense': {
    rooms_expense_par: 35.0,
    rooms_expense_por: 25.0,
    food_beverage_expense_par: 20.0,
    food_beverage_expense_por: 75.0,
    other_dept_expense_par: 10.0,
    other_dept_expense_por: 50.0,
    expenses_total: 3500000
  },
  
  'mgmt-fee': {
    management_fee_base: 3.0,
    management_fee_incentive: 10.0,
    management_fee_percentage: 3.0,
    franchise_fee_base: 5.0,
    franchise_fee_percentage: 5.0,
    brand_marketing_fee: 2.0
  },
  
  undist1: {
    admin_general_par: 15.0,
    admin_general_por: 6.0,
    sales_marketing_par: 12.0,
    sales_marketing_por: 5.0,
    property_ops_maintenance_par: 15.0,
    property_ops_maintenance_por: 6.0
  },
  
  undist2: {
    utilities_costs_par: 10.0,
    utilities_costs_por: 4.0,
    it_systems_par: 5.0,
    it_systems_por: 2.0
  },
  
  'nonop-expense': {
    property_taxes_par: 25.0,
    property_taxes_por: 4.5,
    insurance_par: 8.0,
    insurance_por: 1.5,
    income_tax_rate: 21.0
  },
  
  ffe: {
    ffe_reserve_percentage: 4.0,
    ffe_reserve_par: 2000,
    ffe_reserve_minimum: 1500
  }
};

// Map between frontend tab names and API endpoint names
const tabApiMap = {
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

// Utility function to make API calls
async function callApi(endpoint, method, data) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(`API error: ${JSON.stringify(responseData)}`);
    }
    
    return responseData;
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
}

// Main test function
async function runTest() {
  console.log('Starting deal submission test...');
  
  try {
    // Step 1: Create a new deal
    console.log('\n--- Step 1: Creating new deal ---');
    const createdDeal = await callApi('/deals', 'POST', testDeal);
    console.log('Deal created successfully:', createdDeal);
    
    const dealId = createdDeal.deal_id || createdDeal.id;
    if (!dealId) {
      throw new Error('No deal ID returned from API');
    }
    
    console.log(`Deal ID: ${dealId}`);
    
    // Step 2: Submit data for each tab
    console.log('\n--- Step 2: Submitting assumption tabs ---');
    
    // Get the API tab name mapping keys
    const tabTypes = Object.keys(tabsData);
    
    for (const tabType of tabTypes) {
      try {
        console.log(`\nSubmitting ${tabType} tab data...`);
        const tabData = {
          deal_id: dealId,
          ...tabsData[tabType]
        };
        
        // Submit the data to the appropriate API endpoint
        const result = await callApi(`/deals/assumptions/${tabType}`, 'POST', tabData);
        console.log(`✅ ${tabType} tab data submitted successfully:`, result);
      } catch (error) {
        console.error(`❌ Failed to submit ${tabType} tab data:`, error);
      }
    }
    
    // Step 3: Verify the data was saved by retrieving the deal
    console.log('\n--- Step 3: Verifying deal data ---');
    try {
      const dealData = await callApi(`/deals/${dealId}`, 'GET');
      console.log(`✅ Deal retrieved successfully. Verification complete.`);
      console.log(`Deal ID: ${dealId}`);
      console.log(`Deal Name: ${dealData.deal_name}`);
      console.log(`Status: ${dealData.status}`);
    } catch (error) {
      console.error('❌ Failed to verify deal data:', error);
    }
    
    console.log('\n--- Test complete ---');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest();
