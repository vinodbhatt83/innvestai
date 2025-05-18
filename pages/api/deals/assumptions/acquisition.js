// API route for saving deal assumptions by tab
import { withAuth } from '../../../../middleware/auth';
import { pool } from '../../../../lib/db';
import { saveActivityLog } from '../../../../utils/activityLogger';

// Helper function to save acquisition assumptions
async function saveAcquisitionAssumptions(deal_id, data, user_id) {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
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
      
      // Update fact table with acquisition_id
      await client.query(
        `INSERT INTO fact_deal_assumptions 
         (deal_id, acquisition_id, user_id, created_by, updated_by)
         VALUES ($1, $2, $3, $3, $3)
         ON CONFLICT (deal_id) 
         DO UPDATE SET acquisition_id = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP`,
        [deal_id, acquisition_id, user_id]
      );
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
    
    // Access user information from the req object attached by withAuth middleware
    const user_id = req.user.id; // or user_id based on your actual data structure
    
    const result = await saveAcquisitionAssumptions(deal_id, tabData, user_id);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Acquisition assumptions saved successfully',
      data: result
    });
  } catch (error) {
    console.error('API error saving acquisition assumptions:', error);
    if (error.message && error.message.includes('numeric field overflow')) {
      return res.status(400).json({ 
        error: 'One or more numeric values are too large for the database field. Please check your inputs.'
      });
    }
    return res.status(500).json({ error: 'Server error saving acquisition assumptions' });
  }
}

// Export with auth middleware
export default withAuth(handler);
