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
    // Validate inputs before proceeding
    if (!tabName) {
      throw new Error('Tab name is required for saving assumption data');
    }
    
    if (!dealId) {
      throw new Error('Deal ID is required for saving assumption data');
    }
    
    if (!formData || Object.keys(formData).length === 0) {
      throw new Error('Form data is empty or invalid');
    }
    
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
      throw new Error(`Unknown tab name: ${tabName}. Valid tabs are: ${Object.keys(tabTypeMap).join(', ')}`);
    }
    
    // Always ensure deal_id is in the payload
    const extractedData = extractTabData(tabName, formData);
    
    // Perform additional validation on critical fields
    if (tabName === 'acquisition' && !extractedData.acquisition_year) {
      extractedData.acquisition_year = new Date().getFullYear();
      console.log('Added default acquisition_year:', extractedData.acquisition_year);
    }
    
    if (tabName === 'disposition' && !extractedData.disposition_year) {
      // Default disposition to 5 years from now if not specified
      extractedData.disposition_year = new Date().getFullYear() + 5;
      console.log('Added default disposition_year:', extractedData.disposition_year);
    }
    
    // Construct the request payload
    const payload = {
      deal_id: dealId,
      ...extractedData
    };
    
    // Log data being sent for debugging
    console.log(`Data being sent for ${tabName} tab:`, payload);
    
    // Use our dynamic API endpoint with the tab type as a parameter
    const endpoint = `/api/deals/assumptions/${tabTypeMap[tabName]}`;
    console.log(`Saving tab ${tabName} to endpoint: ${endpoint}`);
    
    // Make the API request with enhanced error handling
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'same-origin' // Include cookies for auth if they exist
      });
      
      // Log the full response status for debugging
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
        error.context = {
          tabName,
          dealId,
          sentData: payload,
          endpoint
        };
        throw error;
      }
      
      // Return the API response data
      const responseData = await response.json();
      console.log(`Successfully saved ${tabName} data:`, responseData);
      return responseData;
    } catch (fetchError) {
      // Try the dynamic [tabType] endpoint as a fallback
      console.log(`Error with direct endpoint, trying dynamic endpoint for ${tabName}`);
      const fallbackEndpoint = `/api/deals/assumptions/[tabType]?tabType=${tabTypeMap[tabName]}`;
      
      try {
        const fallbackResponse = await fetch(fallbackEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (fallbackResponse.ok) {
          const responseData = await fallbackResponse.json();
          console.log(`Successfully saved ${tabName} data using fallback:`, responseData);
          return responseData;
        } else {
          // Both attempts failed - throw the original error with enhanced context
          fetchError.fallbackFailed = true;
          fetchError.fallbackStatus = fallbackResponse.status;
          throw fetchError;
        }
      } catch (fallbackError) {
        // Both attempts failed completely
        console.error(`Fallback attempt also failed for ${tabName}:`, fallbackError);
        throw fetchError; // throw the original error
      }
    }
  } catch (error) {
    console.error(`Error saving ${tabName} tab:`, error);
    // Add more context to the error
    if (!error.context) {
      error.context = {
        tabName,
        dealId,
        timestamp: new Date().toISOString()
      };
    }
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
    'property': ['deal_name', 'property_name', 'property_address', 'city', 'state', 'property_type', 'number_of_rooms', 'status', 'property_key'],
    'acquisition': ['acquisition_month', 'acquisition_year', 'acquisition_costs', 'cap_rate_going_in', 
                   'hold_period', 'purchase_price', 'purchase_price_method', 'purchase_price_per_key'],
    'financing': ['loan_to_value', 'loan_amount', 'interest_rate', 'loan_term', 
                 'amortization_period', 'debt_coverage_ratio', 'lender_fee', 'debt_amount', 'equity_amount'],
    'disposition': ['cap_rate_exit', 'sales_expense', 'disposition_month', 'disposition_year'],
    // Updated mappings based on actual database fields
    'capital': ['capex_type', 'owner_funded_capex', 'capital_expense_year1', 'capital_expense_year2', 
               'capital_expense_year3', 'capital_expense_year4', 'capital_expense_year5'],
    'inflation': ['inflation_rate_general', 'inflation_rate_revenue', 'inflation_rate_expenses', 'inflation_assumptions'],
    'penetration': ['comp_name', 'comp_nbr_of_rooms', 'market_adr_change', 'market_occupancy_pct', 
                   'market_penetration', 'occupied_room_growth_pct', 'property_adr_change', 'sample_hotel_occupancy'],
    'operating-revenue': ['adr_base', 'adr_growth', 'other_revenue_percentage', 'revpar_base', 'revenues_total'],
    'departmental-expenses': ['rooms_expense_par', 'rooms_expense_por', 'food_beverage_expense_par', 'food_beverage_expense_por', 'other_dept_expense_par', 'other_dept_expense_por', 'expenses_total'],
    'management-franchise': ['management_fee_base', 'management_fee_incentive', 'management_fee_percentage', 'franchise_fee_base', 'franchise_fee_percentage', 'brand_marketing_fee'],
    'undistributed-expenses-1': ['admin_general_par', 'admin_general_por', 'sales_marketing_par', 'sales_marketing_por', 'property_ops_maintenance_par', 'property_ops_maintenance_por'],
    'undistributed-expenses-2': ['utilities_costs_par', 'utilities_costs_por', 'it_systems_par', 'it_systems_por'],
    'non-operating-expenses': ['property_taxes_par', 'property_taxes_por', 'insurance_par', 'insurance_por', 'income_tax_rate'],
    'ffe-reserve': ['ffe_reserve_percentage', 'ffe_reserve_minimum', 'ffe_reserve_par']
  };
  
  // Get the list of fields for this tab
  const fields = tabFields[tabName] || [];
  
  if (fields.length === 0) {
    console.warn(`No field mapping found for tab '${tabName}'. Using all form data.`);
    return { ...formData };
  }
  
  // For property tab, always include property_key if it exists
  if (tabName === 'property' && formData.property_key && !fields.includes('property_key')) {
    fields.push('property_key');
  }
  
  // Always include deal_id if it exists in the form data
  if (formData.deal_id && !fields.includes('deal_id')) {
    fields.push('deal_id');
  }
    // Extract only the relevant fields from formData
  const result = fields.reduce((result, field) => {
    if (formData.hasOwnProperty(field)) {
      // Process specific fields that might need conversion
      if (field.match(/^(acquisition|disposition)_(month|year)$/) && formData[field] !== null && formData[field] !== undefined) {
        // Ensure months and years are integers
        const parsedValue = parseInt(formData[field]);
        if (!isNaN(parsedValue)) {
          result[field] = parsedValue;
        } else {
          // Default to current year if parsing fails
          result[field] = field.includes('year') ? new Date().getFullYear() : 1;
          console.warn(`Invalid ${field} value "${formData[field]}", using default: ${result[field]}`);
        }
      } else if (field.match(/rate|percentage|ratio/) && formData[field] !== null && formData[field] !== undefined) {
        // Ensure rates and percentages are floats
        const parsedValue = parseFloat(formData[field]);
        result[field] = !isNaN(parsedValue) ? parsedValue : 0;
        if (isNaN(parsedValue)) {
          console.warn(`Invalid ${field} value "${formData[field]}", using default: ${result[field]}`);
        }      } else if (field.match(/amount|price|expense|cost/) && formData[field] !== null && formData[field] !== undefined) { 
        // Ensure monetary values are numbers
        const stringValue = String(formData[field]).replace(/,/g, ''); // Remove commas if present
        const parsedValue = parseFloat(stringValue);
        result[field] = !isNaN(parsedValue) ? parsedValue : 0;
        if (isNaN(parsedValue)) {
          console.warn(`Invalid ${field} value "${formData[field]}" - using default: ${result[field]}`);
        }
      } else {
        result[field] = formData[field];
      }
    }
    return result;
  }, {});
  
  console.log(`Extracted data for ${tabName} tab:`, result);
  return result;
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
