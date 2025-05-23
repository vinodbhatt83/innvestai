// Test API endpoint for submitting all deal assumption tabs

import { pool } from '../../../lib/db';
import { saveDealAssumptionTab } from '../../../utils/dealAssumptions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dealId } = req.body;

  if (!dealId) {
    return res.status(400).json({ error: 'Deal ID is required' });
  }

  // Test data for each tab based on what the database requires
  const testData = {
    property: {
      property_name: 'Test Property Updated',
      property_address: '123 Test St',
      city: 'Test City',
      state: 'NY',
      property_type: 'Luxury',
      number_of_rooms: 150,
      status: 'Draft'
    },
    acquisition: {
      acquisition_month: 5,
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
    'revenue': {
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

  // Map of frontend tab names to API endpoint keys
  const frontendToApiMap = {
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

  // Check if the deal exists first
  const client = await pool.connect();
  
  try {
    // Verify the deal exists
    const dealCheck = await client.query(
      'SELECT * FROM deals WHERE deal_id = $1',
      [dealId]
    );
    
    if (dealCheck.rows.length === 0) {
      return res.status(404).json({ error: `Deal with ID ${dealId} not found` });
    }
    
    // Results container
    const results = {
      dealId,
      tabResults: [],
      startTime: new Date().toISOString(),
      summary: {
        total: Object.keys(frontendToApiMap).length,
        successful: 0,
        failed: 0
      }
    };
    
    // Test each tab one by one
    for (const [frontendTabName, apiTabName] of Object.entries(frontendToApiMap)) {
      try {
        console.log(`Testing tab submission: ${frontendTabName} -> ${apiTabName}`);
        
        if (!testData[apiTabName]) {
          throw new Error(`No test data defined for tab: ${apiTabName}`);
        }
        
        // Submit the data for this tab
        const result = await saveDealAssumptionTab(frontendTabName, dealId, testData[apiTabName]);
        
        // Record success
        results.tabResults.push({
          tabName: frontendTabName,
          apiTabName,
          success: true,
          result,
          message: `Successfully saved ${frontendTabName} tab data`
        });
        
        results.summary.successful++;
      } catch (error) {
        // Record failure
        results.tabResults.push({
          tabName: frontendTabName,
          apiTabName,
          success: false,
          error: error.message,
          message: `Failed to save ${frontendTabName} tab data: ${error.message}`
        });
        
        results.summary.failed++;
      }
      
      // Add a small delay between submissions
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Finalize results
    results.endTime = new Date().toISOString();
    
    return res.status(200).json({
      success: results.summary.failed === 0,
      results
    });
    
  } catch (error) {
    console.error('Error testing all tabs:', error);
    
    return res.status(500).json({
      error: 'Failed to test all tabs',
      message: error.message,
      details: error.toString()
    });
  } finally {
    client.release();
  }
}
