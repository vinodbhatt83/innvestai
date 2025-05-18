// Script to check database connectivity and table structure
const { Pool } = require('pg');
const config = require('../config/database');

async function checkDatabaseConnection() {
  console.log('Checking database connection...');
  
  const pool = new Pool(config.postgres);
  
  try {
    const client = await pool.connect();
    try {
      console.log('✅ Successfully connected to database');
      
      // Check if deals table exists and its structure
      const tableResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'deals'
        );
      `);
      
      if (tableResult.rows[0].exists) {
        console.log('✅ Deals table exists');
        
        // Check deals table structure
        const columnsResult = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'deals'
          ORDER BY ordinal_position;
        `);
        
        console.log('Deals table structure:');
        columnsResult.rows.forEach(row => {
          console.log(`- ${row.column_name} (${row.data_type})`);
        });
        
        // Check primary key
        const pkResult = await client.query(`
          SELECT c.column_name
          FROM information_schema.table_constraints tc 
          JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name) 
          JOIN information_schema.columns AS c ON c.table_schema = tc.constraint_schema
            AND tc.table_name = c.table_name AND ccu.column_name = c.column_name
          WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = 'deals';
        `);
        
        if (pkResult.rows.length > 0) {
          console.log(`✅ Primary key column: ${pkResult.rows[0].column_name}`);
        } else {
          console.log('❌ No primary key found on deals table');
        }
        
      } else {
        console.log('❌ Deals table does not exist');
      }
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
  } finally {
    await pool.end();
  }
}

// Check if this file was run directly
if (require.main === module) {
  (async () => {
    try {
      await checkDatabaseConnection();
    } catch (error) {
      console.error('❌ Check failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  checkDatabaseConnection
};
