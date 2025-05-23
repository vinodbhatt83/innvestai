// Script to ensure all required database tables are properly set up
const { pool } = require('../lib/db.cjs');

// Enable verbose logging
console.log('Script started');
process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

async function setupDatabase() {
  console.log('Setting up database tables for deal assumptions...');
  const client = await pool.connect();
  
  try {
    // Start a transaction
    await client.query('BEGIN');
    
    // 1. Create deals table if it doesn't exist
    console.log('Checking deals table...');
    const dealsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'deals'
      );
    `);
    
    if (!dealsCheck.rows[0].exists) {
      console.log('Creating deals table...');
      await client.query(`
        CREATE TABLE deals (
          deal_id SERIAL PRIMARY KEY,
          name VARCHAR(255)
        );
      `);
    } else {
      console.log('deals table already exists');
    }
    
    // 2. Create dim_acquisition table if it doesn't exist
    console.log('Checking dim_acquisition table...');
    const acquisitionCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dim_acquisition'
      );
    `);
    
    if (!acquisitionCheck.rows[0].exists) {
      console.log('Creating dim_acquisition table...');
      await client.query(`
        CREATE TABLE dim_acquisition (
          acquisition_id SERIAL PRIMARY KEY,
          deal_id INTEGER,
          acquisition_month VARCHAR(20),
          acquisition_year INTEGER,
          acquisition_costs NUMERIC,
          cap_rate_going_in NUMERIC,
          hold_period INTEGER,
          purchase_price NUMERIC,
          purchase_price_method VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      console.log('dim_acquisition table already exists');
      
      // Check if deal_id column exists in dim_acquisition
      const dealIdCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'dim_acquisition' 
          AND column_name = 'deal_id'
        );
      `);
      
      if (!dealIdCheck.rows[0].exists) {
        console.log('Adding deal_id column to dim_acquisition table...');
        await client.query(`
          ALTER TABLE dim_acquisition ADD COLUMN deal_id INTEGER;
        `);
      }
    }
    
    // 3. Create fact_deal_assumptions table if it doesn't exist
    console.log('Checking fact_deal_assumptions table...');
    const factCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'fact_deal_assumptions'
      );
    `);
    
    if (!factCheck.rows[0].exists) {
      console.log('Creating fact_deal_assumptions table...');
      await client.query(`
        CREATE TABLE fact_deal_assumptions (
          assumption_id SERIAL PRIMARY KEY,
          deal_id INTEGER NOT NULL,
          acquisition_id INTEGER,
          user_id INTEGER DEFAULT 1,
          created_by INTEGER DEFAULT 1,
          updated_by INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      console.log('fact_deal_assumptions table already exists');
    }
    
    // 4. Check if we need to insert a test deal
    console.log('Checking for test deal...');
    const dealCheck = await client.query('SELECT deal_id FROM deals WHERE deal_id = 1');
    
    if (dealCheck.rows.length === 0) {
      console.log('Creating test deal...');
      await client.query(`
        INSERT INTO deals (deal_id, name) 
        VALUES (1, 'Test Deal') 
        ON CONFLICT (deal_id) DO NOTHING
        RETURNING deal_id;
      `);
    } else {
      console.log('Test deal already exists');
    }
    
    // 5. Check if we need to create a fact_deal_assumptions record for the test deal
    const factRecordCheck = await client.query(`
      SELECT assumption_id FROM fact_deal_assumptions WHERE deal_id = 1
    `);
    
    if (factRecordCheck.rows.length === 0) {
      console.log('Creating fact record for test deal...');
      await client.query(`
        INSERT INTO fact_deal_assumptions (deal_id) 
        VALUES (1)
        RETURNING assumption_id;
      `);
    } else {
      console.log('Fact record already exists for test deal');
    }
    
    // Commit all changes
    await client.query('COMMIT');
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error setting up database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase().catch(console.error);
