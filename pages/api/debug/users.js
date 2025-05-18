// pages/api/debug/users.js - Test endpoint without authentication
import { query } from '../../../lib/db';

export default async function handler(req, res) {
    console.log('Debug users API called');
    
    try {
        // Get accountId from query params
        const { accountId } = req.query;
        console.log('Debug API - accountId:', accountId);
        
        if (!accountId) {
            return res.status(400).json({ error: 'accountId is required' });
        }
        
        // Query all users for the account directly
        const result = await query(
            `SELECT u.user_id, u.email, u.first_name, u.last_name, u.is_account_admin, u.is_active, 
             r.role_id, r.role_name 
             FROM users u 
             LEFT JOIN roles r ON u.role_id = r.role_id 
             WHERE u.account_id = $1
             ORDER BY u.last_name, u.first_name`,
            [accountId]
        );
        
        console.log('Debug API - Query result:', { 
            rowCount: result.rowCount, 
            columns: result.fields?.map(f => f.name) 
        });
        
        // Return the users regardless of authentication
        return res.status(200).json({ 
            users: result.rows,
            message: 'Debug API - Success'
        });
    } catch (error) {
        console.error('Debug API - Error:', error);
        return res.status(500).json({ 
            error: 'Database error', 
            message: error.message 
        });
    }
}
