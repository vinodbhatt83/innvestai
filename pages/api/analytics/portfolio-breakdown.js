// pages/api/analytics/portfolio-breakdown.js
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { view = 'market' } = req.query;
    
    // Check which tables exist in the database
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const tableResult = await query(tablesQuery);
    const tables = tableResult.rows.map(row => row.table_name);
    
    let breakdownData = [];
    let totalValue = 0;
    
    // If deals table exists, we'll use it as our data source
    if (tables.includes('deals')) {
      // Check deals table columns
      const dealsColumnsQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'deals'
      `;
      
      const dealsColumnsResult = await query(dealsColumnsQuery);
      const dealColumns = dealsColumnsResult.rows.map(row => row.column_name);
      
      // Get total investment amount
      const totalQuery = `
        SELECT SUM(investment_amount) AS total_investment
        FROM deals
      `;
      
      const totalResult = await query(totalQuery);
      totalValue = parseFloat(totalResult.rows[0]?.total_investment || 0);
      
      // If deals have property_id and we need market or region breakdown
      const hasPropertyId = dealColumns.includes('property_id');
      
      if (hasPropertyId && tables.includes('dim_property')) {
        // Check property table columns
        const propColumnsQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'dim_property'
        `;
        
        const propColumnsResult = await query(propColumnsQuery);
        const propColumns = propColumnsResult.rows.map(row => row.column_name);
        
        // Get property ID column name
        const propIdColumn = propColumns.find(col => col === 'property_key' || col === 'id' || col === 'property_id') || 'property_key';
        
        // Handle different view types
        switch(view) {
          case 'market':
            if (tables.includes('dim_market')) {
              // Check market table columns
              const marketColumnsQuery = `
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'dim_market'
              `;
              
              const marketColumnsResult = await query(marketColumnsQuery);
              const marketColumns = marketColumnsResult.rows.map(row => row.column_name);
              
              // Check if market_key exists in property table
              const hasMarketKey = propColumns.includes('market_key');
              
              if (hasMarketKey) {
                // Get market name column
                const marketNameColumn = marketColumns.find(col => col.includes('name') || col === 'market_name') || 'market_name';
                
                // Get market key column
                const marketIdColumn = marketColumns.find(col => col === 'market_key' || col === 'id') || 'market_key';
                
                const breakdownQuery = `
                  SELECT m.${marketNameColumn} AS name, 
                         SUM(d.investment_amount) AS value
                  FROM deals d
                  JOIN dim_property p ON d.property_id = p.${propIdColumn}
                  JOIN dim_market m ON p.market_key = m.${marketIdColumn}
                  GROUP BY m.${marketNameColumn}
                  ORDER BY value DESC
                `;
                
                try {
                  const result = await query(breakdownQuery);
                  breakdownData = result.rows;
                } catch (err) {
                  console.error('Error executing market breakdown query:', err);
                  // Will fall back to sample data
                }
              }
            }
            break;
            
          case 'region':
            if (tables.includes('dim_region')) {
              // Check if property table has region_key directly
              const hasRegionKey = propColumns.includes('region_key');
              
              if (hasRegionKey) {
                // Get region columns
                const regionColumnsQuery = `
                  SELECT column_name 
                  FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'dim_region'
                `;
                
                const regionColumnsResult = await query(regionColumnsQuery);
                const regionColumns = regionColumnsResult.rows.map(row => row.column_name);
                
                // Get region name column
                const regionNameColumn = regionColumns.find(col => col.includes('name') || col === 'region_name') || 'region_name';
                
                // Get region key column
                const regionIdColumn = regionColumns.find(col => col === 'region_key' || col === 'id') || 'region_key';
                
                const breakdownQuery = `
                  SELECT r.${regionNameColumn} AS name, 
                         SUM(d.investment_amount) AS value
                  FROM deals d
                  JOIN dim_property p ON d.property_id = p.${propIdColumn}
                  JOIN dim_region r ON p.region_key = r.${regionIdColumn}
                  GROUP BY r.${regionNameColumn}
                  ORDER BY value DESC
                `;
                
                try {
                  const result = await query(breakdownQuery);
                  breakdownData = result.rows;
                } catch (err) {
                  console.error('Error executing region breakdown query:', err);
                  // Will fall back to sample data
                }
              } else if (tables.includes('dim_market')) {
                // Check if we need to go through market to get to region
                const marketColumnsQuery = `
                  SELECT column_name 
                  FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'dim_market'
                `;
                
                const marketColumnsResult = await query(marketColumnsQuery);
                const marketColumns = marketColumnsResult.rows.map(row => row.column_name);
                
                const hasMarketRegionKey = marketColumns.includes('region_key');
                
                if (hasMarketRegionKey && propColumns.includes('market_key')) {
                  // Get region columns
                  const regionColumnsQuery = `
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'dim_region'
                  `;
                  
                  const regionColumnsResult = await query(regionColumnsQuery);
                  const regionColumns = regionColumnsResult.rows.map(row => row.column_name);
                  
                  // Get region name column
                  const regionNameColumn = regionColumns.find(col => col.includes('name') || col === 'region_name') || 'region_name';
                  
                  // Use the correct join path
                  const breakdownQuery = `
                    SELECT r.${regionNameColumn} AS name, 
                           SUM(d.investment_amount) AS value
                    FROM deals d
                    JOIN dim_property p ON d.property_id = p.${propIdColumn}
                    JOIN dim_market m ON p.market_key = m.market_key
                    JOIN dim_region r ON m.region_key = r.region_key
                    GROUP BY r.${regionNameColumn}
                    ORDER BY value DESC
                  `;
                  
                  try {
                    const result = await query(breakdownQuery);
                    breakdownData = result.rows;
                  } catch (err) {
                    console.error('Error executing region breakdown query through market:', err);
                    // Will fall back to sample data
                  }
                }
              }
            }
            break;
            
          case 'brand':
            if (tables.includes('dim_brand')) {
              // Check if property table has brand_key
              const hasBrandKey = propColumns.includes('brand_key');
              
              if (hasBrandKey) {
                // Get brand columns
                const brandColumnsQuery = `
                  SELECT column_name 
                  FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'dim_brand'
                `;
                
                const brandColumnsResult = await query(brandColumnsQuery);
                const brandColumns = brandColumnsResult.rows.map(row => row.column_name);
                
                // Get brand name column
                const brandNameColumn = brandColumns.find(col => col.includes('name') || col === 'brand_name') || 'brand_name';
                
                const breakdownQuery = `
                  SELECT b.${brandNameColumn} AS name, 
                         SUM(d.investment_amount) AS value
                  FROM deals d
                  JOIN dim_property p ON d.property_id = p.${propIdColumn}
                  JOIN dim_brand b ON p.brand_key = b.brand_key
                  GROUP BY b.${brandNameColumn}
                  ORDER BY value DESC
                `;
                
                try {
                  const result = await query(breakdownQuery);
                  breakdownData = result.rows;
                } catch (err) {
                  console.error('Error executing brand breakdown query:', err);
                  // Will fall back to sample data
                }
              }
            }
            break;
            
          case 'type':
            if (tables.includes('dim_hotel_type')) {
              // Check if property table has hotel_type_key
              const hasTypeKey = propColumns.includes('hotel_type_key');
              
              if (hasTypeKey) {
                // Get hotel_type columns
                const typeColumnsQuery = `
                  SELECT column_name 
                  FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'dim_hotel_type'
                `;
                
                const typeColumnsResult = await query(typeColumnsQuery);
                const typeColumns = typeColumnsResult.rows.map(row => row.column_name);
                
                // Get type name column
                const typeNameColumn = typeColumns.find(col => col.includes('name') || col === 'hotel_type_name' || col === 'type_name') || 'hotel_type_name';
                
                const breakdownQuery = `
                  SELECT ht.${typeNameColumn} AS name, 
                         SUM(d.investment_amount) AS value
                  FROM deals d
                  JOIN dim_property p ON d.property_id = p.${propIdColumn}
                  JOIN dim_hotel_type ht ON p.hotel_type_key = ht.hotel_type_key
                  GROUP BY ht.${typeNameColumn}
                  ORDER BY value DESC
                `;
                
                try {
                  const result = await query(breakdownQuery);
                  breakdownData = result.rows;
                } catch (err) {
                  console.error('Error executing hotel type breakdown query:', err);
                  // Will fall back to sample data
                }
              }
            }
            break;
        }
      }
    }
    
    // If we couldn't get real data, return sample data
    if (breakdownData.length === 0) {
      switch(view) {
        case 'market':
          breakdownData = [
            { name: 'New York', value: 23800000 },
            { name: 'Miami', value: 18700000 },
            { name: 'Chicago', value: 15300000 },
            { name: 'Las Vegas', value: 11900000 },
            { name: 'Other Markets', value: 15300000 }
          ];
          break;
        case 'region':
          breakdownData = [
            { name: 'Northeast', value: 27200000 },
            { name: 'Southeast', value: 22100000 },
            { name: 'West', value: 18700000 },
            { name: 'Midwest', value: 11900000 },
            { name: 'Southwest', value: 5100000 }
          ];
          break;
        case 'brand':
          breakdownData = [
            { name: 'Marriott', value: 29750000 },
            { name: 'Hilton', value: 23800000 },
            { name: 'Hyatt', value: 12750000 },
            { name: 'Independent', value: 10200000 },
            { name: 'Other Brands', value: 8500000 }
          ];
          break;
        case 'type':
          breakdownData = [
            { name: 'Luxury', value: 35700000 },
            { name: 'Upscale', value: 26350000 },
            { name: 'Midscale', value: 15300000 },
            { name: 'Economy', value: 7650000 }
          ];
          break;
      }
      
      totalValue = breakdownData.reduce((sum, item) => sum + item.value, 0);
    }
    
    // Calculate percentages
    const formattedData = breakdownData.map(item => ({
      name: item.name,
      value: parseFloat(item.value),
      percentage: totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0
    }));
    
    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching portfolio breakdown:', error);
    
    // Return fallback data on error
    const fallbackData = [
      { name: 'New York', value: 23800000, percentage: 28 },
      { name: 'Miami', value: 18700000, percentage: 22 },
      { name: 'Chicago', value: 15300000, percentage: 18 },
      { name: 'Las Vegas', value: 11900000, percentage: 14 },
      { name: 'Other Markets', value: 15300000, percentage: 18 }
    ];
    
    res.status(200).json(fallbackData);
  }
}