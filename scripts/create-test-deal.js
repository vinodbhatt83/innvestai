// Script to create a test deal in the database
const { pool } = require('../lib/db');

async function createTestDeal() {
  const client = await pool.connect();
  try {
    console.log('Creating test deal in the database...');
    
    await client.query('BEGIN');
    
    // Check if deal ID 1 already exists
    const checkDeal = await client.query('SELECT deal_id FROM deals WHERE deal_id = 1');
    
    if (checkDeal.rows.length > 0) {
      console.log('Deal with ID 1 already exists');
    } else {
      // Create a test deal
      const dealResult = await client.query(`
        INSERT INTO deals (
          deal_id, deal_name, property_name, property_address, 
          city, state, property_type, number_of_rooms, 
          status, user_id, created_by
        ) VALUES (
          1, 'Test Deal', 'Test Property', '123 Main St',
          'Test City', 'CA', 'Hotel', 100,
          'Draft', 1, 1
        ) RETURNING deal_id
      `);
      
      console.log('Created test deal with ID:', dealResult.rows[0].deal_id);
      
      // Create fact_deal_assumptions entry for this deal
      const factResult = await client.query(`
        INSERT INTO fact_deal_assumptions (
          deal_id, user_id, created_by
        ) VALUES (
          1, 1, 1
        ) RETURNING assumption_id
      `);
      
      console.log('Created fact_deal_assumptions entry with ID:', factResult.rows[0].assumption_id);
    }
    
    await client.query('COMMIT');
    console.log('Transaction committed successfully');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating test deal:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

createTestDeal().catch(console.error);
