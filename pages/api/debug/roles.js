// pages/api/debug/roles.js
import { query } from '../../../lib/db';

// Debug version of the roles API that bypasses authentication for testing
export default async function handler(req, res) {
    const { method } = req;

    if (method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }

    try {
        console.log('Debug roles API called');
        
        // Get all roles directly from the database
        const result = await query(
            'SELECT role_id, role_name, description, permissions FROM roles ORDER BY role_id'
        );
        
        console.log(`Found ${result.rows.length} roles`);
        return res.status(200).json({ 
            roles: result.rows,
            debug: true 
        });
    } catch (error) {
        console.error('Error in debug roles API:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch roles',
            message: error.message,
            stack: error.stack 
        });
    }
}
