// pages/api/deals/[id].js
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  
  // Check if the id is 'create' or another non-numeric value
  if (isNaN(id) || id === 'create') {
    return res.status(400).json({ error: 'Invalid deal ID' });
  }
  
  // Check if deals table exists and get column info
  let dealColumns;
  try {
    const columnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'deals';
    `;
    
    const columnResult = await query(columnQuery);
    dealColumns = columnResult.rows.map(row => row.column_name);
    console.log('Deal columns:', dealColumns);
  } catch (error) {
    console.error('Error fetching deal columns:', error);
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
  
  // Determine primary key name (id or deal_id)
  const idColumn = dealColumns.includes('deal_id') ? 'deal_id' : 'id';
  
  // Get all tables names in the database
  let tables = [];
  
  try {
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    
    const tablesResult = await query(tablesQuery);
    tables = tablesResult.rows.map(row => row.table_name);
    console.log('Tables in database:', tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
  
  // Check if dim_property table exists
  const propertyExists = tables.includes('dim_property');
  let propertyColumns = [];
  let propertyIdColumn = 'property_key'; // Use property_key as the default based on error
  
  if (propertyExists) {
    try {
      // Get property columns
      const propertyColumnQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'dim_property';
      `;
      
      const propertyColumnResult = await query(propertyColumnQuery);
      propertyColumns = propertyColumnResult.rows.map(row => row.column_name);
      console.log('Property columns:', propertyColumns);
      
      // Check for various property ID column names
      if (propertyColumns.includes('property_key')) {
        propertyIdColumn = 'property_key';
      } else if (propertyColumns.includes('property_id')) {
        propertyIdColumn = 'property_id';
      } else if (propertyColumns.includes('id')) {
        propertyIdColumn = 'id';
      } else {
        // If we can't find a standard ID column, look for any column with "id" or "key" in it
        const idColumn = propertyColumns.find(col => 
          col.includes('id') || col.includes('key')
        );
        
        if (idColumn) {
          propertyIdColumn = idColumn;
        }
      }
      
      console.log('Using property ID column:', propertyIdColumn);
    } catch (error) {
      console.error('Error getting property columns:', error);
    }
  }
  
  switch (req.method) {
    case 'GET':
      try {
        // Get deal by ID
        const dealQuery = `
          SELECT * FROM deals WHERE ${idColumn} = $1
        `;
        
        const result = await query(dealQuery, [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Deal not found' });
        }
        
        const deal = result.rows[0];
        console.log('Deal found:', deal);
        
        // Only try to get property details if dim_property exists and property_id exists in deal
        if (propertyExists && deal.property_id !== undefined && deal.property_id !== null) {
          try {
            // Use a simple query first to get the property
            const simplePropertyQuery = `
              SELECT * FROM dim_property WHERE ${propertyIdColumn} = $1
            `;
            
            console.log('Simple property query:', simplePropertyQuery);
            console.log('Property ID from deal:', deal.property_id);
            
            const propertyResult = await query(simplePropertyQuery, [deal.property_id]);
            
            if (propertyResult.rows.length > 0) {
              const property = propertyResult.rows[0];
              console.log('Property found:', property);
              
              // Combine deal and property data
              Object.keys(property).forEach(key => {
                // Only add property fields that don't already exist in the deal
                if (deal[key] === undefined) {
                  deal[key] = property[key];
                }
              });
              
              // Ensure property_name is set
              if (property.property_name) {
                deal.property_name = property.property_name;
              }
            } else {
              console.log('No property found with ID:', deal.property_id);
              deal.property_name = 'Unknown Property';
            }
          } catch (propertyError) {
            console.error('Error fetching property details:', propertyError);
            // Continue with just the deal data
            deal.property_name = 'Unknown Property';
          }
        } else {
          console.log('Either property table does not exist or deal has no property_id');
          deal.property_name = 'Unknown Property';
        }
        
        res.status(200).json(deal);
      } catch (error) {
        console.error('Error retrieving deal:', error);
        res.status(500).json({ error: 'Failed to retrieve deal', details: error.message });
      }
      break;
      
    case 'PUT':
      try {
        // Update deal by ID
        const requestBody = req.body;
        console.log('Update request body:', requestBody);
        
        // Build update query dynamically
        const updateFields = [];
        const values = [];
        let paramIndex = 1;
        
        // Only include fields that exist in the table
        Object.keys(requestBody).forEach(key => {
          if (dealColumns.includes(key)) {
            updateFields.push(`${key} = $${paramIndex++}`);
            values.push(requestBody[key]);
          }
        });
        
        // Add updated_at if exists
        if (dealColumns.includes('updated_at')) {
          updateFields.push(`updated_at = $${paramIndex++}`);
          values.push(new Date());
        }
        
        // Add ID as the last parameter
        values.push(id);
        
        if (updateFields.length === 0) {
          return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        const updateQuery = `
          UPDATE deals
          SET ${updateFields.join(', ')}
          WHERE ${idColumn} = $${paramIndex}
          RETURNING *
        `;
        
        console.log('Update query:', updateQuery);
        console.log('Update values:', values);
        
        const result = await query(updateQuery, values);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Deal not found' });
        }
        
        res.status(200).json(result.rows[0]);
      } catch (error) {
        console.error('Error updating deal:', error);
        res.status(500).json({ error: 'Failed to update deal', details: error.message });
      }
      break;
      
    case 'DELETE':
      try {
        // Delete deal by ID
        const deleteQuery = `
          DELETE FROM deals
          WHERE ${idColumn} = $1
          RETURNING *
        `;
        
        const result = await query(deleteQuery, [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Deal not found' });
        }
        
        res.status(200).json({ message: 'Deal deleted successfully' });
      } catch (error) {
        console.error('Error deleting deal:', error);
        res.status(500).json({ error: 'Failed to delete deal', details: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}