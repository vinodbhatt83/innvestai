import { callStoredProcedure } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { year, marketCount, propertyName } = req.query;
    
    if (!year || !marketCount || !propertyName) {
      return res.status(400).json({ 
        error: 'Year, marketCount, and propertyName parameters are required' 
      });
    }

    // Call the Market Dashboard Data stored procedure
    const result = await callStoredProcedure(
      'generate_market_dashboard_data', 
      [parseInt(year), parseInt(marketCount), propertyName]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve market dashboard data' });
  }
}