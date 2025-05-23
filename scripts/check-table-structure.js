// Script to check database tables
const { pool } = require('../lib/db.cjs');

async function checkTableStructure() {
  console.log('Checking database structure...');
  const client = await pool.connect();
  
  try {
    // Check if dim_property table exists
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'dim_property'
    `);
    
    if (tableResult.rows.length === 0) {
      console.log('dim_property table does not exist');
    } else {
      console.log('dim_property table exists');
      
      // Get column information
      const columnResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'dim_property'
        ORDER BY ordinal_position
      `);
      
      console.log('Column structure of dim_property:');
      columnResult.rows.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    }
    
    // Check deals table structure
    const dealsColumnResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'deals'
      ORDER BY ordinal_position
    `);
    
    console.log('\nColumn structure of deals:');
    dealsColumnResult.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('Error checking database structure:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTableStructure().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
