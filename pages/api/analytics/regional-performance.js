
import { callStoredProcedure } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { year, marketSegment } = req.query;
    
    if (!year || !marketSegment) {
      return res.status(400).json({ 
        error: 'Year and marketSegment parameters are required' 
      });
    }

    // Call the Regional Performance Analysis stored procedure
    const result = await callStoredProcedure(
      'get_performance_by_region', 
      [parseInt(year), marketSegment]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve regional performance analysis' });
  }
}


