// pages/api/roles.js
import { withAuth } from '../../middleware/auth';
import { query } from '../../lib/db';

async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Fetch all available roles
        const result = await query(
            'SELECT role_id, role_name, description, permissions FROM roles ORDER BY role_id'
        );

        return res.status(200).json({ roles: result.rows });
    } catch (error) {
        console.error('Error fetching roles:', error);
        return res.status(500).json({ error: 'An error occurred while fetching roles' });
    }
}

// Export with auth middleware
export default withAuth(handler);