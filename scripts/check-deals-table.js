// Script to check deals table structure
const { pool } = require('../lib/db.cjs');

async function checkDealsTable() {
  console.log('Checking deals table structure...');
  const client = await pool.connect();
  
  try {
    // Check if deals table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'deals'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('deals table does not exist');
      return;
    }
    
    // Get columns
    const columnResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'deals'
      ORDER BY ordinal_position
    `);
    
    console.log('deals columns:');
    columnResult.rows.forEach(row => {
      console.log(`${row.column_name} (${row.data_type})`);
    });
    
    // Get a sample deal
    const sampleResult = await client.query(`
      SELECT * FROM deals LIMIT 1
    `);
    
    if (sampleResult.rows.length > 0) {
      console.log('\nSample deal data:');
      console.log(sampleResult.rows[0]);
    } else {
      console.log('\nNo deals found in table');
    }
    
  } catch (error) {
    console.error('Error checking deals table:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkDealsTable();
