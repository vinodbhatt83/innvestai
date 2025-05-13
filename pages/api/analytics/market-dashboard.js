// pages/api/analytics/market-dashboard.js
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // If the request has specific parameters, handle it like the original API
    if (req.query.year && req.query.marketCount && req.query.propertyName) {
      const { year, marketCount, propertyName } = req.query;
      
      // Try to call the stored procedure
      const functionQuery = `
        SELECT * FROM generate_market_dashboard_data($1, $2, $3)
      `;
      
      const result = await query(functionQuery, [
        parseInt(year), 
        parseInt(marketCount), 
        propertyName
      ]);
      
      return res.status(200).json(result.rows);
    }

    // For dashboard requests without specific parameters, get data directly
    // First, check what columns actually exist in the fact_market_data table
    const columnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'fact_market_data';
    `;
    
    const columnsResult = await query(columnsQuery);
    const factColumns = columnsResult.rows.map(row => row.column_name);
    
    // Now build a query using only the columns that actually exist
    const hasRevpar = factColumns.includes('revpar');
    const hasAdr = factColumns.includes('adr');
    const hasOccupancy = factColumns.includes('occupancy');
    
    // Select growth metric based on what's available in the table
    let growthColumn = "0"; // default to 0 if no growth column exists
    
    if (factColumns.includes('growth_percentage')) {
      growthColumn = "growth_percentage";
    } else if (factColumns.includes('growth')) {
      growthColumn = "growth";
    } else if (hasRevpar) {
      // If no direct growth column, we'll just use revpar for ordering
      growthColumn = "revpar";
    }
    
    // Get top markets data with the columns that exist
    const topMarketsQuery = `
      SELECT 
        m.market_name, 
        ${hasRevpar ? 'f.revpar' : '0 as revpar'}, 
        ${hasAdr ? 'f.adr' : '0 as adr'},
        ${hasOccupancy ? 'f.occupancy' : '0 as occupancy'},
        ${growthColumn !== "0" ? `f.${growthColumn}` : '0'} as growth
      FROM 
        fact_market_data f
      JOIN 
        dim_market m ON f.market_key = m.market_key
      ORDER BY 
        ${hasRevpar ? 'f.revpar' : 'growth'} DESC
      LIMIT 5
    `;
    
    // Get industry averages with the columns that exist
    const industryMetricsQuery = `
      SELECT 
        ${hasRevpar ? 'AVG(revpar)' : '0'} as average_revpar,
        ${hasOccupancy ? 'AVG(occupancy)' : '0'} as average_occupancy,
        ${hasAdr ? 'AVG(adr)' : '0'} as average_adr,
        ${growthColumn !== "0" ? `AVG(${growthColumn})` : '0'} as revpar_growth
      FROM 
        fact_market_data
    `;
    
    const [marketsResult, metricsResult] = await Promise.all([
      query(topMarketsQuery),
      query(industryMetricsQuery)
    ]);
    
    if (marketsResult.rows.length > 0) {
      // Format the data properly
      const formattedMarkets = marketsResult.rows.map(market => ({
        name: market.market_name,
        revpar: parseFloat(market.revpar) || 0,
        growth: parseFloat(market.growth) || 0
      }));
      
      const metrics = {
        averageRevPar: parseFloat(metricsResult.rows[0].average_revpar) || 0,
        averageOccupancy: parseFloat(metricsResult.rows[0].average_occupancy) || 0,
        averageADR: parseFloat(metricsResult.rows[0].average_adr) || 0,
        revParGrowth: parseFloat(metricsResult.rows[0].revpar_growth) || 0
      };
      
      return res.status(200).json({
        topMarkets: formattedMarkets,
        industryMetrics: metrics
      });
    } else {
      // If no data found in the database, return an empty structure
      return res.status(200).json({
        topMarkets: [],
        industryMetrics: {
          averageRevPar: 0,
          averageOccupancy: 0,
          averageADR: 0,
          revParGrowth: 0
        }
      });
    }
  } catch (error) {
    console.error('Error in market dashboard API:', error);
    
    // Return empty data to prevent dashboard from breaking
    return res.status(200).json({
      topMarkets: [],
      industryMetrics: {
        averageRevPar: 0,
        averageOccupancy: 0,
        averageADR: 0,
        revParGrowth: 0
      }
    });
  }
}