// CommonJS version of the database connection for script use
const { Pool } = require('pg');

// Log database connection settings
console.log('Database settings:', {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'innvestai',
  port: parseInt(process.env.DB_PORT || '5432')
});

// Create a database connection pool
let pool;
try {
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
        database: process.env.DB_NAME || 'innvestai', 
        password: process.env.DB_PASSWORD || 'Temp@123',
        port: parseInt(process.env.DB_PORT || '5432'),
      });
  
  console.log('Pool created successfully');
} catch (err) {
  console.error('Error creating database pool:', err);
  // Create a dummy pool to prevent crashing
  pool = {
    connect: () => Promise.reject(new Error('Database connection failed')),
    query: () => Promise.reject(new Error('Database query failed')),
    on: () => {},
    end: () => Promise.resolve()
  };
}

// Define the query function
const query = async (text, params) => {
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

module.exports = { query, pool };
