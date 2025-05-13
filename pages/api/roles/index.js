// pages/api/roles/index.js
import { roleManager } from '../../../lib/auth';
import { withAuth } from '../../../lib/middleware';

async function handler(req, res) {
    const { method } = req;

    if (method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }

    try {
        // Get all roles
        const roles = await roleManager.getAllRoles();

        return res.status(200).json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        return res.status(500).json({ error: 'Failed to fetch roles' });
    }
}

export default withAuth(handler);