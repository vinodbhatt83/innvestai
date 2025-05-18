// pages/api/debug/db-test.js
import { query } from '../../../lib/db';

export default async function handler(req, res) {
    try {
        console.log('Running database schema check');
        
        // Get list of tables
        const tablesResult = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        const tables = tablesResult.rows.map(row => row.table_name);
        
        // Get users schema
        const usersSchemaResult = await query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        `);
        
        // Check if users table has any data
        const usersCountResult = await query(`SELECT COUNT(*) FROM users`);
        const userCount = parseInt(usersCountResult.rows[0].count);
        
        // If there are users, get a sample user
        let sampleUser = null;
        if (userCount > 0) {
            const sampleUserResult = await query(`
                SELECT * FROM users LIMIT 1
            `);
            sampleUser = sampleUserResult.rows[0];
        }
        
        // Get list of accounts
        const accountsResult = await query(`
            SELECT account_id, account_name, is_active 
            FROM accounts
            ORDER BY account_id
        `);
        
        return res.status(200).json({
            tables,
            usersSchema: usersSchemaResult.rows,
            userCount,
            sampleUser,
            accounts: accountsResult.rows
        });
    } catch (error) {
        console.error('Database test error:', error);
        return res.status(500).json({
            error: 'Database error',
            message: error.message,
            stack: error.stack
        });
    }
}
