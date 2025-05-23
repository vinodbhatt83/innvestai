// Script to check dim_property table structure
const { pool } = require('../lib/db.cjs');

async function checkPropertyTable() {
  console.log('Checking dim_property table structure...');
  const client = await pool.connect();
  
  try {
    // Check if dim_property table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'dim_property'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('dim_property table does not exist');
      return;
    }
    
    // Get columns
    const columnResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'dim_property'
      ORDER BY ordinal_position
    `);
    
    console.log('dim_property columns:');
    columnResult.rows.forEach(row => {
      console.log(`${row.column_name} (${row.data_type})`);
    });
    
  } catch (error) {
    console.error('Error checking property table:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkPropertyTable();
