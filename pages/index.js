// pages/index.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { analyticsApi } from '../lib/api';

const DashboardPage = () => {
  const [recentDeals, setRecentDeals] = useState([]);
  const [marketOverview, setMarketOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real application, these would be API calls to fetch data
        // For this POC, we'll simulate the data
        
        // Simulated recent deals
        setRecentDeals([
          {
            id: 1,
            name: 'Downtown Marriott Acquisition',
            property: 'Marriott Downtown',
            investment: 25000000,
            return: 8.5,
            status: 'Active',
          },
          {
            id: 2,
            name: 'Hilton Resort Renovation',
            property: 'Hilton Resort & Spa',
            investment: 12000000,
            return: 9.2,
            status: 'Pending',
          },
          {
            id: 3,
            name: 'Hampton Inn Portfolio',
            property: 'Hampton Inn & Suites',
            investment: 18500000,
            return: 7.8,
            status: 'Active',
          },
          {
            id: 4,
            name: '1 Hotel Brooklyn Bridge Refinancing',
            property: '1 Hotel Brooklyn Bridge',
            investment: 30000000,
            return: 6.5,
            status: 'Draft',
          },
        ]);
        
        // Simulated market overview
        setMarketOverview({
          topMarkets: [
            { name: 'Miami', revpar: 195.75, growth: 12.5 },
            { name: 'New York', revpar: 210.50, growth: 8.2 },
            { name: 'San Francisco', revpar: 182.30, growth: 5.8 },
            { name: 'Las Vegas', revpar: 165.20, growth: 15.3 },
            { name: 'Orlando', revpar: 145.80, growth: 10.1 },
          ],
          industryMetrics: {
            averageRevPar: 125.50,
            averageOccupancy: 72.8,
            averageADR: 172.40,
            revParGrowth: 9.2,
          }
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'bg-neutral-100 text-neutral-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <Layout title="Dashboard">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
              Hotel Investment Dashboard
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              AI-powered analytics for hotel investment decisions
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link href="/deals/create">
              <span className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary cursor-pointer">
                Create New Deal
              </span>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-secondary-light rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">
                      Total Investment
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-neutral-900">
                        {isLoading ? (
                          <div className="animate-pulse h-6 w-24 bg-neutral-200 rounded"></div>
                        ) : (
                          formatCurrency(85500000)
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-light rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">
                      Active Deals
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-neutral-900">
                        {isLoading ? (
                          <div className="animate-pulse h-6 w-24 bg-neutral-200 rounded"></div>
                        ) : (
                          "12"
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">
                      Avg. Return
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-neutral-900">
                        {isLoading ? (
                          <div className="animate-pulse h-6 w-24 bg-neutral-200 rounded"></div>
                        ) : (
                          "8.2%"
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-amber-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">
                      Properties
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-neutral-900">
                        {isLoading ? (
                          <div className="animate-pulse h-6 w-24 bg-neutral-200 rounded"></div>
                        ) : (
                          "24"
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Recent Deals */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">
                  Recent Deals
                </h3>
                <Link href="/deals">
                  <span className="text-sm font-medium text-secondary hover:text-secondary-light cursor-pointer">
                    View All
                  </span>
                </Link>
              </div>
              <div className="px-6 py-5">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-neutral-200 rounded"></div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="bg-red-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-200">
                    {recentDeals.map((deal) => (
                      <div key={deal.id} className="py-4 flex items-center">
                        <div className="min-w-0 flex-1">
                          <Link href={`/deals/${deal.id}`}>
                            <span className="text-sm font-medium text-primary hover:text-primary-light cursor-pointer">
                              {deal.name}
                            </span>
                          </Link>
                          <p className="text-sm text-neutral-500">
                            {deal.property} • {formatCurrency(deal.investment)}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(deal.status)}`}>
                            {deal.status}
                          </span>
                          <span className="ml-4 text-sm font-medium text-neutral-900">
                            {deal.return}% Return
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Market Performance */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">
                  Market Performance
                </h3>
                <Link href="/analytics/market-trends">
                  <span className="text-sm font-medium text-secondary hover:text-secondary-light cursor-pointer">
                    View Details
                  </span>
                </Link>
              </div>
              <div className="px-6 py-5">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-60 bg-neutral-200 rounded"></div>
                  </div>
                ) : error ? (
                  <p className="text-sm text-neutral-500">Unable to load market performance data.</p>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 mb-2">Top Performing Markets</h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {marketOverview.topMarkets.map((market, index) => (
                          <div key={index} className="bg-neutral-50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-neutral-900">{market.name}</span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                +{market.growth}%
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-secondary">${market.revpar.toFixed(2)}</p>
                            <p className="text-xs text-neutral-500">RevPAR</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 mb-2">Industry Averages</h4>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="bg-neutral-50 rounded-lg p-3 text-center">
                          <p className="text-sm text-neutral-500">RevPAR</p>
                          <p className="text-lg font-semibold text-neutral-900">${marketOverview.industryMetrics.averageRevPar}</p>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-3 text-center">
                          <p className="text-sm text-neutral-500">ADR</p>
                          <p className="text-lg font-semibold text-neutral-900">${marketOverview.industryMetrics.averageADR}</p>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-3 text-center">
                          <p className="text-sm text-neutral-500">Occupancy</p>
                          <p className="text-lg font-semibold text-neutral-900">{marketOverview.industryMetrics.averageOccupancy}%</p>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-3 text-center">
                          <p className="text-sm text-neutral-500">RevPAR Growth</p>
                          <p className="text-lg font-semibold text-neutral-900">+{marketOverview.industryMetrics.revParGrowth}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* AI Insights */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">
                  AI Investment Insights
                </h3>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-4">
                  <div className="bg-neutral-50 rounded-md p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-secondary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-neutral-900">Miami market opportunity</h4>
                        <p className="mt-1 text-sm text-neutral-600">
                          Miami shows 12.5% RevPAR growth, significantly outperforming the industry average of 9.2%.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 rounded-md p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-neutral-900">Hilton Resort renovation ROI</h4>
                        <p className="mt-1 text-sm text-neutral-600">
                          The Hilton Resort renovation project is projected to yield a 9.2% return, above your portfolio average of 8.2%.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 rounded-md p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-neutral-900">Market risk alert</h4>
                        <p className="mt-1 text-sm text-neutral-600">
                          San Franciscos supply growth (4.2%) is outpacing demand growth (3.1%), which may impact returns in the near term.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">Quick Actions</h3>
              </div>
              <div className="px-6 py-5">
                <div className="flex flex-col space-y-3">
                  <Link href="/deals/create">
                    <span className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary cursor-pointer">
                      Create New Deal
                    </span>
                  </Link>
                  <Link href="/analytics/market-trends">
                    <span className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer">
                      Analyze Market Trends
                    </span>
                  </Link>
                  <Link href="/analytics/performance">
                    <span className="w-full inline-flex justify-center items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary cursor-pointer">
                      View Performance Reports
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Portfolio Breakdown */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">Portfolio Breakdown</h3>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-neutral-700">By Market</span>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-neutral-500">New York</span>
                        <span className="text-xs font-medium text-neutral-500">28%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-1.5">
                        <div className="h-1.5 bg-secondary rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                    <div className="mt-2 bg-neutral-50 p-3 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-neutral-500">Miami</span>
                        <span className="text-xs font-medium text-neutral-500">22%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-1.5">
                        <div className="h-1.5 bg-secondary rounded-full" style={{ width: '22%' }}></div>
                      </div>
                    </div>
                    <div className="mt-2 bg-neutral-50 p-3 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-neutral-500">Chicago</span>
                        <span className="text-xs font-medium text-neutral-500">18%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-1.5">
                        <div className="h-1.5 bg-secondary rounded-full" style={{ width: '18%' }}></div>
                      </div>
                    </div>
                    <div className="mt-2 bg-neutral-50 p-3 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-neutral-500">Other</span>
                        <span className="text-xs font-medium text-neutral-500">32%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-1.5">
                        <div className="h-1.5 bg-secondary rounded-full" style={{ width: '32%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;