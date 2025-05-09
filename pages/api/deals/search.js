// pages/api/deals/search.js
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { q } = req.query;
    console.log('Search query received:', q);

    if (!q || q.length < 2) {
      console.log('Search query too short, returning empty array');
      return res.status(200).json([]);
    }

    // First, let's get information about the dim_property table
    const tableQuery = `
      SELECT
        column_name
      FROM
        information_schema.columns
      WHERE
        table_name = 'dim_property';
    `;
    
    const tableResult = await query(tableQuery);
    const columnNames = tableResult.rows.map(row => row.column_name);
    console.log('Property table columns:', columnNames);
    
    // Determine the ID column name
    let propertyIdColumn = 'property_key'; // Default to property_key based on error message
    
    // Check if we have the expected ID column
    if (columnNames.includes('property_key')) {
      propertyIdColumn = 'property_key';
    } else if (columnNames.includes('property_id')) {
      propertyIdColumn = 'property_id';
    } else if (columnNames.includes('id')) {
      propertyIdColumn = 'id';
    } else {
      // Look for any column with 'id' or 'key' in the name
      const idColumn = columnNames.find(col => 
        col.includes('id') || col.includes('key')
      );
      
      if (idColumn) {
        propertyIdColumn = idColumn;
      }
    }
    
    console.log('Using property ID column:', propertyIdColumn);
    
    // Determine the name column
    let nameColumn = 'property_name';
    
    if (!columnNames.includes('property_name')) {
      // Look for any column with 'name' in it
      const possibleNameColumn = columnNames.find(col => col.includes('name'));
      
      if (possibleNameColumn) {
        nameColumn = possibleNameColumn;
      } else {
        // Use the second column as a fallback if no name column is found
        nameColumn = columnNames[1] || columnNames[0];
      }
    }
    
    console.log('Using property name column:', nameColumn);
    
    // Build a simple search query
    const searchQuery = `
      SELECT
        ${propertyIdColumn} as property_id,
        ${nameColumn} as property_name
      FROM
        dim_property
      WHERE
        ${nameColumn} ILIKE $1
      ORDER BY
        ${nameColumn}
      LIMIT 10
    `;
    
    console.log('Search query:', searchQuery);
    
    const result = await query(searchQuery, [`%${q}%`]);
    console.log('Search results:', result.rows);
    
    res.status(200).json(result.rows);
    
  } catch (error) {
    console.error('Error searching for properties:', error);
    // Return empty results on error to prevent UI breaks
    res.status(200).json([]);
  }
}