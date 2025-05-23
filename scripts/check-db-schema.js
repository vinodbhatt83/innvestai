// Script to check database schema
const { pool } = require('../lib/db');

async function checkSchema() {
  const client = await pool.connect();
  try {
    console.log('Connected to database!');
    
    // Get all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
    `);
    console.log('Tables:', tables.rows.map(row => row.table_name));
    
    // Check dim_acquisition table structure
    const acqColumns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name='dim_acquisition' 
      ORDER BY ordinal_position
    `);
    console.log('\ndim_acquisition columns:');
    console.log(acqColumns.rows);
    
    // Check fact_deal_assumptions table structure
    const factColumns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name='fact_deal_assumptions' 
      ORDER BY ordinal_position
    `);
    console.log('\nfact_deal_assumptions columns:');
    console.log(factColumns.rows);
    
    // Check deals table structure
    const dealColumns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name='deals' 
      ORDER BY ordinal_position
    `);
    console.log('\ndeals columns:');
    console.log(dealColumns.rows);
    
    // Check if deal ID 1 exists
    const dealCheck = await client.query(`SELECT * FROM deals WHERE deal_id = 1`);
    console.log('\nDoes deal with ID 1 exist?', dealCheck.rows.length > 0);
    if (dealCheck.rows.length > 0) {
      console.log('Deal data:', dealCheck.rows[0]);
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema().catch(console.error);
