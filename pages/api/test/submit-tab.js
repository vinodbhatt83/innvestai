// Test API endpoint for deal assumption submission

import { pool } from '../../lib/db';
import { saveDealAssumptionTab } from '../../utils/dealAssumptions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tabName, dealId, testData } = req.body;

  if (!tabName) {
    return res.status(400).json({ error: 'Tab name is required' });
  }

  if (!dealId) {
    return res.status(400).json({ error: 'Deal ID is required' });
  }

  try {
    // First check if the deal exists
    const client = await pool.connect();
    
    try {
      const dealCheck = await client.query(
        'SELECT * FROM deals WHERE deal_id = $1',
        [dealId]
      );
      
      if (dealCheck.rows.length === 0) {
        return res.status(404).json({ error: `Deal with ID ${dealId} not found` });
      }
      
      // Test data for each tab based on what the database requires
      const defaultTestData = {
        property: {
          property_name: 'Test Property',
          property_address: '123 Test St',
          city: 'Test City',
          state: 'NY',
          property_type: 'Luxury',
          number_of_rooms: 150,
          status: 'Draft'
        },
        acquisition: {
          acquisition_month: 5,
          acquisition_year: 2025,
          acquisition_costs: 125000,
          cap_rate_going_in: 8.5,
          hold_period: 5,
          purchase_price: 1500000,
          purchase_price_method: 'Per Room',
          purchase_price_per_key: 10000
        },
        financing: {
          loan_to_value: 65,
          interest_rate: 4.5,
          loan_term: 5,
          amortization_period: 30,
          debt_amount: 975000,
          equity_amount: 525000,
          lender_fee: 1.0,
          debt_coverage_ratio: 1.25
        },
        // Additional tab data would be defined here
      };
      
      // Use provided test data or default data
      const dataToSubmit = testData || defaultTestData[tabName];
      
      if (!dataToSubmit) {
        return res.status(400).json({ 
          error: `No test data available for tab: ${tabName}`,
          availableTabs: Object.keys(defaultTestData)
        });
      }
      
      // Attempt to save the tab data
      const result = await saveDealAssumptionTab(tabName, dealId, dataToSubmit);
      
      // Return success response
      return res.status(200).json({
        success: true,
        tabName,
        dealId,
        result,
        message: `Successfully saved ${tabName} tab data`
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error testing tab submission for ${tabName}:`, error);
    
    return res.status(500).json({
      error: `Failed to save ${tabName} tab data`,
      message: error.message,
      details: error.toString(),
      context: {
        tabName,
        dealId,
        timestamp: new Date().toISOString()
      }
    });
  }
}
