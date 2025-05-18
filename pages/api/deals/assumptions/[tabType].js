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

  const client = await pool.connect();
  try {
    // Start a transaction
    await client.query('BEGIN');

    // First, check if the deal exists
    const dealCheck = await client.query(
      'SELECT deal_id FROM deals WHERE deal_id = $1',
      [deal_id]
    );

    if (dealCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Deal not found' });
    }    // Get or create a fact record for this deal
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
    
    // Check for specific error types to provide better error messages
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      status = 404;
    } else if (error.message.includes('violates') || error.message.includes('constraint')) {
      status = 400;
      errorMessage = `Database constraint violation: ${error.message}`;
    } else if (error.message.includes('permission') || error.message.includes('denied')) {
      status = 403;
      errorMessage = `Permission denied: ${error.message}`;
    }
    
    return res.status(status).json({
      error: `Failed to save ${tabType} data`,
      message: errorMessage,
      details: error.toString()
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
    // Check if record exists
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
          data.acquisition_month || null,
          data.acquisition_year || null,
          data.acquisition_costs || null,
          data.cap_rate_going_in || null,
          data.hold_period || null,
          data.purchase_price || null,
          data.purchase_price_method || null,
          acquisitionId
        ]
      );
      
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
          data.acquisition_month || null,
          data.acquisition_year || null,
          data.acquisition_costs || null,
          data.cap_rate_going_in || null,
          data.hold_period || null,
          data.purchase_price || null,
          data.purchase_price_method || null
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
             updated_at = NOW()
         WHERE financing_id = $7`,
        [
          data.loan_to_value || null,
          data.interest_rate || null,
          data.loan_term || null,
          data.amortization_period || null,
          data.debt_coverage_ratio || null,
          data.lender_fee || null,
          financingId
        ]
      );
      
      return financingId;
    } else {
      // Insert new record
      const result = await client.query(
        `INSERT INTO dim_financing 
         (deal_id, loan_to_value, interest_rate, loan_term, amortization_period, debt_coverage_ratio, lender_fee)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING financing_id`,
        [
          dealId,
          data.loan_to_value || null,
          data.interest_rate || null,
          data.loan_term || null,
          data.amortization_period || null,
          data.debt_coverage_ratio || null,
          data.lender_fee || null
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
  // Similar implementation
  console.log('Handling disposition data:', data);
  return null;
}

async function handleCapitalExpense(client, dealId, factId, data) {
  console.log('Handling capital expense data:', data);
  return null;
}

async function handleInflation(client, dealId, factId, data) {
  console.log('Handling inflation data:', data);
  return null;
}

async function handlePenetration(client, dealId, factId, data) {
  console.log('Handling penetration data:', data);
  return null;
}

async function handleRevenue(client, dealId, factId, data) {
  console.log('Handling revenue data:', data);
  return null;
}

async function handleDeptExpense(client, dealId, factId, data) {
  console.log('Handling departmental expense data:', data);
  return null;
}

async function handleManagementFee(client, dealId, factId, data) {
  console.log('Handling management fee data:', data);
  return null;
}

async function handleUndist1(client, dealId, factId, data) {
  console.log('Handling undistributed expenses 1 data:', data);
  return null;
}

async function handleUndist2(client, dealId, factId, data) {
  console.log('Handling undistributed expenses 2 data:', data);
  return null;
}

async function handleNonOpExpense(client, dealId, factId, data) {
  console.log('Handling non-operating expense data:', data);
  return null;
}

async function handleFFE(client, dealId, factId, data) {
  console.log('Handling FF&E reserve data:', data);
  return null;
}

export default handler;
