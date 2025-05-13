// pages/api/properties/search.js
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed'
    });
  }

  // Get the search query from the request
  const { query: searchQuery } = req.query;
  console.log('Search query received:', searchQuery);

  if (!searchQuery || searchQuery.length < 2) {
    console.log('Search query too short, returning empty results');
    return res.status(200).json({ properties: [] });
  }

  try {
    // Dynamically adapt to your database schema
    console.log('Determining database schema...');
    
    // Get information about the dim_property table
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dim_property'
      );
    `;
    
    const tableExists = await query(tableCheckQuery);
    console.log('dim_property table exists:', tableExists.rows[0].exists);
    
    // If the dim_property table doesn't exist, we should check for alternative tables
    if (!tableExists.rows[0].exists) {
      console.log('dim_property table not found, checking for alternative property tables...');
      
      // Check for any table that might contain properties
      const alternativeTablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (
          table_name LIKE '%property%' 
          OR table_name LIKE '%hotel%' 
          OR table_name LIKE '%properties%'
        );
      `;
      
      const alternativeTables = await query(alternativeTablesQuery);
      console.log('Alternative property tables found:', alternativeTables.rows);
      
      if (alternativeTables.rows.length === 0) {
        console.log('No property tables found, returning empty results');
        return res.status(200).json({ properties: [] });
      }
      
      // Use the first alternative table
      const alternativeTable = alternativeTables.rows[0].table_name;
      console.log('Using alternative table:', alternativeTable);
      
      // Get columns from alternative table
      const columnsQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1;
      `;
      
      const columns = await query(columnsQuery, [alternativeTable]);
      const columnNames = columns.rows.map(row => row.column_name);
      console.log('Columns in alternative table:', columnNames);
      
      // Find ID column (look for any column with 'id' or 'key' in the name)
      const idColumn = columnNames.find(col => 
        col.includes('id') || col.includes('key')
      ) || columnNames[0];
      
      // Find name column (look for any column with 'name' in the name)
      const nameColumn = columnNames.find(col => col.includes('name')) || columnNames[1];
      
      // Perform search on alternative table
      const searchQuery = `
        SELECT 
          ${idColumn} as property_key, 
          ${nameColumn} as property_name
        FROM ${alternativeTable}
        WHERE ${nameColumn} ILIKE $1
        LIMIT 10;
      `;
      
      console.log('Running search query on alternative table:', searchQuery);
      const searchResults = await query(searchQuery, [`%${searchQuery}%`]);
      
      return res.status(200).json({ properties: searchResults.rows });
    }
    
    // If we reach here, the dim_property table exists
    // Get the columns from the dim_property table
    const columnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'dim_property';
    `;
    
    const columns = await query(columnsQuery);
    const columnNames = columns.rows.map(row => row.column_name);
    console.log('Columns in dim_property:', columnNames);
    
    // Determine key columns to use in the query
    const idColumn = columnNames.includes('property_key') ? 'property_key' : 
                   columnNames.includes('id') ? 'id' :
                   columnNames.find(col => col.includes('id') || col.includes('key')) || 'id';
                   
    const nameColumn = columnNames.includes('property_name') ? 'property_name' :
                     columnNames.includes('name') ? 'name' :
                     columnNames.find(col => col.includes('name')) || 'property_name';
                     
    const addressColumn = columnNames.includes('address') ? 'address' :
                       columnNames.includes('property_address') ? 'property_address' :
                       null;
                       
    const roomsColumn = columnNames.includes('number_of_rooms') ? 'number_of_rooms' :
                     columnNames.includes('rooms') ? 'rooms' :
                     null;
                     
    const typeColumn = columnNames.includes('property_type') ? 'property_type' :
                     columnNames.includes('type') ? 'type' :
                     columnNames.includes('hotel_type_key') ? 'hotel_type_key' :
                     null;
    
    // Check if we have city and state columns or need to join with other tables
    const hasCityColumn = columnNames.includes('city') || columnNames.includes('city_key');
    const hasStateColumn = columnNames.includes('state') || columnNames.includes('state_key');
    
    // Build the search query based on available columns
    let searchQueryText = `
      SELECT 
        p.${idColumn} as property_key, 
        p.${nameColumn} as property_name
    `;
    
    if (addressColumn) {
      searchQueryText += `, p.${addressColumn} as property_address`;
    }
    
    if (roomsColumn) {
      searchQueryText += `, p.${roomsColumn} as number_of_rooms`;
    }
    
    // Handle city and state
    if (hasCityColumn) {
      if (columnNames.includes('city')) {
        searchQueryText += `, p.city`;
      } else if (columnNames.includes('city_key')) {
        // Check if dim_city table exists for joining
        const cityTableQuery = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'dim_city'
          );
        `;
        
        const cityTableExists = await query(cityTableQuery);
        
        if (cityTableExists.rows[0].exists) {
          searchQueryText += `, c.city_name as city`;
        }
      }
    }
    
    if (hasStateColumn) {
      if (columnNames.includes('state')) {
        searchQueryText += `, p.state`;
      } else if (columnNames.includes('state_key')) {
        // Check if dim_state table exists for joining
        const stateTableQuery = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'dim_state'
          );
        `;
        
        const stateTableExists = await query(stateTableQuery);
        
        if (stateTableExists.rows[0].exists) {
          searchQueryText += `, s.state_name as state`;
        }
      }
    }
    
    // Handle property type
    if (typeColumn) {
      if (typeColumn === 'property_type' || typeColumn === 'type') {
        searchQueryText += `, p.${typeColumn} as property_type`;
      } else if (typeColumn === 'hotel_type_key') {
        // Check if dim_hotel_type table exists for joining
        const typeTableQuery = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'dim_hotel_type'
          );
        `;
        
        const typeTableExists = await query(typeTableQuery);
        
        if (typeTableExists.rows[0].exists) {
          searchQueryText += `, h.hotel_type_name as property_type`;
        }
      }
    }
    
    // FROM clause
    searchQueryText += `\nFROM dim_property p`;
    
    // Add JOINs if needed
    if (columnNames.includes('city_key') && hasCityColumn) {
      searchQueryText += `\nLEFT JOIN dim_city c ON p.city_key = c.city_key`;
    }
    
    if (hasStateColumn && columnNames.includes('state_key')) {
      searchQueryText += `\nLEFT JOIN dim_state s ON p.state_key = s.state_key`;
    } else if (hasCityColumn && columnNames.includes('city_key')) {
      // Join state through city
      searchQueryText += `\nLEFT JOIN dim_state s ON c.state_key = s.state_key`;
    }
    
    if (typeColumn === 'hotel_type_key') {
      searchQueryText += `\nLEFT JOIN dim_hotel_type h ON p.hotel_type_key = h.hotel_type_key`;
    }
    
    // WHERE clause - search by property name
    searchQueryText += `\nWHERE p.${nameColumn} ILIKE $1`;
    
    // LIMIT clause
    searchQueryText += `\nLIMIT 10`;
    
    console.log('Final search query:', searchQueryText);
    
    // Execute the search query
    const searchResults = await query(searchQueryText, [`%${searchQuery}%`]);
    
    console.log('Search returned', searchResults.rows.length, 'results');
    
    return res.status(200).json({ properties: searchResults.rows });
  } catch (error) {
    console.error('Error searching properties:', error);
    return res.status(500).json({ 
      error: 'Failed to search properties',
      details: error.message 
    });
  }
}