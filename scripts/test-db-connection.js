// Script to check database connectivity
const { pool } = require('../lib/db');

async function testDbConnection() {
  try {
    console.log('Attempting to connect to the database...');
    const client = await pool.connect();
    console.log('Successfully connected to the database!');
    
    // Simple query to test the connection
    const result = await client.query('SELECT NOW()');
    console.log('Current database time:', result.rows[0]);
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
}

testDbConnection().catch(console.error);
