import { callStoredProcedure } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { year, marketCount } = req.query;
    
    if (!year || !marketCount) {
      return res.status(400).json({ 
        error: 'Year and marketCount parameters are required' 
      });
    }

    // Call the Market Comparison stored procedure
    const result = await callStoredProcedure(
      'compare_markets', 
      [parseInt(year), parseInt(marketCount)]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve market comparison' });
  }
}