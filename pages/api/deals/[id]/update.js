// API route for updating deal assumptions data
import { withAuth } from '../../../../middleware/auth';
import { pool } from '../../../../lib/db';
import { saveActivityLog } from '../../../../utils/activityLogger';

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  // Handle different types of updates
  if (req.body.tab) {
    // This is a tab-specific update (assumptions tab update)
    return handleTabUpdate(req, res);
  }
  
  // This is a general deal update
  return handleDealUpdate(req, res);
}

// Handle general deal updates
async function handleDealUpdate(req, res) {
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

// Handle the tab-specific update flow
async function handleTabUpdate(req, res) {
  const { id } = req.query;
  const { tab, data } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'Deal ID is required' });
  }
  
  if (!tab) {
    return res.status(400).json({ error: 'Tab name is required' });
  }
  
  if (!data) {
    return res.status(400).json({ error: 'Update data is required' });
  }
  
  try {
    // Map tab names to dimension table names
    const tableMappings = {
      'property': 'deals',  // directly update the main deal record
      'acquisition': 'dim_acquisition',
      'financing': 'dim_financing',
      'disposition': 'dim_disposition',
      'capital': 'dim_capital_expense',
      'inflation': 'dim_inflation',
      'penetration': 'dim_penetration',
      'operating-revenue': 'dim_operating_revenue',
      'departmental-expenses': 'dim_departmental_expenses',
      'management-franchise': 'dim_management_fees',
      'undistributed-expenses-1': 'dim_undistributed_expenses_1',
      'undistributed-expenses-2': 'dim_undistributed_expenses_2',
      'non-operating-expenses': 'dim_non_operating_expenses',
      'ffe-reserve': 'dim_ffe_reserve'
    };
    
    const tableName = tableMappings[tab];
    
    if (!tableName) {
      return res.status(400).json({ error: 'Invalid tab name' });
    }
    
    const client = await pool.connect();
    
    try {
      // Start transaction
      await client.query('BEGIN');
      
      if (tab === 'property') {
        // Direct update to deals table
        const { 
          deal_name, property_name, property_address, city, 
          state, number_of_rooms, property_type, status 
        } = data;
        
        const updateResult = await client.query(
          `UPDATE deals 
           SET deal_name = $1, 
               property_name = $2,
               property_address = $3,
               city = $4,
               state = $5,
               number_of_rooms = $6,
               property_type = $7,
               status = $8,
               updated_at = CURRENT_TIMESTAMP
           WHERE deal_id = $9
           RETURNING *`,
          [
            deal_name, property_name, property_address, city, 
            state, parseInt(number_of_rooms) || null, property_type, status || 'Active',
            id
          ]
        );
        
        if (updateResult.rows.length === 0) {
          throw new Error('Deal not found');
        }
        
        // Log activity
        await saveActivityLog({
          user_id: req.user?.id || 'system',
          action: 'UPDATE_DEAL_PROPERTY',
          entity_type: 'DEAL',
          entity_id: id,
          details: `Updated property details for deal ${id}`
        });
        
        await client.query('COMMIT');
        
        return res.status(200).json({ 
          success: true, 
          message: 'Property details updated successfully',
          data: updateResult.rows[0]
        });
      } else {
        // For other tabs, we need to check the fact table first
        const factResult = await client.query(
          `SELECT * FROM fact_deal_assumptions WHERE deal_id = $1`,
          [id]
        );
        
        // Id column name based on dimension table
        const idColumnName = `${tab.replace(/-/g, '_')}_id`;
        
        let dimensionId = factResult.rows.length > 0 ? factResult.rows[0][idColumnName] : null;
        
        // Create or update dimension record
        if (dimensionId) {
          // Get columns for this dimension table
          const columnsResult = await client.query(
            `SELECT column_name 
             FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = $1
               AND column_name != '${idColumnName}'`,
            [tableName]
          );
          
          const columns = columnsResult.rows.map(r => r.column_name);
          
          // Build dynamic update query
          const updateFields = [];
          const queryParams = [dimensionId];
          let paramIndex = 2;
          
          columns.forEach(column => {
            if (data[column] !== undefined && column !== 'created_at') {
              updateFields.push(`${column} = $${paramIndex++}`);
              
              // Handle numeric conversions
              if (column.includes('rate') || column.includes('percent') || column.includes('price')) {
                queryParams.push(parseFloat(data[column]) || null);
              } else if (column.includes('year') || column.includes('period')) {
                queryParams.push(parseInt(data[column]) || null);
              } else {
                queryParams.push(data[column]);
              }
            }
          });
          
          // Add updated_at if it exists
          if (columns.includes('updated_at')) {
            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
          }
          
          // Execute update if fields exist
          if (updateFields.length > 0) {
            const updateQuery = `
              UPDATE ${tableName}
              SET ${updateFields.join(', ')}
              WHERE ${idColumnName} = $1
              RETURNING *
            `;
            
            await client.query(updateQuery, queryParams);
          }
        } else {
          // Create new dimension record
          const columns = Object.keys(data).filter(k => k !== 'deal_id');
          const values = columns.map(c => data[c]);
          
          const placeholders = values.map((_, i) => `$${i + 1}`);
          
          const insertQuery = `
            INSERT INTO ${tableName} (${columns.join(', ')})
            VALUES (${placeholders.join(', ')})
            RETURNING *
          `;
          
          const insertResult = await client.query(insertQuery, values);
          dimensionId = insertResult.rows[0][idColumnName];
          
          // Update fact table with new ID
          const updateFactQuery = `
            INSERT INTO fact_deal_assumptions (deal_id, ${idColumnName}, created_by, updated_by)
            VALUES ($1, $2, $3, $3)
            ON CONFLICT (deal_id) 
            DO UPDATE SET ${idColumnName} = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP
          `;
          
          await client.query(updateFactQuery, [
            id, dimensionId, req.user?.id || 'system'
          ]);
        }
        
        // Log activity
        await saveActivityLog({
          user_id: req.user?.id || 'system',
          action: `UPDATE_DEAL_${tab.toUpperCase().replace(/-/g, '_')}`,
          entity_type: 'DEAL',
          entity_id: id,
          details: `Updated ${tab} assumptions for deal ${id}`
        });
        
        await client.query('COMMIT');
        
        return res.status(200).json({ 
          success: true, 
          message: `${tab.charAt(0).toUpperCase() + tab.slice(1)} assumptions updated successfully`,
          dimensionId
        });
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error updating ${tab} assumptions:`, error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`API error updating deal assumptions:`, error);
    
    if (error.message.includes('numeric field overflow')) {
      return res.status(400).json({ 
        error: 'One or more numeric values are too large for the database field. Please check your inputs.' 
      });
    }
    
    return res.status(500).json({ error: 'Server error updating deal assumptions' });
  }
}

// Handle direct deal updates (not assumption-specific)
async function handleDealUpdate(req, res) {
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
