// pages/api/deals/index.js
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        // Get all deals with optional filtering
        const { limit = 10, offset = 0, sortBy = 'created_at', order = 'DESC' } = req.query;

        // First, check the structure of the deals table
        const tableInfoQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'deals';
        `;

        const tableInfo = await query(tableInfoQuery);
        const dealColumns = tableInfo.rows.map(row => row.column_name);
        console.log('Deal table columns:', dealColumns);

        // Get the deal ID column name (deal_id or id)
        const dealIdColumn = dealColumns.find(col =>
          col === 'deal_id' || col === 'id'
        ) || 'id';

        // Check if property_id exists in deals
        const hasPropertyId = dealColumns.includes('property_id');

        // Get all deals
        let dealsQuery;

        if (hasPropertyId) {
          // Attempt a simple query first to see if it works
          dealsQuery = `
            SELECT * FROM deals
            ORDER BY ${dealColumns.includes('created_at') ? 'created_at' : dealIdColumn} ${order === 'ASC' ? 'ASC' : 'DESC'}
            LIMIT $1 OFFSET $2
          `;
        } else {
          // If no property_id, just get deals without trying to join
          dealsQuery = `
            SELECT * FROM deals
            ORDER BY ${dealColumns.includes('created_at') ? 'created_at' : dealIdColumn} ${order === 'ASC' ? 'ASC' : 'DESC'}
            LIMIT $1 OFFSET $2
          `;
        }

        const countQuery = `SELECT COUNT(*) FROM deals`;

        const [dealsResult, countResult] = await Promise.all([
          query(dealsQuery, [limit, offset]),
          query(countQuery)
        ]);

        // If we have deals and property_id exists, try to get property details
        const deals = [...dealsResult.rows];

        if (deals.length > 0 && hasPropertyId) {
          // Try to enhance deals with property info
          try {
            // First, check if dim_property table exists and get its structure
            const propertyInfoQuery = `
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'dim_property';
            `;

            const propertyInfo = await query(propertyInfoQuery);

            if (propertyInfo.rows.length > 0) {
              // Get property ID column name
              const propertyIdColumn = propertyInfo.rows.find(col =>
                col.column_name === 'property_id' || col.column_name === 'id'
              )?.column_name || 'property_id';

              // Enhance each deal with property info
              for (let i = 0; i < deals.length; i++) {
                const deal = deals[i];
                if (deal.property_id) {
                  const propertyQuery = `
                    SELECT p.*, h.hotel_type_name, m.market_name
                    FROM dim_property p
                    LEFT JOIN dim_hotel_type h ON p.hotel_type_id = h.hotel_type_id
                    LEFT JOIN dim_market m ON p.market_id = m.market_id
                    WHERE p.${propertyIdColumn} = $1
                  `;

                  try {
                    const propertyResult = await query(propertyQuery, [deal.property_id]);
                    const property = propertyResult.rows[0];

                    if (property) {
                      deals[i] = {
                        ...deal,
                        property_name: property.property_name,
                        hotel_type_name: property.hotel_type_name,
                        market_name: property.market_name
                      };
                    }
                  } catch (propError) {
                    console.error('Error fetching property for deal:', propError);
                    // If property fetch fails, continue with original deal
                  }
                }
              }
            }
          } catch (enhanceError) {
            console.error('Error enhancing deals with property info:', enhanceError);
            // Continue with basic deal data
          }
        }

        res.status(200).json({
          deals,
          total: parseInt(countResult.rows[0].count),
          limit: parseInt(limit),
          offset: parseInt(offset)
        });
      } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Failed to retrieve deals', details: error.message });
      }
      break;

    // pages/api/deals/index.js (POST section updated)
    case 'POST':
      try {
        // Extract form fields from the request
        const requestBody = req.body;
        console.log('Request body:', requestBody);

        // Check the structure of the deals table
        const tableInfoQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'deals';
    `;

        let tableInfo;
        try {
          tableInfo = await query(tableInfoQuery);
        } catch (error) {
          console.log('Error getting table info, deals table might not exist');

          // Create a complete deals table with all required fields
          const createTableQuery = `
        CREATE TABLE IF NOT EXISTS deals (
          id SERIAL PRIMARY KEY,
          property_id INTEGER,
          deal_name VARCHAR(255) NOT NULL,
          investment_amount DECIMAL(15, 2) NOT NULL DEFAULT 1000000,
          expected_return DECIMAL(6, 2) NOT NULL DEFAULT 8.5,
          start_date DATE NOT NULL DEFAULT CURRENT_DATE,
          end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '5 years'),
          status VARCHAR(50) DEFAULT 'Draft',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

          await query(createTableQuery);
          console.log('Created deals table with all required columns');

          // Get the columns again
          tableInfo = await query(tableInfoQuery);
        }

        const dealColumns = tableInfo.rows.map(row => row.column_name);
        console.log('Deal table columns after check:', dealColumns);

        // Map property_id if it was sent from the client as property_key
        let propertyId = requestBody.property_id;

        // If property_id wasn't sent but property_key was, use that instead
        if (propertyId === undefined && requestBody.property_key !== undefined) {
          propertyId = requestBody.property_key;
        }

        // Include the required fields with default values if not provided
        const dataToInsert = {
          deal_name: requestBody.deal_name,
          property_id: propertyId || null,
          investment_amount: requestBody.investment_amount || 1000000,
          expected_return: requestBody.expected_return || 8.5,
          start_date: requestBody.start_date || new Date().toISOString().split('T')[0],
          end_date: requestBody.end_date || new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
          status: requestBody.status || 'Draft'
        };

        // Generate the column list and placeholders
        const columns = [];
        const values = [];
        let placeholders = [];

        // Add fields that exist in the database
        Object.keys(dataToInsert).forEach(key => {
          if (dealColumns.includes(key) && dataToInsert[key] !== undefined) {
            columns.push(key);
            values.push(dataToInsert[key]);
            placeholders.push(`$${values.length}`);
          }
        });

        // Add created_at if in columns
        if (dealColumns.includes('created_at') && !columns.includes('created_at')) {
          columns.push('created_at');
          values.push(new Date());
          placeholders.push(`$${values.length}`);
        }

        console.log('Columns to insert:', columns);
        console.log('Values to insert:', values);

        if (columns.length === 0) {
          return res.status(400).json({ error: 'No valid deal data provided' });
        }

        const insertQuery = `
      INSERT INTO deals (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

        console.log('Insert query:', insertQuery);

        const result = await query(insertQuery, values);
        console.log('Insert result:', result.rows[0]);

        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating deal:', error);
        res.status(500).json({ error: 'Failed to create deal', details: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}