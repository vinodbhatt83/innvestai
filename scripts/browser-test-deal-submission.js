/**
 * Browser Test Script for Deal Assumption Submission
 * 
 * This script can be pasted into the browser console when on the deal creation page
 * to test submission of each assumption tab.
 * 
 * Instructions:
 * 1. Navigate to the deal creation page
 * 2. Open the browser console (F12 or right-click > Inspect > Console)
 * 3. Paste this entire script and press Enter
 * 4. Call testDealSubmissions() to run the test
 */

async function testDealSubmissions() {
  // This function simulates form submission for each tab
  
  // First check if we're on the deal creation page
  if (!window.location.pathname.includes('/deals/create')) {
    console.error('Please navigate to the deal creation page first (/deals/create)');
    return;
  }
  
  // These are DOM elements we expect to find on the page
  const requiredElements = ['setActiveStep', 'formData', 'createdDealId', 'saveCurrentTab'];
  
  // Check for the component or required variables
  const missingElements = requiredElements.filter(el => 
    typeof window[el] === 'undefined' && 
    typeof this[el] === 'undefined'
  );
  
  if (missingElements.length > 0) {
    console.error(`Test cannot run. Missing required elements: ${missingElements.join(', ')}`);
    console.log('Please make sure you are on the deal creation page with the form component fully loaded');
    return;
  }
  
  // Define test results object
  const testResults = {
    successes: [],
    failures: []
  };
  
  // Log in color
  const logSuccess = message => console.log(`%c✅ ${message}`, 'color: green; font-weight: bold');
  const logError = message => console.log(`%c❌ ${message}`, 'color: red; font-weight: bold');
  const logInfo = message => console.log(`%c📝 ${message}`, 'color: blue; font-weight: bold');
  
  // Test function for a single tab
  async function testTab(tabName, tabDisplayName) {
    try {
      logInfo(`Testing submission of ${tabDisplayName || tabName} tab...`);
      
      // Access the component's functions to simulate a user interaction
      // Note: This test is designed to work with the current deal creation form structure
      
      // Get the current deal ID
      const dealId = window.createdDealId;
      if (!dealId) {
        throw new Error('No deal ID found. Please create a deal first');
      }
      
      // Get the current form data
      const currentFormData = window.formData || {};
      
      // Set the active step to the tab being tested
      window.setActiveStep(tabName);
      
      // Wait a moment for the tab to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to save the tab
      const result = await window.saveCurrentTab();
      
      if (result === true) {
        logSuccess(`${tabDisplayName || tabName} tab data saved successfully`);
        testResults.successes.push(tabName);
      } else {
        throw new Error(`Failed to save ${tabName} tab`);
      }
      
      return true;
    } catch (error) {
      logError(`Error saving ${tabDisplayName || tabName} tab: ${error.message}`);
      testResults.failures.push({
        tab: tabName,
        error: error.message
      });
      return false;
    }
  }
  
  // Testing sequence - test each tab in order
  const tabs = [
    { name: 'property', displayName: 'Property Details' },
    { name: 'acquisition', displayName: 'Acquisition' },
    { name: 'financing', displayName: 'Financing' },
    { name: 'disposition', displayName: 'Disposition' },
    { name: 'capital', displayName: 'Capital Expenses' },
    { name: 'inflation', displayName: 'Inflation' },
    { name: 'penetration', displayName: 'Penetration Analysis' },
    { name: 'operating-revenue', displayName: 'Operating Revenue' },
    { name: 'departmental-expenses', displayName: 'Departmental Expenses' },
    { name: 'management-franchise', displayName: 'Management & Franchise' },
    { name: 'undistributed-expenses-1', displayName: 'Undistributed Expenses 1' },
    { name: 'undistributed-expenses-2', displayName: 'Undistributed Expenses 2' },
    { name: 'non-operating-expenses', displayName: 'Non-Operating Expenses' },
    { name: 'ffe-reserve', displayName: 'FFE Reserve' }
  ];
  
  // Start the sequence
  logInfo('Starting deal submission tests...');
  
  for (const tab of tabs) {
    await testTab(tab.name, tab.displayName);
    
    // Add a small delay between tab tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary of test results
  console.log('\n--------- TEST SUMMARY ---------');
  logInfo(`Total tabs tested: ${tabs.length}`);
  logSuccess(`Successful submissions: ${testResults.successes.length}`);
  logError(`Failed submissions: ${testResults.failures.length}`);
  
  if (testResults.failures.length > 0) {
    console.log('\nFailed tabs:');
    testResults.failures.forEach(failure => {
      logError(`${failure.tab}: ${failure.error}`);
    });
    
    console.log('\nPossible solutions:');
    console.log('1. Check that all required fields have values (use prepareTabDataForSubmission function)');
    console.log('2. Check network requests in browser DevTools for detailed error responses');
    console.log('3. Verify your database schema matches the expected field names');
    console.log('4. Check the API endpoint implementations for proper error handling');
  } else {
    logSuccess('All tabs were saved successfully! 🎉');
  }
  
  return testResults;
}

// Create a global function so it can be called from console
window.testDealSubmissions = testDealSubmissions;
console.log('%cDeal submission test script loaded. Call testDealSubmissions() to run the test', 'color: green; font-weight: bold');
