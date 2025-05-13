// lib/db.js

// Initialize query and pool as null
let pool = null;
let query = null;

// Only run this code on the server
if (typeof window === 'undefined') {
  try {
    // Server-side code - import pg using require to avoid webpack issues
    const { Pool } = require('pg');

    // Create a database connection pool
    pool = process.env.NODE_ENV === 'production' 
      ? new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: {
            rejectUnauthorized: false
          }
        })
      : new Pool({
          user: process.env.DB_USER || 'postgres',
          host: process.env.DB_HOST || 'localhost',
          database: process.env.DB_NAME || 'innvestai', // Use built-in postgres database
          password: process.env.DB_PASSWORD || 'Temp@123',
          port: parseInt(process.env.DB_PORT || '5432'),
        });

    // Define the query function
    query = async (text, params) => {
      try {
        const start = Date.now();
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        
        // Log query performance in development
        if (process.env.NODE_ENV !== 'production') {
          console.log('Executed query', { text, duration, rows: res.rowCount });
        }
        
        return res;
      } catch (error) {
        console.error('Database query error:', error);
        throw error;
      }
    };

    // Setup event handlers for the pool
    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
      // Don't crash the server on connection errors
    });

    console.log('Database module initialized on server');
  } catch (error) {
    console.error('Failed to initialize database module:', error);
    
    // Create non-functional stubs if initialization fails
    pool = {
      query: () => { throw new Error('Database pool not initialized'); },
      on: () => {}
    };

    query = async () => { throw new Error('Database query function not initialized'); };
  }
} else {
  // Client-side mock implementation
  query = async () => {
    throw new Error('Database queries cannot be executed on the client side');
  };
  
  pool = {
    query: () => {
      throw new Error('Database queries cannot be executed on the client side');
    },
    on: () => {}
  };
}

// Choose one export style based on the environment
// Use ES modules export style since that's what the rest of your code uses
export { query, pool };