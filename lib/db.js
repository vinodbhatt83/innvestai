// lib/db.js
const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper function to execute queries
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  }
}

// Helper function to execute stored procedures
async function callStoredProcedure(procedureName, params = []) {
  const paramPlaceholders = params.map((_, i) => `$${i + 1}`).join(', ');
  const text = `SELECT * FROM ${procedureName}(${paramPlaceholders})`;
  return query(text, params);
}

module.exports = {
  query,
  callStoredProcedure,
  pool,
};