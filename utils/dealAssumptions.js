// Utility function to save individual deal assumption tabs

/**
 * Save individual deal assumption tab data to the database
 * @param {string} tabName - The name of the assumption tab (acquisition, financing, etc.)
 * @param {number} dealId - The ID of the deal to update
 * @param {object} formData - The form data for this specific tab
 * @returns {Promise} - A promise that resolves to the API response
 */
export const saveDealAssumptionTab = async (tabName, dealId, formData) => {
  try {
  // Maps tab names to API endpoint parameters
    const tabTypeMap = {
      'property': 'property',  // Added property tab
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
    
    if (!tabTypeMap[tabName]) {
      throw new Error(`Unknown tab name: ${tabName}`);
    }
    
    // Construct the request payload
    const payload = {
      deal_id: dealId,
      ...extractTabData(tabName, formData)
    };    // Use our dynamic API endpoint with the tab type as a parameter
    const endpoint = `/api/deals/assumptions/${tabTypeMap[tabName]}`;
    console.log(`Saving tab ${tabName} to endpoint: ${endpoint}`, payload);
    
    // Make the API request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    // Log the full response status and text for debugging
    console.log(`Response status for ${tabName}: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      let errorMessage;
      
      try {
        errorData = JSON.parse(errorText);
        console.error(`Error response for ${tabName}:`, errorData);
        
        // Extract detailed error message if available
        errorMessage = errorData.message || errorData.error || errorData.details || 
                       `Failed to save ${tabName} tab (Status: ${response.status})`;
      } catch (e) {
        console.error(`Error response (not JSON) for ${tabName}:`, errorText);
        errorMessage = errorText || `Failed to save ${tabName} tab (Status: ${response.status})`;
        errorData = { error: errorMessage };
      }
      
      // Create a custom error with additional details
      const error = new Error(errorMessage);
      error.status = response.status;
      error.response = errorData;
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error saving ${tabName} tab:`, error);
    throw error;
  }
};

/**
 * Extract only the relevant data for a specific tab from the full form data
 * @param {string} tabName - The name of the assumption tab
 * @param {object} formData - The complete form data
 * @returns {object} - An object containing only the relevant fields for the tab
 */
const extractTabData = (tabName, formData) => {
  // Define which form fields belong to which tabs
  const tabFields = {
    'property': ['deal_name', 'property_name', 'property_address', 'city', 'state', 'property_type', 'number_of_rooms', 'status'],
    'acquisition': ['acquisition_month', 'acquisition_year', 'acquisition_costs', 'cap_rate_going_in', 
                   'hold_period', 'purchase_price', 'purchase_price_method'],
    'financing': ['loan_to_value', 'loan_amount', 'interest_rate', 'loan_term', 
                 'amortization_period', 'debt_coverage_ratio', 'lender_fee'],
    'disposition': ['exit_cap_rate', 'selling_costs', 'disposition_month', 'disposition_year'],
    // Updated mappings for other tabs based on our default values
    'capital': ['capex_budget', 'capex_contingency', 'capital_expense_year1', 'capital_expense_year2', 
               'capital_expense_year3', 'capital_expense_year4', 'capital_expense_year5'],
    'inflation': ['inflation_rate_general', 'inflation_rate_revenue', 'inflation_rate_expenses'],
    'penetration': ['market_penetration', 'stabilized_occupancy', 'ramp_up_year1', 
                   'ramp_up_year2', 'ramp_up_year3'],
    'operating-revenue': ['adr_base', 'revpar_base', 'other_revenue_percentage', 'adr_growth'],
    'departmental-expenses': ['rooms_department_expense', 'food_beverage_expense', 'other_dept_expense_pct'],
    'management-franchise': ['management_fee_percentage', 'franchise_fee_percentage', 'management_fee_incentive'],
    'undistributed-expenses-1': ['admin_general_percentage', 'sales_marketing_percentage', 'property_operations_percentage'],
    'undistributed-expenses-2': ['utility_costs_percentage', 'it_systems_percentage'],
    'non-operating-expenses': ['property_tax_percentage', 'insurance_percentage', 'income_tax_rate'],
    'ffe-reserve': ['ffe_reserve_percentage', 'ffe_reserve_minimum']
  };
  
  // Get the list of fields for this tab
  const fields = tabFields[tabName] || [];
  
  // Extract only the relevant fields from formData
  return fields.reduce((result, field) => {
    if (formData.hasOwnProperty(field)) {
      result[field] = formData[field];
    }
    return result;
  }, {});
};

/**
 * Calculate and update the metrics based on the current form data
 * @param {object} formData - The complete form data
 * @returns {object} - Updated metrics object
 */
export const calculateMetrics = (formData) => {
  let metrics = {
    irr: 12.5,
    capRate: 8.5,
    cashOnCash: 9.2,
    adr: 195.0
  };
  
  // Calculate IRR based on hold period, purchase price, and exit cap rate
  if (formData.hold_period) {
    const holdPeriod = parseInt(formData.hold_period);
    metrics.irr = 12.5 + ((holdPeriod - 5) * -0.3); // IRR decreases with longer holds
  }
  
  // Calculate cap rate based on cap_rate_going_in
  if (formData.cap_rate_going_in) {
    const capRate = parseFloat(formData.cap_rate_going_in);
    metrics.capRate = capRate;
    metrics.cashOnCash = capRate * 1.08; // Cash on cash typically higher than cap rate
    
    // Additional IRR calculation based on cap rate
    if (formData.exit_cap_rate) {
      const exitCap = parseFloat(formData.exit_cap_rate);
      const spreadEffect = (capRate - exitCap) * 2;
      metrics.irr = metrics.irr + spreadEffect;
    }
  }
  
  // Calculate ADR based on purchase price and number of rooms
  if (formData.purchase_price && formData.number_of_rooms) {
    const price = parseFloat(formData.purchase_price);
    const rooms = parseInt(formData.number_of_rooms);
    if (price > 0 && rooms > 0) {
      metrics.adr = 150 + (price / rooms / 1000);
    }
  }
  
  // If ADR base is specified directly, use that value
  if (formData.adr_base) {
    metrics.adr = parseFloat(formData.adr_base);
  }
  
  // Round to 1 decimal place
  metrics.irr = Math.round(metrics.irr * 10) / 10;
  metrics.capRate = Math.round(metrics.capRate * 10) / 10;
  metrics.cashOnCash = Math.round(metrics.cashOnCash * 10) / 10;
  metrics.adr = Math.round(metrics.adr);
  
  return metrics;
};
