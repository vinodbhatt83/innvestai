# PowerShell script to set up and test database
$ErrorActionPreference = "Stop"

Write-Host "Starting setup and test process..." -ForegroundColor Cyan

# Step 1: Test Database Connection
Write-Host "`n[1/5] Testing database connection..." -ForegroundColor Yellow
Set-Location -Path "c:\vinod\projects\innvest\POC\innvestai"

# Create a temporary JavaScript file for database setup
$setupScript = @"
const { pool } = require('./lib/db.cjs');

async function setupTestDeal() {
  console.log('Starting database setup...');
  const client = await pool.connect();
  
  try {
    console.log('Connected to database!');
    await client.query('BEGIN');
    
    // Check if deals table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'deals'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('Creating deals table...');
      await client.query(`
        CREATE TABLE deals (
          deal_id SERIAL PRIMARY KEY,
          deal_name VARCHAR(255) NOT NULL,
          property_name VARCHAR(255),
          property_address VARCHAR(255),
          city VARCHAR(100),
          state VARCHAR(50),
          property_type VARCHAR(100),
          number_of_rooms INTEGER,
          status VARCHAR(50) DEFAULT 'Draft',
          user_id INTEGER DEFAULT 1,
          created_by INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Deals table created!');
    }
    
    // Check if fact_deal_assumptions table exists
    const factTableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'fact_deal_assumptions'
    `);
    
    if (factTableCheck.rows.length === 0) {
      console.log('Creating fact_deal_assumptions table...');
      await client.query(`
        CREATE TABLE fact_deal_assumptions (
          assumption_id SERIAL PRIMARY KEY,
          deal_id INTEGER NOT NULL,
          acquisition_id INTEGER,
          financing_id INTEGER,
          disposition_id INTEGER,
          capex_id INTEGER,
          inflation_id INTEGER,
          penetration_id INTEGER,
          revenue_id INTEGER,
          dept_expense_id INTEGER,
          mgmt_fee_id INTEGER,
          undist1_id INTEGER,
          undist2_id INTEGER,
          nonop_expense_id INTEGER,
          ffe_id INTEGER,
          user_id INTEGER DEFAULT 1,
          created_by INTEGER DEFAULT 1,
          updated_by INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('fact_deal_assumptions table created!');
    }
    
    // Check if dim_acquisition table exists
    const acqTableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'dim_acquisition'
    `);
    
    if (acqTableCheck.rows.length === 0) {
      console.log('Creating dim_acquisition table...');
      await client.query(`
        CREATE TABLE dim_acquisition (
          acquisition_id SERIAL PRIMARY KEY,
          acquisition_month VARCHAR(20),
          acquisition_year INTEGER,
          acquisition_costs DECIMAL(15,2),
          cap_rate_going_in DECIMAL(5,2),
          hold_period INTEGER,
          purchase_price DECIMAL(15,2),
          purchase_price_method VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('dim_acquisition table created!');
    }
      // Now create or update test deals with various property types
    const checkExistingDeal = await client.query('SELECT deal_id FROM deals WHERE deal_id = 1');
    
    if (checkExistingDeal.rows.length === 0) {
      console.log('Creating sample deals...');
      
      // Create an array of sample deals
      const sampleDeals = [
        {
          deal_id: 1,
          deal_name: 'Marriott Suites 2 Investment',
          property_name: 'Marriott Suites Downtown',
          property_address: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          property_type: 'Luxury',
          number_of_rooms: 150,
          status: 'Draft'
        },
        {
          deal_id: 2,
          deal_name: 'Westin 4 Investment',
          property_name: 'Westin Resort & Spa',
          property_address: '500 Resort Way',
          city: 'Miami',
          state: 'FL',
          property_type: 'Full Service',
          number_of_rooms: 200,
          status: 'Draft'
        },
        {
          deal_id: 3,
          deal_name: 'Fairfield 6 Investment',
          property_name: 'Fairfield Inn & Suites',
          property_address: '750 Convention Blvd',
          city: 'Las Vegas',
          state: 'NV',
          property_type: 'Limited Service',
          number_of_rooms: 120,
          status: 'Draft'
        }
      ];
      
      // Insert each sample deal
      for (const deal of sampleDeals) {
        await client.query(`
          INSERT INTO deals (
            deal_id, deal_name, property_name, property_address,
            city, state, property_type, number_of_rooms,
            status, user_id, created_by
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7, $8,
            $9, 1, 1
          )
        `, [
          deal.deal_id,
          deal.deal_name,
          deal.property_name,
          deal.property_address,
          deal.city,
          deal.state,
          deal.property_type,
          deal.number_of_rooms,
          deal.status
        ]);
      }
      
      console.log('Sample deals created!');
    } else {
      console.log('Sample deals already exist.');
    }
    
    // Create fact_deal_assumptions record if needed
    const checkExistingFact = await client.query('SELECT assumption_id FROM fact_deal_assumptions WHERE deal_id = 1');
    
    if (checkExistingFact.rows.length === 0) {
      console.log('Creating fact_deal_assumptions record...');
      await client.query(`
        INSERT INTO fact_deal_assumptions (
          deal_id, user_id, created_by, updated_by
        ) VALUES (
          1, 1, 1, 1
        )
      `);
      console.log('fact_deal_assumptions record created!');
    } else {
      console.log('fact_deal_assumptions record already exists.');
    }
    
    await client.query('COMMIT');
    console.log('Database setup completed successfully!');
    
    // Verify deal exists
    const verifyDeal = await client.query('SELECT * FROM deals WHERE deal_id = 1');
    console.log('Verification - Deal data:', verifyDeal.rows[0]);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during database setup:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupTestDeal().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
"@

# Save the script
$setupScript | Out-File -FilePath ".\scripts\setup-test-db.js" -Encoding utf8

# Run the database setup script
Write-Host "Running database setup script..." -ForegroundColor Yellow
node .\scripts\setup-test-db.js

Write-Host "Fixing the acquisition API endpoint..." -ForegroundColor Yellow

# Run the test acquisition script
Write-Host "Testing acquisition API endpoint..." -ForegroundColor Yellow
node .\scripts\test-acquisition.js

# Update deal display data
Write-Host "`nUpdating deal display data..." -ForegroundColor Yellow
node .\scripts\update-deal-display-data.js

Write-Host "`nSetup complete! Start the dev server with 'npm run dev' to see the updated deals list" -ForegroundColor Green
