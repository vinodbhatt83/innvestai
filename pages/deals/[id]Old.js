// pages/deals/[id].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import MarketTrendsChart from '../../components/analytics/MarketTrendsChart';
import PerformanceMetricsChart from '../../components/analytics/PerformanceMetricsChart';

const DealDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchDealDetails = async () => {
      try {
        const response = await fetch(`/api/deals/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch deal details');
        }
        
        const data = await response.json();
        console.log('Deal details:', data);
        setDeal(data);
      } catch (error) {
        console.error('Error fetching deal details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDealDetails();
  }, [id]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Helper function to safely format percentages
  const formatPercentage = (value, defaultValue = 8.5, decimals = 2) => {
    let numValue;
    
    // Try to convert to number if it's a string
    if (value !== null && value !== undefined) {
      numValue = parseFloat(value);
      // Check if conversion resulted in a valid number
      if (isNaN(numValue)) {
        numValue = defaultValue;
      }
    } else {
      numValue = defaultValue;
    }
    
    return numValue.toFixed(decimals);
  };

  if (loading) {
    return (
      <Layout title="Deal Details">
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-10 w-10 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    );
  }

  if (error || !deal) {
    return (
      <Layout title="Error">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">Error loading deal details: {error || 'Deal not found'}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={deal.deal_name || 'Deal Details'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{deal.deal_name || 'Deal Details'}</h1>
            <div className="flex items-center text-sm text-neutral-500 mt-1">
              <span className="mr-2">{formatDate(deal.start_date)} - {formatDate(deal.end_date)}</span>
              <span className="px-2 py-1 text-xs rounded-full bg-neutral-100">{deal.status || 'Draft'}</span>
            </div>
          </div>
          <button
            onClick={() => router.push(`/deals/${id}/edit`)}
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-light"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deal Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Deal Details</h2>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-neutral-500">Description</h3>
                <p className="text-neutral-900">{deal.description || 'No description provided.'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Investment Amount</h3>
                  <p className="text-neutral-900">{formatCurrency(deal.investment_amount || 1000000)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Expected Return</h3>
                  <p className="text-neutral-900">{formatPercentage(deal.expected_return, 8.5)}%</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Brand</h3>
                  <p className="text-neutral-900">{deal.brand_name || '-'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Chain Scale</h3>
                  <p className="text-neutral-900">{deal.chain_scale_name || '-'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Market</h3>
                  <p className="text-neutral-900">{deal.market_name || '-'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Region</h3>
                  <p className="text-neutral-900">{deal.region_name || '-'}</p>
                </div>
              </div>
            </div>

            {/* Market Trends Analysis */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Market Trends Analysis</h2>
              
              {deal.market_trends && deal.market_trends.length > 0 ? (
                <div className="h-80">
                  <MarketTrendsChart data={deal.market_trends} />
                </div>
              ) : (
                <p className="text-neutral-500">Market trends data is available for {deal.market_name || 'this market'} from 2020 to 2024.</p>
              )}
            </div>

            {/* Market Comparison */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Market Comparison</h2>
              
              {deal.market_comparison && deal.market_comparison.length > 0 ? (
                <div className="h-80">
                  <PerformanceMetricsChart data={deal.market_comparison} />
                </div>
              ) : (
                <p className="text-neutral-500">Comparing {deal.market_name || 'this market'} with 3 similar markets in 2024.</p>
              )}
            </div>
          </div>

          {/* Property Information */}
          <div>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Property Information</h2>
              
              <div className="mb-4">
                <div className="bg-neutral-100 h-48 w-full rounded-md flex items-center justify-center mb-4">
                  <span className="text-neutral-400">Property Image</span>
                </div>
                
                <h3 className="text-sm font-medium text-neutral-500">Property Name</h3>
                <p className="text-neutral-900 mb-2">{deal.property_name || '-'}</p>
                
                <h3 className="text-sm font-medium text-neutral-500">Location</h3>
                <p className="text-neutral-900 mb-2">
                  {[
                    deal.property_address,
                    deal.city_name,
                    deal.state_name
                  ].filter(Boolean).join(', ') || '-'}
                </p>
                
                <h3 className="text-sm font-medium text-neutral-500">Hotel Type</h3>
                <p className="text-neutral-900">{deal.hotel_type_name || '-'}</p>
              </div>
            </div>

            {/* Key Performance Metrics */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Key Performance Metrics</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-4 rounded-md">
                  <h3 className="text-xs font-medium text-neutral-500 mb-1">RevPAR</h3>
                  <p className="text-xl font-bold text-neutral-900">${formatPercentage(deal.performance_metrics?.revpar, 125.75, 2)}</p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-md">
                  <h3 className="text-xs font-medium text-neutral-500 mb-1">Occupancy</h3>
                  <p className="text-xl font-bold text-neutral-900">{formatPercentage(
                    deal.performance_metrics?.occupancy ? deal.performance_metrics.occupancy * 100 : 78.2, 
                    78.2, 
                    1
                  )}%</p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-md">
                  <h3 className="text-xs font-medium text-neutral-500 mb-1">ADR</h3>
                  <p className="text-xl font-bold text-neutral-900">${formatPercentage(deal.performance_metrics?.adr, 160.80, 2)}</p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-md">
                  <h3 className="text-xs font-medium text-neutral-500 mb-1">Cap Rate</h3>
                  <p className="text-xl font-bold text-neutral-900">{formatPercentage(
                    deal.performance_metrics?.cap_rate ? deal.performance_metrics.cap_rate * 100 : 6.8, 
                    6.8, 
                    1
                  )}%</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              
              <div className="space-y-2">
                <button className="w-full py-2 px-4 border border-neutral-300 rounded-md hover:bg-neutral-50">
                  Share Deal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DealDetailsPage;