// Script to update deal display data for existing deals
const { pool } = require('../lib/db.cjs');

async function updateDealDisplayData() {
  console.log('Starting deal display data update...');
  const client = await pool.connect();
  
  try {
    console.log('Connected to database!');
    await client.query('BEGIN');
    
    // Get all deals
    const dealsResult = await client.query('SELECT deal_id, deal_name FROM deals');
    const deals = dealsResult.rows;
    
    console.log(`Found ${deals.length} deals to update`);
    
    // Define property types based on deal names
    const propertyTypes = {
      'marriott': 'Luxury',
      'westin': 'Full Service',
      'fairfield': 'Limited Service',
      'holiday inn': 'Limited Service',
      'hilton': 'Full Service',
      'hyatt': 'Luxury',
      'aloft': 'Boutique',
      'moxy': 'Lifestyle',
      'sheraton': 'Full Service'
    };
    
    // Update each deal with location and property type information
    const cities = ['San Francisco', 'Miami', 'Las Vegas', 'New York', 'Chicago', 'Seattle', 'Los Angeles', 'Atlanta', 'Dallas', 'Denver'];
    const states = ['CA', 'FL', 'NV', 'NY', 'IL', 'WA', 'CA', 'GA', 'TX', 'CO'];
    
    for (let i = 0; i < deals.length; i++) {
      const deal = deals[i];
      const dealName = deal.deal_name.toLowerCase();
      
      // Find matching property type
      let propertyType = 'Standard';
      for (const [key, value] of Object.entries(propertyTypes)) {
        if (dealName.includes(key.toLowerCase())) {
          propertyType = value;
          break;
        }
      }
      
      // Assign random location and room count if not set
      const cityIndex = i % cities.length;
      const roomCount = 100 + (i * 10);
      
      await client.query(`
        UPDATE deals
        SET city = COALESCE(city, $1),
            state = COALESCE(state, $2),
            property_type = COALESCE(property_type, $3),
            number_of_rooms = COALESCE(number_of_rooms, $4)
        WHERE deal_id = $5
      `, [
        cities[cityIndex],
        states[cityIndex],
        propertyType,
        roomCount,
        deal.deal_id
      ]);
      
      console.log(`Updated deal ${deal.deal_id}: ${deal.deal_name}`);
    }
    
    await client.query('COMMIT');
    console.log('Deal display data update completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during deal display data update:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateDealDisplayData().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
