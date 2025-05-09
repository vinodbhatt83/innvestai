// pages/api/analytics/revenue.js
import { callStoredProcedure } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { year } = req.query;
    
    if (!year) {
      return res.status(400).json({ error: 'Year parameter is required' });
    }

    // Call the Monthly Revenue Analysis stored procedure
    const result = await callStoredProcedure('get_revenue_by_property', [parseInt(year)]);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve revenue analysis' });
  }
}

