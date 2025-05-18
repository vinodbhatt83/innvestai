// Script to fix database foreign key constraints
const fs = require('fs');
const path = require('path');
const { pool } = require('../lib/db');

async function fixForeignKeyConstraints() {
  try {
    console.log('Starting foreign key constraint fix...');
    
    // Read the SQL script
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'fix_foreign_key_constraints.sql'),
      'utf8'
    );
    
    // Execute the SQL script
    const result = await pool.query(sqlScript);
    
    console.log('Foreign key constraints fixed successfully.');
    console.log('Constraint check results:', result[result.length - 1].rows);
    
    return { success: true };
  } catch (error) {
    console.error('Error fixing foreign key constraints:', error);
    return { success: false, error: error.message };
  }
}

// Run directly if this script is executed directly
if (require.main === module) {
  fixForeignKeyConstraints()
    .then(result => {
      if (result.success) {
        console.log('Foreign key constraint fix completed successfully.');
      } else {
        console.error('Foreign key constraint fix failed:', result.error);
      }
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { fixForeignKeyConstraints };
