// pages/indexNew.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import AIInsightsComponent from '../components/dashboard/AIInsightsComponent';
import MarketPerformanceComponent from '../components/dashboard/MarketPerformanceComponent';
import PortfolioBreakdownComponent from '../components/dashboard/PortfolioBreakdownComponent';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, PlusCircle, DollarSign, Briefcase, TrendingUp, Building, AlertCircle, LineChart, PieChart } from 'lucide-react'; // Added icons

// Force server-side rendering
export async function getServerSideProps() {
  return {
    props: {}
  };
}

const DashboardPageNew = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [recentDeals, setRecentDeals] = useState([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalInvestment: 0,
    activeDeals: 0,
    avgReturn: 0,
    properties: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Add console logs to debug the component rendering
  useEffect(() => {
    console.log("Dashboard component state:", { 
      isAuthenticated, 
      loading, 
      isLoading, 
      recentDealsCount: recentDeals.length 
    });
  });

  // Data fetching
  useEffect(() => {
    // Skip if not authenticated or still loading
    if (!isAuthenticated || loading) {
      return;
    }
    
    console.log("Starting data fetch...");
    
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Fetching deals data...");
        // Fetch recent deals
        const dealsResponse = await fetch('/api/deals?limit=4&offset=0&sortBy=created_at&order=DESC');
        console.log("Deals response:", dealsResponse.ok);
        
        if (!dealsResponse.ok) {
          throw new Error('Failed to fetch deals data');
        }
        
        const dealsData = await dealsResponse.json();
        console.log("Deals data received:", dealsData);

        // Format deals to match the expected structure for the dashboard
        const formattedDeals = dealsData.deals.map(deal => ({
          id: deal.id || deal.deal_id || 0,
          name: deal.deal_name || deal.name || 'Unnamed Deal',
          property: deal.property_name || 'Unknown Property',
          investment: parseFloat(deal.investment_amount) || 0,
          return: parseFloat(deal.expected_return) || 0,
          status: deal.status || 'Unknown'
        }));

        setRecentDeals(formattedDeals);
        console.log("Deals state updated with", formattedDeals.length, "deals");

        // Fetch portfolio statistics
        console.log("Fetching stats data...");
        const statsResponse = await fetch('/api/analytics/portfolio-stats');
        console.log("Stats response:", statsResponse.ok);
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log("Stats data received:", statsData);
          
          setPortfolioStats({
            totalInvestment: parseFloat(statsData.totalInvestment) || 0,
            activeDeals: parseInt(statsData.activeDeals) || 0,
            avgReturn: parseFloat(statsData.avgReturn) || 0,
            properties: parseInt(statsData.properties) || 0
          });
          console.log("Portfolio stats updated");
        } else {
          // If the API isn't implemented yet, calculate some basic stats from the deals
          console.log("Calculating stats from deals...");
          setPortfolioStats({
            totalInvestment: formattedDeals.reduce((sum, deal) => sum + deal.investment, 0),
            activeDeals: formattedDeals.filter(deal => deal.status === 'Active').length,
            avgReturn: formattedDeals.length > 0 
              ? formattedDeals.reduce((sum, deal) => sum + deal.return, 0) / formattedDeals.length 
              : 0,
            properties: formattedDeals.length
          });
          console.log("Calculated portfolio stats updated");
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
        console.log("Data fetch complete, loading set to false");
      }
    };
    
    fetchDashboardData();
  }, [isAuthenticated, loading]);

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

  // Show loading state while checking authentication
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
          <div className="flex justify-center">
            <Loader2 className="animate-spin h-10 w-10 text-secondary" />
          </div>
          <p className="text-center text-neutral-500 mt-4">Loading authentication...</p>
        </div>
      </div>
    );
  }

  console.log("Rendering dashboard content:", { isLoading, dealsCount: recentDeals.length });

  return (
    <Layout title="Dashboard">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6"> {/* Consistent padding */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
              Investment Dashboard
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              AI-powered analytics for hotel investment decisions
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link href="/deals/create">
              <span className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary cursor-pointer">
                <PlusCircle className="mr-2 h-5 w-5" /> Create New Deal
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
                  <DollarSign className="h-6 w-6 text-white" />
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
                          formatCurrency(portfolioStats.totalInvestment)
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
                  <Briefcase className="h-6 w-6 text-white" />
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
                          portfolioStats.activeDeals
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
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3"> {/* Keeping original color */}
                  <TrendingUp className="h-6 w-6 text-white" />
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
                          `${portfolioStats.avgReturn.toFixed(1)}%`
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
                <div className="flex-shrink-0 bg-amber-500 rounded-md p-3"> {/* Keeping original color */}
                  <Building className="h-6 w-6 text-white" />
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
                          portfolioStats.properties
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
          {/* Left Column: Recent Deals, Market Performance, and Portfolio Breakdown */}
          <div className="lg:col-span-2 space-y-8"> {/* Added space-y-8 */}
            {/* Recent Deals */}
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
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-200">
                    {recentDeals.length > 0 ? recentDeals.map((deal) => (
                      <div key={deal.id} className="py-4 flex items-center">
                        <div className="min-w-0 flex-1">
                          <Link href={`/deals/${deal.id}`}>
                            <span className="text-sm font-medium text-primary hover:text-secondary cursor-pointer"> {/* Updated hover */}
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
                            {deal.return.toFixed(1)}% Return
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="py-4 text-center">
                        <p className="text-sm text-neutral-500">No deals found. Create your first deal to get started.</p>
                        <Link href="/deals/create">
                          <span className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary cursor-pointer">
                            <PlusCircle className="mr-2 h-5 w-5" /> Create New Deal
                          </span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Market Performance */}
            <MarketPerformanceComponent />

            {/* Portfolio Breakdown */}
            <PortfolioBreakdownComponent />
          </div>

          {/* Right Column: AI Insights and Quick Actions */}
          <div className="space-y-8"> {/* Added space-y-8 */}
            {/* AI Insights */}
            <AIInsightsComponent />

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">Quick Actions</h3>
              </div>
              <div className="px-6 py-5">
                <div className="flex flex-col space-y-3">
                  <Link href="/deals/create">
                    <span className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary cursor-pointer">
                      <PlusCircle className="mr-2 h-5 w-5" /> Create New Deal
                    </span>
                  </Link>
                  <Link href="/analytics/market-trends">
                    <span className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary cursor-pointer">
                      <LineChart className="mr-2 h-5 w-5" /> Analyze Market Trends
                    </span>
                  </Link>
                  <Link href="/analytics/performance">
                    <span className="w-full inline-flex justify-center items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary cursor-pointer">
                      <PieChart className="mr-2 h-5 w-5" /> View Performance Reports
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPageNew;
