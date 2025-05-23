// End-to-end test for acquisition assumptions
const { pool } = require('../lib/db.cjs');
const axios = require('axios');

// Global flag for whether the server is running on port 3000 or 3001
const PORT = process.env.PORT || 3001;

async function ensureDatabaseSetup() {
  console.log('🔧 Setting up database for testing...');
  const client = await pool.connect();
  
  try {
    console.log('✓ Database connection established');
    await client.query('BEGIN');
    
    // 1. Create deals table if needed
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
          name VARCHAR(255) NOT NULL
        );
      `);
    }
    
    // 2. Create dim_acquisition table if needed
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
    }
    
    // 3. Create fact_deal_assumptions table if needed
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
    }
    
    // 4. Clean up any existing test data for deal ID 1
    console.log('Cleaning up existing test data...');
    await client.query(`DELETE FROM fact_deal_assumptions WHERE deal_id = 1`);
    await client.query(`DELETE FROM dim_acquisition WHERE deal_id = 1`);
    await client.query(`DELETE FROM deals WHERE deal_id = 1`);
    
    // 5. Create a fresh test deal
    console.log('Creating test deal...');
    await client.query(`
      INSERT INTO deals (deal_id, name) 
      VALUES (1, 'Test Deal')
    `);
    
    // 6. Create a fact record for the test deal
    console.log('Creating fact record...');
    await client.query(`
      INSERT INTO fact_deal_assumptions (deal_id) 
      VALUES (1)
    `);
    
    await client.query('COMMIT');
    console.log('✓ Database setup complete');
    
    // 7. Verify everything was created correctly
    const verifyDeal = await client.query('SELECT * FROM deals WHERE deal_id = 1');
    const verifyFact = await client.query('SELECT * FROM fact_deal_assumptions WHERE deal_id = 1');
    
    console.log('Verification:');
    console.log('- Deal record:', verifyDeal.rows[0] ? 'exists' : 'missing');
    console.log('- Fact record:', verifyFact.rows[0] ? 'exists' : 'missing');
    
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Database setup failed:', error);
    return false;
  } finally {
    client.release();
  }
}

async function testAcquisitionEndpoint() {
  console.log(`\n🧪 Testing acquisition endpoint on port ${PORT}...`);
  
  const payload = {
    deal_id: 1,
    acquisition_month: 'January',
    acquisition_year: 2024,
    acquisition_costs: 50000,
    cap_rate_going_in: 8.5,
    hold_period: 5,
    purchase_price: 5000000,
    purchase_price_method: 'Per Room'
  };
  
  console.log('Test payload:', payload);
  
  try {
    // Try the dedicated endpoint first
    console.log('Trying dedicated acquisition endpoint...');
    const response = await axios({
      method: 'POST',
      url: `http://localhost:${PORT}/api/deals/assumptions/acquisition`,
      headers: { 'Content-Type': 'application/json' },
      data: payload,
      validateStatus: () => true // Don't throw on any status code
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (response.status >= 200 && response.status < 300) {
      console.log('✓ Acquisition endpoint test successful!');
      console.log('Response:', response.data);
      return true;
    } else {
      console.error('❌ Acquisition endpoint test failed');
      console.error('Response:', response.data);
      
      // Try the dynamic endpoint as fallback
      console.log('\nTrying dynamic endpoint as fallback...');
      const fallbackResponse = await axios({
        method: 'POST',
        url: `http://localhost:${PORT}/api/deals/assumptions/[tabType]?tabType=acquisition`,
        headers: { 'Content-Type': 'application/json' },
        data: payload,
        validateStatus: () => true
      });
      
      console.log(`Fallback response status: ${fallbackResponse.status}`);
      
      if (fallbackResponse.status >= 200 && fallbackResponse.status < 300) {
        console.log('✓ Dynamic endpoint test successful!');
        console.log('Response:', fallbackResponse.data);
        return true;
      } else {
        console.error('❌ Dynamic endpoint test also failed');
        console.error('Response:', fallbackResponse.data);
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
    return false;
  }
}

async function verifyDatabaseData() {
  console.log('\n🔍 Verifying data was saved correctly...');
  const client = await pool.connect();
  
  try {
    // Check if acquisition data was saved
    const acquisitionCheck = await client.query(`
      SELECT a.* 
      FROM dim_acquisition a 
      JOIN fact_deal_assumptions f ON a.acquisition_id = f.acquisition_id 
      WHERE f.deal_id = 1
    `);
    
    if (acquisitionCheck.rows.length > 0) {
      console.log('✓ Acquisition data saved successfully!');
      console.log('Saved data:', acquisitionCheck.rows[0]);
      return true;
    } else {
      console.error('❌ No acquisition data found for deal ID 1');
      
      // Check if acquisition exists without being linked
      const orphanCheck = await client.query(`
        SELECT * FROM dim_acquisition WHERE deal_id = 1
      `);
      
      if (orphanCheck.rows.length > 0) {
        console.log('Found orphaned acquisition record:', orphanCheck.rows[0]);
        console.log('Issue might be with linking to fact_deal_assumptions');
      } else {
        console.log('No acquisition data found at all for deal ID 1');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Verification error:', error);
    return false;
  } finally {
    client.release();
  }
}

async function runEndToEndTest() {
  console.log('🚀 STARTING END-TO-END TEST FOR ACQUISITION ASSUMPTIONS');
  
  // Setup database
  const dbSetupSuccess = await ensureDatabaseSetup();
  if (!dbSetupSuccess) {
    console.error('❌ Database setup failed, aborting test');
    return false;
  }
  
  // Test the API endpoint
  const apiTestSuccess = await testAcquisitionEndpoint();
  if (!apiTestSuccess) {
    console.error('❌ API test failed');
    // Continue to verify if anything was saved
  }
  
  // Verify data was saved correctly
  const verificationSuccess = await verifyDatabaseData();
  
  console.log('\n📊 TEST RESULTS:');
  console.log(`- Database setup: ${dbSetupSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- API endpoint: ${apiTestSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Data verification: ${verificationSuccess ? '✅ PASS' : '❌ FAIL'}`);
  
  return dbSetupSuccess && apiTestSuccess && verificationSuccess;
}

runEndToEndTest()
  .then(success => {
    console.log(`\n${success ? '✅ END-TO-END TEST PASSED' : '❌ END-TO-END TEST FAILED'}`);
    pool.end();
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    pool.end();
    process.exit(1);
  });
