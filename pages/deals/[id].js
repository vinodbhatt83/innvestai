// pages/deals/[id].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { dealApi, analyticsApi } from '../../lib/api';

const DealDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [deal, setDeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketTrends, setMarketTrends] = useState(null);
  const [marketComparison, setMarketComparison] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  const fetchDeal = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const dealData = await dealApi.getDealById(id);
      setDeal(dealData);
    } catch (err) {
      console.error('Error fetching deal:', err);
      setError('Failed to load deal details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchAnalytics = async () => {
    if (!deal) return;
    
    setIsLoadingAnalytics(true);
    try {
      const [trendsResult, comparisonResult] = await Promise.all([
        analyticsApi.getMarketTrends(deal.market_name, 2020, 2024),
        analyticsApi.getMarketComparison(2024, 3)
      ]);
      
      setMarketTrends(trendsResult);
      setMarketComparison(comparisonResult);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchDeal();
  }, [id]);
  
  useEffect(() => {
    if (deal) {
      fetchAnalytics();
    }
  }, [deal]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const getStatusColor = (status) => {
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

  if (isLoading) {
    return (
      <Layout title="Deal Details">
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-10 w-10 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Deal Details">
        <div className="rounded-md bg-red-50 p-4 mt-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
              <div className="mt-2 text-sm text-red-700">
                <button 
                  onClick={() => router.back()} 
                  className="text-red-800 underline"
                >
                  Go back
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={deal.deal_name}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
              {deal.deal_name}
            </h2>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-8">
              <div className="mt-2 flex items-center text-sm text-neutral-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {deal.property_name} - {deal.city_name}, {deal.state_name}
              </div>
              <div className="mt-2 flex items-center text-sm text-neutral-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a1 1 0 011-1h8a1 1 0 011 1zM9 5v4h2V5H9z" clipRule="evenodd" />
                </svg>
                {deal.hotel_type_name}
              </div>
              <div className="mt-2 flex items-center text-sm text-neutral-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {formatDate(deal.start_date)} - {formatDate(deal.end_date)}
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                  {deal.status}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-5 flex lg:mt-0 lg:ml-4">
            <Link href={`/deals/${id}/edit`}>
              <span className="ml-3 inline-flex items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary cursor-pointer">
                <svg className="-ml-1 mr-2 h-5 w-5 text-neutral-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit
              </span>
            </Link>
            <Link href="/deals">
              <span className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary cursor-pointer">
                Back to Deals
              </span>
            </Link>
          </div>
        </div>

        {/* Deal Details */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">Deal Details</h3>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-neutral-500">Description</dt>
                    <dd className="mt-1 text-sm text-neutral-900">
                      {deal.deal_description || 'No description provided.'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Investment Amount</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{formatCurrency(deal.investment_amount)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Expected Return</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{deal.expected_return}%</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Brand</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{deal.brand_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Chain Scale</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{deal.chain_scale_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Market</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{deal.market_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Region</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{deal.region_name}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Market Trends */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">Market Trends Analysis</h3>
              </div>
              <div className="px-6 py-5">
                {isLoadingAnalytics ? (
                  <div className="flex justify-center items-center h-64">
                    <svg className="animate-spin h-8 w-8 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-neutral-500">
                      {marketTrends ? (
                        `Market trends data is available for ${deal.market_name} from 2020 to 2024.`
                      ) : (
                        'No market trends data available for this property.'
                      )}
                    </p>
                    <div className="mt-4">
                      {/* This would be a chart component in a real application */}
                      <div className="bg-neutral-50 p-4 rounded-md h-64 flex items-center justify-center">
                        <p className="text-neutral-500">Market Trends Chart</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Market Comparison */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">Market Comparison</h3>
              </div>
              <div className="px-6 py-5">
                {isLoadingAnalytics ? (
                  <div className="flex justify-center items-center h-64">
                    <svg className="animate-spin h-8 w-8 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-neutral-500">
                      {marketComparison ? (
                        `Comparing ${deal.market_name} with 3 similar markets in 2024.`
                      ) : (
                        'No market comparison data available for this property.'
                      )}
                    </p>
                    <div className="mt-4">
                      {/* This would be a chart component in a real application */}
                      <div className="bg-neutral-50 p-4 rounded-md h-64 flex items-center justify-center">
                        <p className="text-neutral-500">Market Comparison Chart</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Property Info */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">Property Information</h3>
              </div>
              <div className="px-6 py-5">
                <div className="bg-neutral-100 h-48 rounded-md flex items-center justify-center mb-4">
                  <p className="text-neutral-500">Property Image</p>
                </div>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Property Name</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{deal.property_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Location</dt>
                    <dd className="mt-1 text-sm text-neutral-900">
                      {deal.city_name}, {deal.state_name}, {deal.country_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Hotel Type</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{deal.hotel_type_name}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">Key Performance Metrics</h3>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-2 gap-4">
                  <div className="col-span-1 bg-neutral-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <dt className="text-sm font-medium text-neutral-500 text-center mb-1">RevPAR</dt>
                    <dd className="text-xl font-semibold text-secondary">$125.75</dd>
                  </div>
                  <div className="col-span-1 bg-neutral-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <dt className="text-sm font-medium text-neutral-500 text-center mb-1">Occupancy</dt>
                    <dd className="text-xl font-semibold text-secondary">78.2%</dd>
                  </div>
                  <div className="col-span-1 bg-neutral-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <dt className="text-sm font-medium text-neutral-500 text-center mb-1">ADR</dt>
                    <dd className="text-xl font-semibold text-secondary">$160.80</dd>
                  </div>
                  <div className="col-span-1 bg-neutral-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <dt className="text-sm font-medium text-neutral-500 text-center mb-1">Cap Rate</dt>
                    <dd className="text-xl font-semibold text-secondary">6.8%</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">Actions</h3>
              </div>
              <div className="px-6 py-5">
                <div className="flex flex-col space-y-3">
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    View Full Analytics
                  </button>
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">
                    Generate Investment Report
                  </button>
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">
                    Share Deal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DealDetailsPage;