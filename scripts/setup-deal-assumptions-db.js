// scripts/setup-deal-assumptions-db.js
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Create a database connection pool
const pool = process.env.NODE_ENV === 'production' 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'innvestai',
      password: process.env.DB_PASSWORD || 'Temp@123',
      port: parseInt(process.env.DB_PORT || '5432'),
    });

// Get the SQL file content
const sqlFilePath = path.join(__dirname, 'create_deal_assumptions_schema.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Execute the SQL statements
const executeSQL = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Beginning database setup for deal assumptions...');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Execute SQL statements
    await client.query(sqlContent);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error setting up database schema:', error);
  } finally {
    // Release client
    client.release();
    
    // End pool
    pool.end();
  }
};

// Run the setup
executeSQL();
