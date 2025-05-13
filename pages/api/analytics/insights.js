// pages/api/analytics/insights.js
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Optional limit parameter with default of 5 insights
    const { limit = 5 } = req.query;
    const maxInsights = parseInt(limit);
    
    // First, check what tables are available in the database
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const tablesResult = await query(tablesQuery);
    const tables = tablesResult.rows.map(row => row.table_name);
    
    // Try to check what stored procedures are available
    let availableFunctions = [];
    try {
      const functionsQuery = `
        SELECT routine_name
        FROM information_schema.routines
        WHERE routine_type = 'FUNCTION' 
        AND routine_schema = 'public'
      `;
      
      const functionsResult = await query(functionsQuery);
      availableFunctions = functionsResult.rows.map(row => row.routine_name);
    } catch (err) {
      console.error('Error checking available functions:', err);
    }
    
    // Collect insights from multiple sources
    const insights = [];
    let insightId = 1;
    
    // Try to use functions if they exist
    for (const functionName of availableFunctions) {
      // Stop adding insights if we've reached the maximum
      if (insights.length >= maxInsights) break;
      
      if (['analyze_market_dynamics', 'find_market_investment_opportunities', 'analyze_seasonal_patterns'].includes(functionName)) {
        try {
          // Call the function with default parameters
          const functionQuery = `SELECT * FROM ${functionName}(2023, 2022)`;
          const functionResult = await query(functionQuery);
          
          if (functionResult.rows && functionResult.rows.length > 0) {
            // Process results based on function name
            if (functionName === 'analyze_market_dynamics') {
              for (const row of functionResult.rows) {
                if (insights.length >= maxInsights) break;
                
                if (row.market_name && row.revpar_growth) {
                  if (parseFloat(row.revpar_growth) > 5) {
                    insights.push({
                      id: insightId++,
                      type: 'opportunity',
                      title: `${row.market_name} RevPAR growth`,
                      description: `${row.market_name} shows strong RevPAR growth of ${parseFloat(row.revpar_growth).toFixed(1)}%, indicating a potential investment opportunity.`,
                      confidence: parseFloat(row.confidence || 0.85)
                    });
                  } else if (parseFloat(row.revpar_growth) < 0) {
                    insights.push({
                      id: insightId++,
                      type: 'risk',
                      title: `${row.market_name} RevPAR decline`,
                      description: `${row.market_name} shows a RevPAR decline of ${parseFloat(row.revpar_growth).toFixed(1)}%, suggesting caution for investments in this market.`,
                      confidence: parseFloat(row.confidence || 0.82)
                    });
                  }
                }
              }
            } else if (functionName === 'find_market_investment_opportunities') {
              for (const row of functionResult.rows) {
                if (insights.length >= maxInsights) break;
                
                insights.push({
                  id: insightId++,
                  type: 'opportunity',
                  title: `${row.market_name} investment opportunity`,
                  description: `${row.market_name} shows promising investment potential with estimated returns of ${parseFloat(row.expected_return).toFixed(1)}%.`,
                  confidence: parseFloat(row.confidence || 0.88)
                });
              }
            } else if (functionName === 'analyze_seasonal_patterns') {
              if (insights.length < maxInsights) {
                // Generate insight from seasonal data
                const seasons = [];
                let highSeason = null;
                let highValue = 0;
                
                for (const row of functionResult.rows) {
                  if (parseFloat(row.occupancy) > highValue) {
                    highValue = parseFloat(row.occupancy);
                    highSeason = row.month;
                  }
                  
                  if (parseFloat(row.occupancy) > 0.8) {
                    seasons.push(row.month);
                  }
                }
                
                if (seasons.length > 0) {
                  const monthNames = [];
                  for (const monthNum of seasons) {
                    const date = new Date(2023, monthNum - 1, 1);
                    monthNames.push(date.toLocaleString('default', { month: 'long' }));
                  }
                  
                  insights.push({
                    id: insightId++,
                    type: 'roi',
                    title: 'Seasonal pricing opportunity',
                    description: `Demand analysis shows peak periods in ${monthNames.join(', ')}. Optimizing rates during these periods could increase annual returns.`,
                    confidence: 0.84
                  });
                }
              }
            }
          }
        } catch (err) {
          console.error(`Error calling function ${functionName}:`, err);
        }
      }
    }
    
    // If we have fact_market_data, generate insights from it
    if (tables.includes('fact_market_data') && tables.includes('dim_market') && insights.length < maxInsights) {
      try {
        // Get top performing markets by RevPAR
        const topMarketsQuery = `
          SELECT m.market_name, AVG(f.revpar) as avg_revpar, 
                 CASE WHEN AVG(f.revpar) > 150 THEN 0.9
                      WHEN AVG(f.revpar) > 120 THEN 0.85
                      ELSE 0.8 END as confidence
          FROM fact_market_data f
          JOIN dim_market m ON f.market_key = m.market_key
          GROUP BY m.market_name
          ORDER BY avg_revpar DESC
          LIMIT ${maxInsights - insights.length}
        `;
        
        const topMarketsResult = await query(topMarketsQuery);
        if (topMarketsResult.rows && topMarketsResult.rows.length > 0) {
          for (const row of topMarketsResult.rows) {
            if (insights.length >= maxInsights) break;
            
            if (!insights.some(insight => insight.title.includes(row.market_name))) {
              insights.push({
                id: insightId++,
                type: 'opportunity',
                title: `${row.market_name} market opportunity`,
                description: `${row.market_name} shows strong RevPAR performance at $${parseFloat(row.avg_revpar).toFixed(2)}, making it a top market for potential investment.`,
                confidence: parseFloat(row.confidence)
              });
            }
          }
        }
        
        // Get markets with high occupancy
        if (insights.length < maxInsights) {
          const highOccupancyQuery = `
            SELECT m.market_name, AVG(f.occupancy) as avg_occupancy,
                   CASE WHEN AVG(f.occupancy) > 0.85 THEN 0.88
                        WHEN AVG(f.occupancy) > 0.8 THEN 0.83
                        ELSE 0.78 END as confidence
            FROM fact_market_data f
            JOIN dim_market m ON f.market_key = m.market_key
            GROUP BY m.market_name
            HAVING AVG(f.occupancy) > 0.75
            ORDER BY avg_occupancy DESC
            LIMIT ${maxInsights - insights.length}
          `;
          
          const highOccupancyResult = await query(highOccupancyQuery);
          if (highOccupancyResult.rows && highOccupancyResult.rows.length > 0) {
            for (const row of highOccupancyResult.rows) {
              if (insights.length >= maxInsights) break;
              
              if (!insights.some(insight => insight.title.includes(row.market_name))) {
                insights.push({
                  id: insightId++,
                  type: 'roi',
                  title: `${row.market_name} ADR optimization`,
                  description: `With a high average occupancy of ${(parseFloat(row.avg_occupancy) * 100).toFixed(1)}%, ${row.market_name} hotels have potential for ADR optimization to increase RevPAR.`,
                  confidence: parseFloat(row.confidence)
                });
              }
            }
          }
        }
        
        // Check for markets with high RevPAR growth
        if (insights.length < maxInsights) {
          // Use a query to calculate growth between years if possible
          try {
            const growthQuery = `
              WITH current_year AS (
                SELECT m.market_name, AVG(f.revpar) as revpar
                FROM fact_market_data f
                JOIN dim_market m ON f.market_key = m.market_key
                WHERE f.year = 2023
                GROUP BY m.market_name
              ),
              prev_year AS (
                SELECT m.market_name, AVG(f.revpar) as revpar
                FROM fact_market_data f
                JOIN dim_market m ON f.market_key = m.market_key
                WHERE f.year = 2022
                GROUP BY m.market_name
              )
              SELECT c.market_name, 
                     c.revpar as current_revpar,
                     p.revpar as prev_revpar,
                     ((c.revpar - p.revpar) / p.revpar * 100) as growth,
                     CASE WHEN ((c.revpar - p.revpar) / p.revpar * 100) > 10 THEN 0.87
                          WHEN ((c.revpar - p.revpar) / p.revpar * 100) > 5 THEN 0.82
                          ELSE 0.78 END as confidence
              FROM current_year c
              JOIN prev_year p ON c.market_name = p.market_name
              WHERE ((c.revpar - p.revpar) / p.revpar * 100) > 5
              ORDER BY growth DESC
              LIMIT ${maxInsights - insights.length}
            `;
            
            const growthResult = await query(growthQuery);
            if (growthResult.rows && growthResult.rows.length > 0) {
              for (const row of growthResult.rows) {
                if (insights.length >= maxInsights) break;
                
                if (!insights.some(insight => insight.title.includes(row.market_name))) {
                  insights.push({
                    id: insightId++,
                    type: 'opportunity',
                    title: `${row.market_name} growth trend`,
                    description: `${row.market_name} shows YoY RevPAR growth of ${parseFloat(row.growth).toFixed(1)}%, from $${parseFloat(row.prev_revpar).toFixed(2)} to $${parseFloat(row.current_revpar).toFixed(2)}.`,
                    confidence: parseFloat(row.confidence)
                  });
                }
              }
            }
          } catch (err) {
            console.error('Error calculating growth insights:', err);
          }
        }
      } catch (err) {
        console.error('Error generating insights from fact_market_data:', err);
      }
    }
    
    // If we have deals table, generate insights from it
    if (tables.includes('deals') && insights.length < maxInsights) {
      try {
        // Check if we have deals with property info
        const dealsQuery = `
          SELECT COUNT(*) as deal_count, 
                 AVG(expected_return) as avg_return,
                 MAX(investment_amount) as max_investment,
                 MIN(investment_amount) as min_investment
          FROM deals
        `;
        
        const dealsResult = await query(dealsQuery);
        if (dealsResult.rows && dealsResult.rows.length > 0) {
          const dealCount = parseInt(dealsResult.rows[0].deal_count);
          const avgReturn = parseFloat(dealsResult.rows[0].avg_return);
          
          if (dealCount > 0 && insights.length < maxInsights) {
            // Generate portfolio diversification insight based on real data
            insights.push({
              id: insightId++,
              type: 'roi',
              title: 'Portfolio diversification',
              description: `Analysis of your ${dealCount} deals shows an average return of ${avgReturn.toFixed(1)}%. Further geographic diversification could optimize risk-adjusted returns.`,
              confidence: 0.86
            });
          }
          
          // Get status distribution
          if (insights.length < maxInsights) {
            const statusQuery = `
              SELECT status, COUNT(*) as count
              FROM deals
              GROUP BY status
              ORDER BY count DESC
            `;
            
            const statusResult = await query(statusQuery);
            if (statusResult.rows && statusResult.rows.length > 0) {
              // Generate insight about deal statuses
              const draftCount = statusResult.rows.find(r => r.status === 'Draft')?.count || 0;
              
              if (draftCount > 0 && insights.length < maxInsights) {
                insights.push({
                  id: insightId++,
                  type: 'risk',
                  title: 'Pending deal finalization',
                  description: `You have ${draftCount} deals in draft status. Finalizing these deals could help meet your portfolio growth targets.`,
                  confidence: 0.85
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Error generating insights from deals table:', err);
      }
    }
    
    // If we couldn't generate any insights from real data, return an empty array
    // No mock data fallbacks
    
    // Ensure we only return up to maxInsights
    const limitedInsights = insights.slice(0, maxInsights);
    
    res.status(200).json(limitedInsights);
  } catch (error) {
    console.error('Error generating insights:', error);
    // No mock data fallbacks, return empty array on error
    res.status(200).json([]);
  }
}