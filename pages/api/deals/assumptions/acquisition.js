// API route for saving deal assumptions by tab
import { pool } from '../../../../lib/db';
import { saveActivityLog } from '../../../../utils/activityLogger';

// Helper function to save acquisition assumptions
async function saveAcquisitionAssumptions(deal_id, data, user_id = 1) {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Create the deal if it doesn't exist - for testing purposes only
    let dealCheck = await client.query(
      'SELECT deal_id FROM deals WHERE deal_id = $1',
      [deal_id]
    );

    if (dealCheck.rows.length === 0) {
      console.log(`Deal with ID ${deal_id} not found, creating a test deal`);
        try {
        // Create a minimal test deal with just the necessary fields
        await client.query(`
          INSERT INTO deals (deal_id, name) VALUES ($1, $2)
        `, [deal_id, `Test Deal ${deal_id}`]);
        
        // Verify the deal was created
        dealCheck = await client.query(
          'SELECT deal_id FROM deals WHERE deal_id = $1',
          [deal_id]
        );
        
        if (dealCheck.rows.length === 0) {
          await client.query('ROLLBACK');
          throw new Error(`Failed to create deal with ID ${deal_id}`);
        }
      } catch (createError) {
        console.error(`Error creating test deal: ${createError.message}`);
        await client.query('ROLLBACK');
        throw new Error(`Failed to create deal: ${createError.message}`);
      }
    }
    
    // Check if this deal already has acquisition assumptions
    const checkResult = await client.query(
      'SELECT acquisition_id FROM fact_deal_assumptions WHERE deal_id = $1',
      [deal_id]
    );
    
    let acquisition_id;
    
    if (checkResult.rows.length > 0 && checkResult.rows[0].acquisition_id) {
      // Update existing record
      acquisition_id = checkResult.rows[0].acquisition_id;
      
      await client.query(
        `UPDATE dim_acquisition 
         SET acquisition_month = $1, 
             acquisition_year = $2, 
             acquisition_costs = $3, 
             cap_rate_going_in = $4, 
             hold_period = $5, 
             purchase_price = $6, 
             purchase_price_method = $7,
             updated_at = CURRENT_TIMESTAMP
         WHERE acquisition_id = $8`,
        [
          data.acquisition_month,
          data.acquisition_year,
          parseFloat(data.acquisition_costs) || null,
          parseFloat(data.cap_rate_going_in) || null,
          parseInt(data.hold_period) || 5,
          data.purchase_price ? parseFloat(data.purchase_price) : null,
          data.purchase_price_method,
          acquisition_id
        ]
      );
      
    } else {
      // Insert new record
      const acquisitionResult = await client.query(
        `INSERT INTO dim_acquisition 
         (acquisition_month, acquisition_year, acquisition_costs, cap_rate_going_in, hold_period, purchase_price, purchase_price_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING acquisition_id`,
        [
          data.acquisition_month,
          data.acquisition_year, 
          parseFloat(data.acquisition_costs) || null,
          parseFloat(data.cap_rate_going_in) || null,
          parseInt(data.hold_period) || 5,
          data.purchase_price ? parseFloat(data.purchase_price) : null,
          data.purchase_price_method
        ]
      );
      
      acquisition_id = acquisitionResult.rows[0].acquisition_id;
      
      // Update fact table with acquisition_id      // First check if we need all these fields
      try {
        // Simple version first - just the essential fields
        await client.query(
          `INSERT INTO fact_deal_assumptions 
           (deal_id, acquisition_id)
           VALUES ($1, $2)
           ON CONFLICT (deal_id) 
           DO UPDATE SET acquisition_id = $2`,
          [deal_id, acquisition_id]
        );
      } catch (factError) {
        console.error('Error with simplified fact update, trying with full fields:', factError);
        
        // If that fails, try with all fields
        await client.query(
          `INSERT INTO fact_deal_assumptions 
           (deal_id, acquisition_id, user_id, created_by, updated_by)
           VALUES ($1, $2, $3, $3, $3)
           ON CONFLICT (deal_id) 
           DO UPDATE SET acquisition_id = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP`,
          [deal_id, acquisition_id, user_id]
        );
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Log activity
    await saveActivityLog({
      user_id,
      action: 'UPDATE_DEAL_ACQUISITION',
      entity_type: 'DEAL',
      entity_id: deal_id,
      details: `Updated acquisition assumptions for deal ${deal_id}`
    });
    
    return { success: true, acquisition_id };
      } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Error saving acquisition assumptions:', error);
    
    // Log more details about the error context
    console.error('Error context:', { 
      deal_id, 
      data_sample: Object.keys(data).slice(0, 5),
      error_message: error.message,
      error_stack: error.stack
    });
    
    throw error;
  } finally {
    client.release();
  }
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
    try {
    const { deal_id, ...tabData } = req.body;
    
    if (!deal_id) {
      return res.status(400).json({ error: 'Missing deal ID' });
    }
    
  // Log the data being sent for debugging
    console.log('Acquisition assumptions data:', {
      deal_id,
      acquisition_month: tabData.acquisition_month,
      acquisition_year: tabData.acquisition_year,
      acquisition_costs: tabData.acquisition_costs,
      cap_rate_going_in: tabData.cap_rate_going_in,
      hold_period: tabData.hold_period,
      purchase_price: tabData.purchase_price,
      purchase_price_method: tabData.purchase_price_method
    });
    
    // Make sure the deal exists in the database
    try {
      const { pool } = require('../../../../lib/db');
      const client = await pool.connect();
      const dealCheck = await client.query('SELECT deal_id FROM deals WHERE deal_id = $1', [deal_id]);
      client.release();
      
      if (dealCheck.rows.length === 0) {
        // Try to create a minimal deal record
        try {
          const newClient = await pool.connect();
          await newClient.query('BEGIN');
          await newClient.query('INSERT INTO deals (deal_id, name) VALUES ($1, $2)', [deal_id, `Deal ${deal_id}`]);
          await newClient.query('COMMIT');
          newClient.release();
          console.log(`Created minimal deal record for ID ${deal_id}`);
        } catch (createError) {
          console.error('Failed to create deal record:', createError);
        }
      }
    } catch (checkError) {
      console.error('Error checking for deal:', checkError);
    }
    
    // Use a default user ID since we're not using authentication
    const user_id = 1; // Default user ID
    
    const result = await saveAcquisitionAssumptions(deal_id, tabData, user_id);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Acquisition assumptions saved successfully',
      data: result
    });
  } catch (error) {
    console.error('API error saving acquisition assumptions:', error);
    
    // Enhanced error handling with more specific status codes and messages
    let status = 500;
    let message = 'Server error saving acquisition assumptions';
    
    if (error.message) {
      if (error.message.includes('numeric field overflow')) {
        status = 400;
        message = 'One or more numeric values are too large for the database field. Please check your inputs.';
      } else if (error.message.includes('not found')) {
        status = 404;
        message = `Deal not found: ${error.message}`;
      } else if (error.message.includes('violates') || error.message.includes('constraint')) {
        status = 400;
        message = `Database constraint violation: ${error.message}`;
      } else if (error.message.includes('syntax')) {
        status = 400;
        message = `Invalid data format: ${error.message}`;
      }
    }
      return res.status(status).json({
      error: message,
      details: error.toString(),
      context: {
        deal_id: req.body?.deal_id || 'undefined',
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Export without auth middleware for consistency with [tabType].js
export default handler;
