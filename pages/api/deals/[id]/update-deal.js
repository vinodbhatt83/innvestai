// API route for direct deal updates (not assumption-specific)
import { withAuth } from '../../../../middleware/auth';
import { pool } from '../../../../lib/db';
import { saveActivityLog } from '../../../../utils/activityLogger';

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const updateData = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'Deal ID is required' });
  }
  
  try {
    // Check if deal exists
    const checkDealQuery = `
      SELECT * FROM deals WHERE id = $1 OR deal_id = $1
    `;
    
    const dealResult = await pool.query(checkDealQuery, [id]);
    
    if (dealResult.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    
    const dealRecord = dealResult.rows[0];
    
    // Prepare update fields
    const updateFields = [];
    const updateValues = [];
    let paramCounter = 1;
    
    // Dynamically build the update query based on provided fields
    for (const [key, value] of Object.entries(updateData)) {
      // Skip properties that shouldn't be directly updated
      if (key === 'id' || key === 'deal_id' || key === 'created_at') continue;
      
      updateFields.push(`${key} = $${paramCounter}`);
      updateValues.push(value);
      paramCounter++;
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // If no valid update fields, return error
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid update data provided' });
    }
    
    // Build and execute the update query
    const updateQuery = `
      UPDATE deals 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCounter} OR deal_id = $${paramCounter}
      RETURNING *
    `;
    
    updateValues.push(id);
    
    const result = await pool.query(updateQuery, updateValues);
    
    if (result.rows.length === 0) {
      return res.status(500).json({ error: 'Failed to update deal' });
    }
    
    // Log the activity
    await saveActivityLog({
      activity_type: 'deal_updated',
      deal_id: dealRecord.deal_id || dealRecord.id,
      description: `Updated deal information for ${dealRecord.deal_name || dealRecord.property_name}`,
      data: JSON.stringify({
        previous: dealRecord,
        updated: updateData
      }),
      user_id: req.user?.id || null
    });
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ 
      error: 'Failed to update deal', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export default withAuth(handler);
