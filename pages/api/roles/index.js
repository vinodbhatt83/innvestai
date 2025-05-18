// pages/api/roles/index.js
import { withAuth } from '../../../middleware/auth';
import { query } from '../../../lib/db';

async function handler(req, res) {
    const { method } = req;

    if (method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }

    try {        // Get all roles directly from the database
        const result = await query(
            'SELECT role_id, role_name, description, permissions FROM roles ORDER BY role_id'
        );
        
        return res.status(200).json({ roles: result.rows });
    } catch (error) {
        console.error('Error fetching roles:', error);
        return res.status(500).json({ error: 'Failed to fetch roles' });
    }
}

export default withAuth(handler);