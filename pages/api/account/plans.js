// pages/api/account/plans.js
import { query } from '../../../lib/db';
import { withAuth } from '../../../lib/middleware';

async function handler(req, res) {
    const { method } = req;
    const { user } = req;

    if (method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }

    try {
        // Only account admins can view plan options
        if (!user.is_account_admin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Get all available plans
        const plansQuery = 'SELECT * FROM account_plans ORDER BY price_monthly';
        const plansResult = await query(plansQuery);

        return res.status(200).json(plansResult.rows);
    } catch (error) {
        console.error('Error fetching plans:', error);
        return res.status(500).json({ error: 'Failed to fetch plans' });
    }
}