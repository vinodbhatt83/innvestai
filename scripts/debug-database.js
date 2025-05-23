// Script to debug and check database connection
const { pool } = require('../lib/db.cjs');

async function debugDatabaseConnection() {
  console.log('Starting database connection debug...');
  
  try {
    console.log('Testing basic connection...');
    const client = await pool.connect();
    console.log('✓ Successfully connected to database');
    
    try {
      // Check if the database tables exist
      console.log('Checking for required tables...');
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      console.log('Tables found:', tables.rows.map(r => r.table_name).join(', '));
      
      // Check if the deals table has the right structure
      console.log('\nChecking deals table structure...');
      const dealsColumns = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'deals'
      `);
      
      if (dealsColumns.rows.length === 0) {
        console.error('❌ deals table not found or has no columns!');
      } else {
        console.log('✓ deals table exists with columns:', 
          dealsColumns.rows.map(r => r.column_name).join(', '));
      }
      
      // Try to insert a test deal if it doesn't exist
      try {
        console.log('\nAttempting to create test deal...');
        await client.query('BEGIN');
        
        // Check if deal ID 1 already exists
        const checkDeal = await client.query('SELECT * FROM deals WHERE deal_id = 1');
        
        if (checkDeal.rows.length > 0) {
          console.log('✓ Deal with ID 1 already exists:', checkDeal.rows[0]);
        } else {
          // Create a test deal with explicit column names
          const dealResult = await client.query(`
            INSERT INTO deals (
              deal_id, deal_name, property_name, property_address, 
              city, state, property_type, number_of_rooms, 
              status, user_id, created_by, created_at, updated_at
            ) VALUES (
              1, 'Test Deal', 'Test Property', '123 Main St',
              'Test City', 'CA', 'Hotel', 100,
              'Draft', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING *
          `);
          
          console.log('✓ Created test deal:', dealResult.rows[0]);
        }
        
        // Check if fact record exists
        const checkFact = await client.query('SELECT * FROM fact_deal_assumptions WHERE deal_id = 1');
        
        if (checkFact.rows.length > 0) {
          console.log('✓ fact_deal_assumptions record already exists:', checkFact.rows[0]);
        } else {
          // Create fact record
          const factResult = await client.query(`
            INSERT INTO fact_deal_assumptions (
              deal_id, user_id, created_by, created_at, updated_at
            ) VALUES (
              1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING *
          `);
          
          console.log('✓ Created fact_deal_assumptions record:', factResult.rows[0]);
        }
        
        await client.query('COMMIT');
        console.log('✓ Transaction committed successfully');
        
      } catch (insertError) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating test deal:', insertError.message);
        console.error('Details:', insertError);
      }
      
    } catch (queryError) {
      console.error('❌ Error executing database queries:', queryError.message);
      console.error('Details:', queryError);
    } finally {
      client.release();
    }
    
  } catch (connError) {
    console.error('❌ Failed to connect to database:', connError.message);
    console.error('Details:', connError);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

debugDatabaseConnection().catch(console.error);
