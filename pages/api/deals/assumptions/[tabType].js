// API route for saving deal assumptions by tab type
import { pool } from '../../../../lib/db';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tabType } = req.query;
  const { deal_id, ...tabData } = req.body;

  if (!deal_id) {
    return res.status(400).json({ error: 'Deal ID is required' });
  }

  // Logging for debugging
  console.log(`Saving ${tabType} data for deal ${deal_id}:`, tabData);

  const client = await pool.connect();  try {
    // Validate deal_id format
    const dealIdNum = parseInt(deal_id, 10);
    if (isNaN(dealIdNum) || dealIdNum <= 0) {
      return res.status(400).json({ error: 'Invalid deal ID provided' });
    }
    
    // Start a transaction
    await client.query('BEGIN');    // First, check if the deal exists
    let dealCheck = await client.query(
      'SELECT deal_id FROM deals WHERE deal_id = $1',
      [deal_id]
    );

    if (dealCheck.rows.length === 0) {
      // Create the deal if it doesn't exist - for testing purposes only
      console.log(`Deal with ID ${deal_id} not found, creating a test deal`);
      
      try {
        // Create a minimal test deal - adjust columns based on your schema
        await client.query(`
          INSERT INTO deals (deal_id, name) VALUES ($1, $2)
        `, [deal_id, `Test Deal ${deal_id}`]);
        
        console.log(`Created test deal with ID ${deal_id}`);
        
        // Verify the deal was created
        dealCheck = await client.query(
          'SELECT deal_id FROM deals WHERE deal_id = $1',
          [deal_id]
        );
        
        if (dealCheck.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(500).json({ error: `Failed to create deal with ID ${deal_id}` });
        }
      } catch (createError) {
        console.error(`Error creating test deal:`, createError);
        await client.query('ROLLBACK');
        return res.status(500).json({ 
          error: `Failed to create deal: ${createError.message}`,
          details: createError.toString()
        });
      }
    }// Get or create a fact record for this deal
    let factRecord = await client.query(
      'SELECT * FROM fact_deal_assumptions WHERE deal_id = $1',
      [deal_id]
    );

    let factId;
    if (factRecord.rows.length === 0) {
      // Check required fields for the fact_deal_assumptions table
      const tableInfo = await client.query(`
        SELECT column_name, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'fact_deal_assumptions'
      `);
      
      console.log('fact_deal_assumptions table columns:', tableInfo.rows);
      
      // Build the insert query dynamically based on required fields
      let insertColumns = ['deal_id'];
      let insertValues = [deal_id];
      let placeholders = ['$1'];
      let paramIndex = 2;
      
      // Check if user_id and created_by columns are required (not nullable and no default)
      const userIdRequired = tableInfo.rows.find(col => 
        col.column_name === 'user_id' && 
        col.is_nullable === 'NO' && 
        col.column_default === null
      );
      
      const createdByRequired = tableInfo.rows.find(col => 
        col.column_name === 'created_by' && 
        col.is_nullable === 'NO' && 
        col.column_default === null
      );
      
      // Add default values for required fields
      if (userIdRequired) {
        insertColumns.push('user_id');
        insertValues.push(1); // Default user ID, adjust as needed
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (createdByRequired) {
        insertColumns.push('created_by');
        insertValues.push(1); // Default creator ID, adjust as needed
        placeholders.push(`$${paramIndex++}`);
      }
      
      // Create a new fact record
      const insertQuery = `
        INSERT INTO fact_deal_assumptions (${insertColumns.join(', ')}) 
        VALUES (${placeholders.join(', ')}) 
        RETURNING assumption_id
      `;
      
      console.log('Executing insert query:', insertQuery, insertValues);
      const newFactResult = await client.query(insertQuery, insertValues);
      factId = newFactResult.rows[0].assumption_id;
    } else {
      factId = factRecord.rows[0].assumption_id;
    }

    // Process based on tab type
    let updatedFieldValue = null;

    switch (tabType) {
      case 'property':
        updatedFieldValue = await handleProperty(client, deal_id, factId, tabData);
        break;
      case 'acquisition':
        updatedFieldValue = await handleAcquisition(client, deal_id, factId, tabData);
        break;
      case 'financing':
        updatedFieldValue = await handleFinancing(client, deal_id, factId, tabData);
        break;
      case 'disposition':
        updatedFieldValue = await handleDisposition(client, deal_id, factId, tabData);
        break;
      case 'capital-expense':
        updatedFieldValue = await handleCapitalExpense(client, deal_id, factId, tabData);
        break;
      case 'inflation':
        updatedFieldValue = await handleInflation(client, deal_id, factId, tabData);
        break;
      case 'penetration':
        updatedFieldValue = await handlePenetration(client, deal_id, factId, tabData);
        break;
      case 'revenue':
        updatedFieldValue = await handleRevenue(client, deal_id, factId, tabData);
        break;
      case 'dept-expense':
        updatedFieldValue = await handleDeptExpense(client, deal_id, factId, tabData);
        break;
      case 'mgmt-fee':
        updatedFieldValue = await handleManagementFee(client, deal_id, factId, tabData);
        break;
      case 'undist1':
        updatedFieldValue = await handleUndist1(client, deal_id, factId, tabData);
        break;
      case 'undist2':
        updatedFieldValue = await handleUndist2(client, deal_id, factId, tabData);
        break;
      case 'nonop-expense':
        updatedFieldValue = await handleNonOpExpense(client, deal_id, factId, tabData);
        break;
      case 'ffe':
        updatedFieldValue = await handleFFE(client, deal_id, factId, tabData);
        break;
      default:
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Unknown tab type: ${tabType}` });
    }

    // Commit the transaction
    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: `${tabType} data saved successfully`,
      updatedField: updatedFieldValue
    });  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error saving ${tabType} data:`, error);
      
    // Provide more detailed error information
    let status = 500;
    let errorMessage = error.message;
    
    // Enhanced error logging with data context
    console.error(`Error context for ${tabType} data submission:`, {
      tabType,
      dealId: deal_id,
      submittedData: tabData,
      errorStack: error.stack
    });
    
    // Try to determine what fields might be missing from the submission
    let missingFields = [];
    if (tabData) {
      try {
        // Check for expected fields based on tabType
        switch (tabType) {
          case 'property':
            if (!tabData.property_name) missingFields.push('property_name');
            if (!tabData.property_type) missingFields.push('property_type');
            break;
          case 'acquisition':
            if (!tabData.purchase_price && tabData.purchase_price !== 0) missingFields.push('purchase_price');
            if (!tabData.acquisition_year) missingFields.push('acquisition_year');
            break;
          case 'financing':
            if (!tabData.loan_to_value && tabData.loan_to_value !== 0) missingFields.push('loan_to_value');
            if (!tabData.interest_rate && tabData.interest_rate !== 0) missingFields.push('interest_rate');
            break;
          // Add more cases for other tabs as needed
        }
      } catch (e) {
        console.error('Error checking missing fields:', e);
      }
    }
    
    // Check for specific error types to provide better error messages
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      status = 404;
      errorMessage = `Resource not found: ${error.message}`;
    } else if (error.message.includes('violates') || error.message.includes('constraint')) {
      status = 400;
      errorMessage = `Database constraint violation: ${error.message}`;
    } else if (error.message.includes('permission') || error.message.includes('denied')) {
      status = 403;
      errorMessage = `Permission denied: ${error.message}`;
    } else if (error.message.includes('undefined') || error.message.includes('null')) {
      status = 400;
      errorMessage = `Data validation error: ${error.message}`;
    } else if (error.message.includes('numeric field overflow')) {
      status = 400;
      errorMessage = `Numeric value too large: ${error.message}`;
    } else if (error.message.includes('invalid input syntax')) {
      status = 400;
      errorMessage = `Invalid data format: ${error.message}`;
    } else if (error.message.includes('duplicate key')) {
      status = 409;
      errorMessage = `Duplicate record: ${error.message}`;
    }
    
    // Add missing fields to the error context if any were found
    const errorContext = {
      tabType,
      dealId: deal_id,
      timestamp: new Date().toISOString(),
    };
    
    if (missingFields.length > 0) {
      errorContext.missingFields = missingFields;
      if (!errorMessage.includes('missing')) {
        errorMessage = `Missing required fields (${missingFields.join(', ')}): ${errorMessage}`;
      }
    }
    
    return res.status(status).json({
      error: `Failed to save ${tabType} data`,
      message: errorMessage,
      details: error.toString(),
      context: errorContext,
      fixSuggestion: missingFields.length > 0 
        ? `Please provide values for: ${missingFields.join(', ')}` 
        : 'Check data formatting and try again'
    });
  } finally {
    client.release();
  }
}

// Helper functions for each tab type
async function handleProperty(client, dealId, factId, data) {
  try {
    // For property tab, we directly update the deals table
    console.log('Updating deal properties:', data);
    console.log('Deal ID for property update:', dealId);
    
    // Make sure the deal exists first
    const dealCheck = await client.query('SELECT * FROM deals WHERE deal_id = $1', [dealId]);
    console.log('Deal check result:', dealCheck.rowCount > 0 ? 'Deal found' : 'Deal not found');
    
    // If deal doesn't exist, throw an error
    if (dealCheck.rowCount === 0) {
      throw new Error(`Deal with ID ${dealId} not found`);
    }
      // Check if the deals table has all the columns we're trying to update
    const tableInfo = await client.query(`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'deals'
    `);
    
    const tableColumns = tableInfo.rows.map(row => row.column_name);
    console.log('Available columns in deals table:', tableColumns);
    
    // Create a dynamic query based on the available columns
    let updateFields = [];
    let values = [];
    let paramIndex = 1;
    
    // Only include fields that exist in the table
    const fields = [
      { name: 'deal_name', value: data.deal_name || null },
      { name: 'property_name', value: data.property_name || null },
      { name: 'property_address', value: data.property_address || null },
      { name: 'city', value: data.city || null },
      { name: 'state', value: data.state || null },
      { name: 'property_type', value: data.property_type || null },
      { name: 'number_of_rooms', value: data.number_of_rooms || null },
      { name: 'status', value: data.status || 'Active' }
    ];
    
    // Add fields that exist in the table
    for (const field of fields) {
      if (tableColumns.includes(field.name)) {
        updateFields.push(`${field.name} = $${paramIndex}`);
        values.push(field.value);
        paramIndex++;
      }
    }
    
    // Add updated_at if it exists
    if (tableColumns.includes('updated_at')) {
      updateFields.push('updated_at = NOW()');
    }
    
    // Construct the query
    const query = `
      UPDATE deals 
      SET ${updateFields.join(', ')}
      WHERE deal_id = $${paramIndex}
      RETURNING deal_id
    `;
    
    // Add the deal_id as the last parameter
    values.push(dealId);
    
    console.log('Executing query:', query);
    console.log('With values:', values);
    
    const result = await client.query(query, values);
    
    console.log('Update result:', result.rowCount > 0 ? 'Update successful' : 'No rows updated');
    return dealId;
  } catch (error) {
    console.error('Error in handleProperty:', error);
    throw error;
  }
}

async function handleAcquisition(client, dealId, factId, data) {
  try {
    console.log('Handling acquisition data:', data);
    
    // Ensure numeric fields are properly parsed
    const parsedData = {
      acquisition_month: data.acquisition_month || null,
      acquisition_year: data.acquisition_year ? parseInt(data.acquisition_year, 10) : new Date().getFullYear(),
      acquisition_costs: data.acquisition_costs ? parseFloat(data.acquisition_costs) : null,
      cap_rate_going_in: data.cap_rate_going_in ? parseFloat(data.cap_rate_going_in) : null,
      hold_period: data.hold_period ? parseInt(data.hold_period, 10) : 5,
      purchase_price: data.purchase_price ? parseFloat(data.purchase_price) : null,
      purchase_price_method: data.purchase_price_method || null
    };
    
    console.log('Parsed acquisition data:', parsedData, 'for dealId:', dealId);
    
    // Check if record exists first in dim_acquisition
    const existingRecord = await client.query(
      `SELECT acquisition_id FROM dim_acquisition WHERE deal_id = $1`,
      [dealId]
    );

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const acquisitionId = existingRecord.rows[0].acquisition_id;
      
      await client.query(
        `UPDATE dim_acquisition 
         SET acquisition_month = $1, acquisition_year = $2, acquisition_costs = $3,
             cap_rate_going_in = $4, hold_period = $5, purchase_price = $6, 
             purchase_price_method = $7, updated_at = NOW()
         WHERE acquisition_id = $8`,
        [
          parsedData.acquisition_month,
          parsedData.acquisition_year,
          parsedData.acquisition_costs,
          parsedData.cap_rate_going_in,
          parsedData.hold_period,
          parsedData.purchase_price,
          parsedData.purchase_price_method,
          acquisitionId
        ]
      );
      
      console.log(`Updated acquisition record with ID ${acquisitionId}`);
      return acquisitionId;
    } else {
      // Insert new record
      const result = await client.query(
        `INSERT INTO dim_acquisition 
         (deal_id, acquisition_month, acquisition_year, acquisition_costs, 
          cap_rate_going_in, hold_period, purchase_price, purchase_price_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING acquisition_id`,
        [
          dealId,
          parsedData.acquisition_month,
          parsedData.acquisition_year,
          parsedData.acquisition_costs,
          parsedData.cap_rate_going_in,
          parsedData.hold_period,
          parsedData.purchase_price,
          parsedData.purchase_price_method
        ]
      );
      
      const acquisitionId = result.rows[0].acquisition_id;
        // Update the fact table to link to this acquisition record
      await client.query(
        `UPDATE fact_deal_assumptions SET acquisition_id = $1 WHERE assumption_id = $2`,
        [acquisitionId, factId]
      );
      
      return acquisitionId;
    }
  } catch (error) {
    console.error('Error in handleAcquisition:', error);
    throw error;
  }
}

// Implement similar handler functions for other tabs
// For brevity, I'm including simplified versions below.
// In a production app, you would implement full versions for each tab type.

async function handleFinancing(client, dealId, factId, data) {
  try {
    console.log('Handling financing data:', data);
    
    // Ensure numeric fields are properly parsed
    const parsedData = {
      loan_to_value: data.loan_to_value ? parseFloat(data.loan_to_value) : null,
      interest_rate: data.interest_rate ? parseFloat(data.interest_rate) : null,
      loan_term: data.loan_term ? parseInt(data.loan_term, 10) : null,
      amortization_period: data.amortization_period ? parseInt(data.amortization_period, 10) : null,
      debt_coverage_ratio: data.debt_coverage_ratio ? parseFloat(data.debt_coverage_ratio) : null,
      lender_fee: data.lender_fee ? parseFloat(data.lender_fee) : null,
      loan_amount: data.loan_amount ? parseFloat(data.loan_amount) : null,
      equity_amount: data.equity_amount ? parseFloat(data.equity_amount) : null
    };
    
    console.log('Parsed financing data:', parsedData);
    
    // Check if record exists
    const existingRecord = await client.query(
      `SELECT financing_id FROM dim_financing WHERE deal_id = $1`,
      [dealId]
    );

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const financingId = existingRecord.rows[0].financing_id;
      
      await client.query(
        `UPDATE dim_financing 
         SET loan_to_value = $1, interest_rate = $2, loan_term = $3,
             amortization_period = $4, debt_coverage_ratio = $5, lender_fee = $6, 
             loan_amount = $7, equity_amount = $8, updated_at = NOW()
         WHERE financing_id = $9`,
        [
          parsedData.loan_to_value,
          parsedData.interest_rate,
          parsedData.loan_term,
          parsedData.amortization_period,
          parsedData.debt_coverage_ratio,
          parsedData.lender_fee,
          parsedData.loan_amount,
          parsedData.equity_amount,
          financingId
        ]
      );
      
      console.log(`Updated financing record with ID ${financingId}`);
      return financingId;
    } else {
      // Insert new record
      const result = await client.query(
        `INSERT INTO dim_financing 
         (deal_id, loan_to_value, interest_rate, loan_term, amortization_period, 
          debt_coverage_ratio, lender_fee, loan_amount, equity_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING financing_id`,
        [
          dealId,
          parsedData.loan_to_value,
          parsedData.interest_rate,
          parsedData.loan_term,
          parsedData.amortization_period,
          parsedData.debt_coverage_ratio,
          parsedData.lender_fee,
          parsedData.loan_amount,
          parsedData.equity_amount
        ]
      );
      
      const financingId = result.rows[0].financing_id;
      
      // Update the fact table to link to this financing record
      await client.query(
        `UPDATE fact_deal_assumptions SET financing_id = $1 WHERE assumption_id = $2`,
        [financingId, factId]
      );
      
      return financingId;
    }
  } catch (error) {
    console.error('Error in handleFinancing:', error);
    throw error;
  }
}

async function handleDisposition(client, dealId, factId, data) {
  try {
    console.log('Handling disposition data:', data);
    
    // Ensure numeric fields are properly parsed
    const parsedData = {
      cap_rate_exit: data.cap_rate_exit ? parseFloat(data.cap_rate_exit) : null,
      sales_expense: data.sales_expense ? parseFloat(data.sales_expense) : null,
      disposition_month: data.disposition_month || null,
      disposition_year: data.disposition_year ? parseInt(data.disposition_year, 10) : null
    };
    
    // Set default disposition year if not provided (acquisition year + hold period)
    if (!parsedData.disposition_year) {
      // Try to get acquisition data to set a reasonable default
      const acquisitionData = await client.query(
        `SELECT a.acquisition_year, a.hold_period 
        FROM dim_acquisition a
        INNER JOIN fact_deal_assumptions f ON f.acquisition_id = a.acquisition_id
        WHERE f.deal_id = $1`,
        [dealId]
      );
      
      if (acquisitionData.rows.length > 0) {
        const { acquisition_year, hold_period } = acquisitionData.rows[0];
        if (acquisition_year && hold_period) {
          parsedData.disposition_year = parseInt(acquisition_year) + parseInt(hold_period);
          console.log(`Set default disposition year to ${parsedData.disposition_year}`);
        } else {
          parsedData.disposition_year = new Date().getFullYear() + 5;
          console.log(`Set fallback disposition year to ${parsedData.disposition_year}`);
        }
      } else {
        parsedData.disposition_year = new Date().getFullYear() + 5;
        console.log(`Set fallback disposition year to ${parsedData.disposition_year}`);
      }
    }
    
    console.log('Parsed disposition data:', parsedData);
    
    // Check if record exists
    const existingRecord = await client.query(
      `SELECT disposition_id FROM dim_disposition WHERE deal_id = $1`,
      [dealId]
    );

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const dispositionId = existingRecord.rows[0].disposition_id;
      
      await client.query(
        `UPDATE dim_disposition 
         SET cap_rate_exit = $1, sales_expense = $2, disposition_month = $3,
             disposition_year = $4, updated_at = NOW()
         WHERE disposition_id = $5`,
        [
          parsedData.cap_rate_exit,
          parsedData.sales_expense,
          parsedData.disposition_month,
          parsedData.disposition_year,
          dispositionId
        ]
      );
      
      console.log(`Updated disposition record with ID ${dispositionId}`);
      return dispositionId;
    } else {
      // Insert new record
      const result = await client.query(
        `INSERT INTO dim_disposition 
         (deal_id, cap_rate_exit, sales_expense, disposition_month, disposition_year)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING disposition_id`,
        [
          dealId,
          data.cap_rate_exit || null,
          data.sales_expense || null,
          data.disposition_month || null,
          data.disposition_year || null
        ]
      );
      
      const dispositionId = result.rows[0].disposition_id;
      
      // Update the fact table to link to this disposition record
      await client.query(
        `UPDATE fact_deal_assumptions SET disposition_id = $1 WHERE assumption_id = $2`,
        [dispositionId, factId]
      );
      
      return dispositionId;
    }
  } catch (error) {
    console.error('Error in handleDisposition:', error);
    throw error;
  }
}

async function handleCapitalExpense(client, dealId, factId, data) {
  try {
    console.log('Handling capital expense data:', data);
    
    // Check if record exists
    const existingRecord = await client.query(
      `SELECT capex_id FROM dim_capital_expense WHERE deal_id = $1`,
      [dealId]
    );

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const capexId = existingRecord.rows[0].capex_id;
      
      await client.query(
        `UPDATE dim_capital_expense 
         SET capex_type = $1, owner_funded_capex = $2, capital_expense_year1 = $3,
             capital_expense_year2 = $4, capital_expense_year3 = $5, capital_expense_year4 = $6,
             capital_expense_year5 = $7, updated_at = NOW()
         WHERE capex_id = $8`,
        [
          data.capex_type || null,
          data.owner_funded_capex || null,
          data.capital_expense_year1 || null,
          data.capital_expense_year2 || null,
          data.capital_expense_year3 || null,
          data.capital_expense_year4 || null,
          data.capital_expense_year5 || null,
          capexId
        ]
      );
      
      return capexId;
    } else {
      // Insert new record
      const result = await client.query(
        `INSERT INTO dim_capital_expense 
         (deal_id, capex_type, owner_funded_capex, capital_expense_year1, capital_expense_year2, 
          capital_expense_year3, capital_expense_year4, capital_expense_year5)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING capex_id`,
        [
          dealId,
          data.capex_type || null,
          data.owner_funded_capex || null,
          data.capital_expense_year1 || null,
          data.capital_expense_year2 || null,
          data.capital_expense_year3 || null,
          data.capital_expense_year4 || null,
          data.capital_expense_year5 || null
        ]
      );
      
      const capexId = result.rows[0].capex_id;
      
      // Update the fact table to link to this capital expense record
      await client.query(
        `UPDATE fact_deal_assumptions SET capex_id = $1 WHERE assumption_id = $2`,
        [capexId, factId]
      );
      
      return capexId;
    }
  } catch (error) {
    console.error('Error in handleCapitalExpense:', error);
    throw error;
  }
}

async function handleInflation(client, dealId, factId, data) {
  try {
    console.log('Handling inflation data:', data);
    
    // Check if record exists
    const existingRecord = await client.query(
      `SELECT inflation_id FROM dim_inflation WHERE deal_id = $1`,
      [dealId]
    );

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const inflationId = existingRecord.rows[0].inflation_id;
      
      await client.query(
        `UPDATE dim_inflation 
         SET inflation_rate_general = $1, inflation_rate_revenue = $2, 
             inflation_rate_expenses = $3, inflation_assumptions = $4, updated_at = NOW()
         WHERE inflation_id = $5`,
        [
          data.inflation_rate_general || null,
          data.inflation_rate_revenue || null,
          data.inflation_rate_expenses || null,
          data.inflation_assumptions || null,
          inflationId
        ]
      );
      
      return inflationId;
    } else {
      // Insert new record
      const result = await client.query(
        `INSERT INTO dim_inflation 
         (deal_id, inflation_rate_general, inflation_rate_revenue, inflation_rate_expenses, inflation_assumptions)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING inflation_id`,
        [
          dealId,
          data.inflation_rate_general || null,
          data.inflation_rate_revenue || null,
          data.inflation_rate_expenses || null,
          data.inflation_assumptions || null
        ]
      );
      
      const inflationId = result.rows[0].inflation_id;
      
      // Update the fact table to link to this inflation record
      await client.query(
        `UPDATE fact_deal_assumptions SET inflation_id = $1 WHERE assumption_id = $2`,
        [inflationId, factId]
      );
      
      return inflationId;
    }
  } catch (error) {
    console.error('Error in handleInflation:', error);
    throw error;
  }
}

async function handlePenetration(client, dealId, factId, data) {
  try {
    console.log('Handling penetration data:', data);
    
    // Check if record exists
    const existingRecord = await client.query(
      `SELECT penetration_id FROM dim_penetration WHERE deal_id = $1`,
      [dealId]
    );

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const penetrationId = existingRecord.rows[0].penetration_id;
      
      await client.query(
        `UPDATE dim_penetration 
         SET comp_name = $1, comp_nbr_of_rooms = $2, market_adr_change = $3,
             market_occupancy_pct = $4, market_penetration = $5, occupied_room_growth_pct = $6,
             property_adr_change = $7, sample_hotel_occupancy = $8, updated_at = NOW()
         WHERE penetration_id = $9`,
        [
          data.comp_name || null,
          data.comp_nbr_of_rooms || null,
          data.market_adr_change || null,
          data.market_occupancy_pct || null,
          data.market_penetration || null,
          data.occupied_room_growth_pct || null,
          data.property_adr_change || null,
          data.sample_hotel_occupancy || null,
          penetrationId
        ]
      );
      
      return penetrationId;
    } else {
      // Insert new record
      const result = await client.query(
        `INSERT INTO dim_penetration 
         (deal_id, comp_name, comp_nbr_of_rooms, market_adr_change, market_occupancy_pct, 
          market_penetration, occupied_room_growth_pct, property_adr_change, sample_hotel_occupancy)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING penetration_id`,
        [
          dealId,
          data.comp_name || null,
          data.comp_nbr_of_rooms || null,
          data.market_adr_change || null,
          data.market_occupancy_pct || null,
          data.market_penetration || null,
          data.occupied_room_growth_pct || null,
          data.property_adr_change || null,
          data.sample_hotel_occupancy || null
        ]
      );
      
      const penetrationId = result.rows[0].penetration_id;
      
      // Update the fact table to link to this penetration record
      await client.query(
        `UPDATE fact_deal_assumptions SET penetration_id = $1 WHERE assumption_id = $2`,
        [penetrationId, factId]
      );
      
      return penetrationId;
    }
  } catch (error) {
    console.error('Error in handlePenetration:', error);
    throw error;
  }
}

async function handleRevenue(client, dealId, factId, data) {
  try {
    console.log('Handling revenue data:', data);
    
    // Check if record exists
    const existingRecord = await client.query(
      `SELECT revenue_id FROM dim_revenue WHERE deal_id = $1`,
      [dealId]
    );

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const revenueId = existingRecord.rows[0].revenue_id;
      
      await client.query(
        `UPDATE dim_revenue 
         SET adr_base = $1, adr_growth = $2, other_revenue_percentage = $3,
             revpar_base = $4, revenues_total = $5, updated_at = NOW()
         WHERE revenue_id = $6`,
        [
          data.adr_base || null,
          data.adr_growth || null,
          data.other_revenue_percentage || null,
          data.revpar_base || null,
          data.revenues_total || null,
          revenueId
        ]
      );
      
      return revenueId;
    } else {
      // Insert new record
      const result = await client.query(
        `INSERT INTO dim_revenue 
         (deal_id, adr_base, adr_growth, other_revenue_percentage, revpar_base, revenues_total)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING revenue_id`,
        [
          dealId,
          data.adr_base || null,
          data.adr_growth || null,
          data.other_revenue_percentage || null,
          data.revpar_base || null,
          data.revenues_total || null
        ]
      );
      
      const revenueId = result.rows[0].revenue_id;
      
      // Update the fact table to link to this revenue record
      await client.query(
        `UPDATE fact_deal_assumptions SET revenue_id = $1 WHERE assumption_id = $2`,
        [revenueId, factId]
      );
      
      return revenueId;
    }
  } catch (error) {
    console.error('Error in handleRevenue:', error);
    throw error;
  }
}

async function handleDeptExpense(client, dealId, factId, data) {
  try {
    console.log('Handling departmental expense data:', data);
    
    // Check if record exists
    const existingRecord = await client.query(
      `SELECT dept_expense_id FROM dim_departmental_expense WHERE deal_id = $1`,
      [dealId]
    );

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const deptExpenseId = existingRecord.rows[0].dept_expense_id;
      
      await client.query(
        `UPDATE dim_departmental_expense 
         SET rooms_expense_par = $1, rooms_expense_por = $2, food_beverage_expense_par = $3,
             food_beverage_expense_por = $4, other_dept_expense_par = $5, other_dept_expense_por = $6,
             expenses_total = $7, updated_at = NOW()
         WHERE dept_expense_id = $8`,
        [
          data.rooms_expense_par || null,
          data.rooms_expense_por || null,
          data.food_beverage_expense_par || null,
          data.food_beverage_expense_por || null,
          data.other_dept_expense_par || null,
          data.other_dept_expense_por || null,
          data.expenses_total || null,
          deptExpenseId
        ]
      );
      
      return deptExpenseId;
    } else {
      // Insert new record
      const result = await client.query(
        `INSERT INTO dim_departmental_expense 
         (deal_id, rooms_expense_par, rooms_expense_por, food_beverage_expense_par, food_beverage_expense_por,
          other_dept_expense_par, other_dept_expense_por, expenses_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING dept_expense_id`,
        [
          dealId,
          data.rooms_expense_par || null,
          data.rooms_expense_por || null,
          data.food_beverage_expense_par || null,
          data.food_beverage_expense_por || null,
          data.other_dept_expense_par || null,
          data.other_dept_expense_por || null,
          data.expenses_total || null
        ]
      );
      
      const deptExpenseId = result.rows[0].dept_expense_id;
      
      // Update the fact table to link to this department expense record
      await client.query(
        `UPDATE fact_deal_assumptions SET dept_expense_id = $1 WHERE assumption_id = $2`,
        [deptExpenseId, factId]
      );
      
      return deptExpenseId;
    }
  } catch (error) {
    console.error('Error in handleDeptExpense:', error);
    throw error;
  }
}

async function handleManagementFee(client, dealId, factId, data) {
  try {
    console.log('Handling management fee data:', data);
    
    // Check if record exists
    const existingRecord = await client.query(
      `SELECT mgmt_fee_id FROM dim_management_fee WHERE deal_id = $1`,
      [dealId]
    );

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const mgmtFeeId = existingRecord.rows[0].mgmt_fee_id;
      
      await client.query(
        `UPDATE dim_management_fee 
         SET management_fee_base = $1, management_fee_incentive = $2, management_fee_percentage = $3,
             franchise_fee_base = $4, franchise_fee_percentage = $5, brand_marketing_fee = $6,
             updated_at = NOW()
         WHERE mgmt_fee_id = $7`,
        [
          data.management_fee_base || null,
          data.management_fee_incentive || null,
          data.management_fee_percentage || null,
          data.franchise_fee_base || null,
          data.franchise_fee_percentage || null,
          data.brand_marketing_fee || null,
          mgmtFeeId
        ]
      );
      
      return mgmtFeeId;
    } else {
      // Insert new record
      const result = await client.query(
        `INSERT INTO dim_management_fee 
         (deal_id, management_fee_base, management_fee_incentive, management_fee_percentage, 
          franchise_fee_base, franchise_fee_percentage, brand_marketing_fee)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING mgmt_fee_id`,
        [
          dealId,
          data.management_fee_base || null,
          data.management_fee_incentive || null,
          data.management_fee_percentage || null,
          data.franchise_fee_base || null,
          data.franchise_fee_percentage || null,
          data.brand_marketing_fee || null
        ]
      );
      
      const mgmtFeeId = result.rows[0].mgmt_fee_id;
      
      // Update the fact table to link to this management fee record
      await client.query(
        `UPDATE fact_deal_assumptions SET mgmt_fee_id = $1 WHERE assumption_id = $2`,
        [mgmtFeeId, factId]
      );
      
      return mgmtFeeId;
    }
  } catch (error) {
    console.error('Error in handleManagementFee:', error);
    throw error;
  }
}

async function handleUndist1(client, dealId, factId, data) {
  try {
    console.log('Handling undistributed expenses 1 data:', data);
    
    // Check if record exists
    const existingRecord = await client.query(
      `SELECT undist1_id FROM dim_undistributed1 WHERE deal_id = $1`,
      [dealId]
    );

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const undist1Id = existingRecord.rows[0].undist1_id;
      
      await client.query(
        `UPDATE dim_undistributed1 
         SET admin_general_par = $1, admin_general_por = $2, sales_marketing_par = $3,
             sales_marketing_por = $4, property_ops_maintenance_par = $5, property_ops_maintenance_por = $6,
             updated_at = NOW()
         WHERE undist1_id = $7`,
        [
          data.admin_general_par || null,
          data.admin_general_por || null,
          data.sales_marketing_par || null,
          data.sales_marketing_por || null,
          data.property_ops_maintenance_par || null,
          data.property_ops_maintenance_por || null,
          undist1Id
        ]
      );
      
      return undist1Id;
    } else {
      // Insert new record
      const result = await client.query(
        `INSERT INTO dim_undistributed1 
         (deal_id, admin_general_par, admin_general_por, sales_marketing_par, sales_marketing_por,
          property_ops_maintenance_par, property_ops_maintenance_por)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING undist1_id`,
        [
          dealId,
          data.admin_general_par || null,
          data.admin_general_por || null,
          data.sales_marketing_par || null,
          data.sales_marketing_por || null,
          data.property_ops_maintenance_par || null,
          data.property_ops_maintenance_por || null
        ]
      );
      
      const undist1Id = result.rows[0].undist1_id;
      
      // Update the fact table to link to this undistributed expenses 1 record
      await client.query(
        `UPDATE fact_deal_assumptions SET undist1_id = $1 WHERE assumption_id = $2`,
        [undist1Id, factId]
      );
      
      return undist1Id;
    }
  } catch (error) {
    console.error('Error in handleUndist1:', error);
    throw error;
  }
}

async function handleUndist2(client, dealId, factId, data) {
  try {
    console.log('Handling undistributed expenses 2 data:', data);
    
    // Check if record exists
    const existingRecord = await client.query(
      `SELECT undist2_id FROM dim_undistributed2 WHERE deal_id = $1`,
      [dealId]
    );

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const undist2Id = existingRecord.rows[0].undist2_id;
      
      await client.query(
        `UPDATE dim_undistributed2 
         SET utilities_costs_par = $1, utilities_costs_por = $2, it_systems_par = $3,
             it_systems_por = $4, updated_at = NOW()
         WHERE undist2_id = $5`,
        [
          data.utilities_costs_par || null,
          data.utilities_costs_por || null,
          data.it_systems_par || null,
          data.it_systems_por || null,
          undist2Id
        ]
      );
      
      return undist2Id;
    } else {
      // Insert new record
      const result = await client.query(
        `INSERT INTO dim_undistributed2 
         (deal_id, utilities_costs_par, utilities_costs_por, it_systems_par, it_systems_por)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING undist2_id`,
        [
          dealId,
          data.utilities_costs_par || null,
          data.utilities_costs_por || null,
          data.it_systems_par || null,
          data.it_systems_por || null
        ]
      );
      
      const undist2Id = result.rows[0].undist2_id;
      
      // Update the fact table to link to this undistributed expenses 2 record
      await client.query(
        `UPDATE fact_deal_assumptions SET undist2_id = $1 WHERE assumption_id = $2`,
        [undist2Id, factId]
      );
      
      return undist2Id;
    }
  } catch (error) {
    console.error('Error in handleUndist2:', error);
    throw error;
  }
}

async function handleNonOpExpense(client, dealId, factId, data) {
  try {
    console.log('Handling non-operating expense data:', data);
    
    // Check if record exists
    const existingRecord = await client.query(
      `SELECT nonop_id FROM dim_nonoperating_expense WHERE deal_id = $1`,
      [dealId]
    );

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const nonopId = existingRecord.rows[0].nonop_id;
      
      await client.query(
        `UPDATE dim_nonoperating_expense 
         SET property_taxes_par = $1, property_taxes_por = $2, insurance_par = $3,
             insurance_por = $4, income_tax_rate = $5, updated_at = NOW()
         WHERE nonop_id = $6`,
        [
          data.property_taxes_par || null,
          data.property_taxes_por || null,
          data.insurance_par || null,
          data.insurance_por || null,
          data.income_tax_rate || null,
          nonopId
        ]
      );
      
      return nonopId;
    } else {
      // Insert new record
      const result = await client.query(
        `INSERT INTO dim_nonoperating_expense 
         (deal_id, property_taxes_par, property_taxes_por, insurance_par, insurance_por, income_tax_rate)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING nonop_id`,
        [
          dealId,
          data.property_taxes_par || null,
          data.property_taxes_por || null,
          data.insurance_par || null,
          data.insurance_por || null,
          data.income_tax_rate || null
        ]
      );
      
      const nonopId = result.rows[0].nonop_id;
      
      // Update the fact table to link to this non-operating expense record
      await client.query(
        `UPDATE fact_deal_assumptions SET nonop_id = $1 WHERE assumption_id = $2`,
        [nonopId, factId]
      );
      
      return nonopId;
    }
  } catch (error) {
    console.error('Error in handleNonOpExpense:', error);
    throw error;
  }
}

async function handleFFE(client, dealId, factId, data) {
  try {
    console.log('Handling FF&E reserve data:', data);
    
    // Check if record exists
    const existingRecord = await client.query(
      `SELECT ffe_id FROM dim_ffe_reserve WHERE deal_id = $1`,
      [dealId]
    );

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const ffeId = existingRecord.rows[0].ffe_id;
      
      await client.query(
        `UPDATE dim_ffe_reserve 
         SET ffe_reserve_percentage = $1, ffe_reserve_minimum = $2, ffe_reserve_par = $3, updated_at = NOW()
         WHERE ffe_id = $4`,
        [
          data.ffe_reserve_percentage || null,
          data.ffe_reserve_minimum || null,
          data.ffe_reserve_par || null,
          ffeId
        ]
      );
      
      return ffeId;
    } else {
      // Insert new record
      const result = await client.query(
        `INSERT INTO dim_ffe_reserve 
         (deal_id, ffe_reserve_percentage, ffe_reserve_minimum, ffe_reserve_par)
         VALUES ($1, $2, $3, $4)
         RETURNING ffe_id`,
        [
          dealId,
          data.ffe_reserve_percentage || null,
          data.ffe_reserve_minimum || null,
          data.ffe_reserve_par || null
        ]
      );
      
      const ffeId = result.rows[0].ffe_id;
      
      // Update the fact table to link to this FF&E reserve record
      await client.query(
        `UPDATE fact_deal_assumptions SET ffe_id = $1 WHERE assumption_id = $2`,
        [ffeId, factId]
      );
      
      return ffeId;
    }
  } catch (error) {
    console.error('Error in handleFFE:', error);
    throw error;
  }
}

export default handler;
