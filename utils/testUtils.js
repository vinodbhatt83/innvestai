// Test utilities for deal assumptions
import { saveDealAssumptionTab } from './dealAssumptions';

/**
 * Tests submission of a specific tab's data to the database
 * @param {string} tabName - The name of the tab to test
 * @param {number} dealId - The ID of an existing deal to test with
 * @param {object} customData - Custom data to use for testing (optional)
 * @returns {Promise<object>} - The result of the submission test
 */
export async function testTabSubmission(tabName, dealId, customData = {}) {
  try {
    if (!dealId) {
      throw new Error('dealId is required for testing tab submission');
    }

    // Default test data for each tab
    const defaultTestData = {
      property: {
        property_name: 'Test Property',
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

    // Check if the tab exists in our default test data
    if (!defaultTestData[tabName]) {
      throw new Error(`No default test data available for tab: ${tabName}`);
    }

    // Merge default data with any custom data provided
    const testData = {
      ...defaultTestData[tabName],
      ...customData
    };

    console.log(`Testing submission of ${tabName} tab for deal ID ${dealId}`);
    console.log('Test data:', testData);

    // Try to save the tab data
    const startTime = Date.now();
    const result = await saveDealAssumptionTab(tabName, dealId, testData);
    const duration = Date.now() - startTime;

    return {
      success: true,
      tabName,
      dealId,
      result,
      duration,
      message: `Successfully saved ${tabName} tab data in ${duration}ms`
    };
  } catch (error) {
    console.error(`Error testing ${tabName} tab submission:`, error);
    return {
      success: false,
      tabName,
      dealId,
      error: error.message,
      errorDetails: error,
      message: `Failed to save ${tabName} tab data: ${error.message}`
    };
  }
}

/**
 * Tests submission of all tabs for a deal
 * @param {number} dealId - The ID of an existing deal to test with
 * @returns {Promise<object>} - Results of all tab submissions
 */
export async function testAllTabSubmissions(dealId) {
  if (!dealId) {
    throw new Error('dealId is required for testing');
  }

  const tabNames = [
    'property',
    'acquisition',
    'financing',
    'disposition',
    'capital',
    'inflation',
    'penetration',
    'operating-revenue',
    'departmental-expenses',
    'management-franchise',
    'undistributed-expenses-1',
    'undistributed-expenses-2',
    'non-operating-expenses',
    'ffe-reserve'
  ];

  const results = {
    dealId,
    startTime: new Date().toISOString(),
    tabResults: [],
    summary: {
      total: tabNames.length,
      successful: 0,
      failed: 0
    }
  };

  for (const tabName of tabNames) {
    const tabResult = await testTabSubmission(tabName, dealId);
    results.tabResults.push(tabResult);
    
    if (tabResult.success) {
      results.summary.successful++;
    } else {
      results.summary.failed++;
    }
    
    // Small delay between submissions to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  results.endTime = new Date().toISOString();
  results.totalDuration = results.tabResults.reduce((sum, tab) => sum + (tab.duration || 0), 0);
  
  console.log('Test summary:', results.summary);
  return results;
}
