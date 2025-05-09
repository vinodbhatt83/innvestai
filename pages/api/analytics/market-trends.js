
import { callStoredProcedure } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { market, startYear, endYear } = req.query;
    
    if (!market || !startYear || !endYear) {
      return res.status(400).json({ 
        error: 'Market, startYear, and endYear parameters are required' 
      });
    }

    // Call the Market Trends Analysis stored procedure
    const result = await callStoredProcedure(
      'get_market_trends', 
      [market, parseInt(startYear), parseInt(endYear)]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve market trends analysis' });
  }
}