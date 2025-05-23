import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AuthGuard from '../components/AuthGuard';

const TestDealSubmissionPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dealCreated, setDealCreated] = useState(false);
  const [dealId, setDealId] = useState(null);
  const [tabResults, setTabResults] = useState([]);
  const [testComplete, setTestComplete] = useState(false);
  
  // Test data for creating a deal
  const testDeal = {
    deal_name: 'Test Deal Submission',
    property_name: 'Test Hotel Property',
    property_address: '123 Test Street',
    city: 'Test City',
    state: 'NY',
    number_of_rooms: 150,
    property_type: 'Luxury',
    investment_amount: 1500000,
    expected_return: 8.2,
    hold_period: 5,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
    status: 'Draft'
  };

  // Test data for each assumption tab
  const tabsData = {
    acquisition: {
      acquisition_month: 6,
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
    
    // Other tabs data would be defined here...
  };
  
  // Map from frontend tab names to API endpoint names
  const tabApiMap = {
    'property': 'property',
    'acquisition': 'acquisition',
    'financing': 'financing',
    'disposition': 'disposition',
    'capital': 'capital-expense',
    'inflation': 'inflation',
    'penetration': 'penetration',
    'operating-revenue': 'revenue',
    'departmental-expenses': 'dept-expense',
    'management-franchise': 'mgmt-fee',
    'undistributed-expenses-1': 'undist1',
    'undistributed-expenses-2': 'undist2',
    'non-operating-expenses': 'nonop-expense',
    'ffe-reserve': 'ffe'
  };
  
  // Function to create a test deal
  const createTestDeal = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testDeal)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create test deal');
      }
      
      setDealCreated(true);
      setDealId(data.deal_id || data.id);
      return data;
    } catch (err) {
      setError(`Error creating deal: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to test a single tab's submission
  const testTabSubmission = async (tabName, apiEndpoint, tabData) => {
    try {
      // Add the deal ID to the tab data
      const dataToSubmit = {
        deal_id: dealId,
        ...tabData
      };
      
      const response = await fetch(`/api/deals/assumptions/${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Unknown error');
      }
      
      return {
        tabName,
        success: true,
        message: `Successfully saved ${tabName} data`,
        data
      };
    } catch (err) {
      return {
        tabName,
        success: false,
        error: err.message,
        message: `Failed to save ${tabName} data: ${err.message}`
      };
    }
  };
  
  // Function to run the full test
  const runFullTest = async () => {
    setLoading(true);
    setTabResults([]);
    setTestComplete(false);
    
    // First create a test deal if needed
    if (!dealCreated) {
      const deal = await createTestDeal();
      if (!deal) {
        setLoading(false);
        return;
      }
    }
    
    // Test each tab submission
    const results = [];
    
    // Add each tab test here
    // We'll just test acquisition and financing for this example
    const tabsToTest = ['acquisition', 'financing'];
    
    for (const tab of tabsToTest) {
      const apiEndpoint = tab; // In this simplified example they match
      const tabData = tabsData[tab];
      
      const result = await testTabSubmission(tab, apiEndpoint, tabData);
      results.push(result);
      
      // Add each result as it completes
      setTabResults(prev => [...prev, result]);
      
      // Small delay between submissions
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setTestComplete(true);
    setLoading(false);
  };
  
  // Navigate to deal details
  const viewDeal = () => {
    if (dealId) {
      router.push(`/deals/${dealId}`);
    }
  };
  
  const allTabsSuccessful = tabResults.every(tab => tab.success);

  return (
    <AuthGuard>
      <div>
        <Head>
          <title>Test Deal Submission | InnVestAI</title>
        </Head>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-8">Test Deal Assumption Submission</h1>
          
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-medium mb-4">Deal Creation</h2>
            
            {!dealCreated ? (
              <button
                onClick={createTestDeal}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Creating Deal...' : 'Create Test Deal'}
              </button>
            ) : (
              <div className="flex items-center text-green-500">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Deal created successfully! Deal ID: {dealId}</span>
              </div>
            )}
            
            {error && (
              <div className="mt-4 text-red-500">
                {error}
              </div>
            )}
          </div>
          
          {dealCreated && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-medium mb-4">Test Tab Submissions</h2>
              
              <div className="mb-6">
                <button
                  onClick={runFullTest}
                  disabled={loading || !dealId}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Testing...' : 'Run Full Test'}
                </button>
                
                {dealId && (
                  <button
                    onClick={viewDeal}
                    className="px-4 py-2 ml-4 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    View Deal Details
                  </button>
                )}
              </div>
              
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              )}
              
              {tabResults.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h3 className="font-medium">Results:</h3>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tab</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {tabResults.map((result, index) => (
                          <tr key={index} className={result.success ? 'bg-green-50' : 'bg-red-50'}>
                            <td className="px-4 py-3 text-sm font-medium">{result.tabName}</td>
                            <td className="px-4 py-3">
                              {result.success ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Success
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Failed
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">{result.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {testComplete && (
                    <div className={`p-4 rounded-lg ${allTabsSuccessful ? 'bg-green-50' : 'bg-yellow-50'}`}>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          {allTabsSuccessful ? (
                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            {allTabsSuccessful 
                              ? 'All tabs were submitted successfully!' 
                              : 'Some tabs failed. Check the results table for details.'}
                          </h3>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-medium mb-4">Instructions</h2>
            <div className="prose">
              <p>This page allows you to test the deal assumption form submission process:</p>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Click "Create Test Deal" to create a new test deal</li>
                <li>Click "Run Full Test" to test submission of each assumption tab</li>
                <li>The results table will show whether each tab was submitted successfully</li>
                <li>Click "View Deal Details" to navigate to the created deal</li>
              </ol>
              <p className="mt-4">
                You can also run tests in your browser console by using the script at:<br />
                <code className="bg-gray-100 px-2 py-1 rounded">scripts/browser-test-deal-submission.js</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default TestDealSubmissionPage;
