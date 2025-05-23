// Script to test just the acquisition API endpoint
const axios = require('axios');
const { pool } = require('../lib/db.cjs');

async function checkDatabaseForDeal() {
  console.log('Checking if deal exists in database...');
  const client = await pool.connect();
  
  try {    // First check table structure
    console.log('Checking deals table structure...');
    const tableStructure = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'deals' 
      ORDER BY ordinal_position
    `);
    
    if (tableStructure.rows.length === 0) {
      console.error('Deals table not found!');
      return false;
    }
    
    console.log('Deals table columns:', tableStructure.rows.map(r => r.column_name).join(', '));
    
    // Check if deal ID 1 exists
    const dealCheck = await client.query('SELECT deal_id FROM deals WHERE deal_id = 1');
    
    if (dealCheck.rows.length > 0) {
      console.log('✓ Deal with ID 1 exists:', dealCheck.rows[0]);
      return true;
    } else {
      console.log('✗ Deal with ID 1 does NOT exist in database');
      
      // Try to create the deal
      console.log('Creating test deal...');
      try {
        await client.query('BEGIN');
          // Build dynamic insert based on columns we found
        const columnsResult = await client.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'deals' AND column_name != 'deal_id'
          ORDER BY ordinal_position
        `);
        
        if (columnsResult.rows.length === 0) {
          console.error('Failed to get columns for deals table');
          return false;
        }
          // Insert a proper test deal
        console.log('Inserting test deal with ID 1...');
        await client.query(`
          INSERT INTO deals (
            deal_id, deal_name, property_name, property_address,
            city, state, property_type, number_of_rooms,
            status
          ) VALUES (
            1, 'Test Deal', 'Test Hotel', '123 Main St',
            'Test City', 'CA', 'Luxury', 100,
            'Draft'
          )
        `);
          // Check fact_deal_assumptions table structure
        const factTableColumns = await client.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'fact_deal_assumptions'
          ORDER BY ordinal_position
        `);
        
        if (factTableColumns.rows.length === 0) {
          console.log('fact_deal_assumptions table not found, attempting to create it...');
          // Create minimal fact table
          await client.query(`
            CREATE TABLE IF NOT EXISTS fact_deal_assumptions (
              assumption_id SERIAL PRIMARY KEY,
              deal_id INTEGER NOT NULL
            )
          `);
        }
        
        // Create a minimal fact record
        console.log('Creating fact_deal_assumptions entry...');
        await client.query(`
          INSERT INTO fact_deal_assumptions (deal_id) VALUES (1)
        `);
        
        await client.query('COMMIT');
        console.log('✓ Test deal created successfully');
        return true;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating test deal:', error);
        return false;
      }
    }
  } catch (error) {
    console.error('Error checking database for deal:', error);
    return false;
  } finally {
    client.release();
  }
}

async function testAcquisition() {
  try {
    console.log('Testing acquisition endpoint...');
    
    // First ensure deal exists in database
    const dealExists = await checkDatabaseForDeal();
    if (!dealExists) {
      console.error('Cannot proceed with test - no deal in database');
      return false;
    }
    
    const payload = {
      deal_id: 1,  // Make sure this matches an existing deal ID in your database
      acquisition_month: 'January',
      acquisition_year: 2024,
      acquisition_costs: 50000,
      cap_rate_going_in: 8.5,
      hold_period: 5,
      purchase_price: 5000000,
      purchase_price_method: 'Per Room'
    };
    
    console.log('Sending payload:', payload);
      // First, try the dedicated endpoint
    try {
      const response = await axios({
        method: 'POST',
        url: 'http://localhost:3001/api/deals/assumptions/acquisition',
        headers: { 'Content-Type': 'application/json' },
        data: payload
      });
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      return true;
    } catch (error) {
      console.error('Error with direct endpoint:', error.message);
      
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      
      // If the direct endpoint failed, try the dynamic endpoint
      try {
        console.log('Trying dynamic endpoint...');        const dynamicResponse = await axios({
          method: 'POST',
          url: 'http://localhost:3001/api/deals/assumptions/[tabType]?tabType=acquisition',
          headers: { 'Content-Type': 'application/json' },
          data: payload
        });
        
        console.log('Dynamic response status:', dynamicResponse.status);
        console.log('Dynamic response data:', dynamicResponse.data);
        return true;
      } catch (dynamicError) {
        console.error('Error with dynamic endpoint:', dynamicError.message);
        
        if (dynamicError.response) {
          console.error('Dynamic error response:', dynamicError.response.status, dynamicError.response.data);
        }
        
        return false;
      }
    }
  } catch (error) {
    console.error('General error:', error);
    return false;
  }
}

testAcquisition().then(success => {
  console.log('Test completed, success:', success);
  process.exit(success ? 0 : 1);
});
