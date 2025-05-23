// pages/deals/[id]New.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import MarketTrendsChart from '../../components/analytics/MarketTrendsChart';
import PerformanceMetricsChart from '../../components/analytics/PerformanceMetricsChart';
import { Loader2, FileEdit, Share2, AlertCircle } from 'lucide-react'; // Added AlertCircle for error

const DealDetailsPageNew = () => {
  const router = useRouter();
  const { id } = router.query;
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchDealDetails = async () => {
      setLoading(true); // Ensure loading is true at start of fetch
      setError(null); // Clear previous errors
      try {
        const response = await fetch(`/api/deals/${id}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch deal details' }));
          throw new Error(errorData.message || 'Failed to fetch deal details');
        }
        const data = await response.json();
        setDeal(data);
      } catch (error) {
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
    }).format(value || 0); // Default to 0 if value is null/undefined
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatPercentage = (value, defaultValue = 0, decimals = 2) => { // Default to 0
    let numValue = parseFloat(value);
    if (isNaN(numValue)) {
      numValue = defaultValue;
    }
    return numValue.toFixed(decimals);
  };

  if (loading) {
    return (
      <Layout title="Loading Deal...">
        <div className="flex justify-center items-center py-20"> {/* Increased padding */}
          <Loader2 className="animate-spin h-12 w-12 text-secondary" /> {/* Larger spinner */}
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error">
        <div className="max-w-md mx-auto mt-10 bg-red-50 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-red-700">Error Loading Deal</h2>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!deal) {
    // This case might occur if loading finishes but deal is still null (e.g. API returns success but empty)
    return (
      <Layout title="Deal Not Found">
        <div className="max-w-md mx-auto mt-10 bg-yellow-50 p-6 rounded-lg shadow-md">
           <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-700">Deal Not Found</h2>
              <p className="text-yellow-600 mt-1">The requested deal could not be found.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={deal.deal_name || 'Deal Details'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-200"> {/* Added bottom border */}
          <div>
            <h1 className="text-3xl font-bold text-neutral-800">{deal.deal_name || 'Deal Details'}</h1> {/* Darker, larger title */}
            <div className="flex items-center text-sm text-neutral-500 mt-2">
              <span className="mr-3">{formatDate(deal.start_date)} - {formatDate(deal.end_date)}</span>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${deal.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-700'}`}>
                {deal.status || 'Draft'}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.push(`/deals/${id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
          >
            <FileEdit className="h-4 w-4 mr-2" />
            Edit Deal
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6"> {/* Added space-y-6 for consistent spacing */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-neutral-700 mb-4">Deal Details</h2>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-neutral-500">Description</h3>
                <p className="text-neutral-800 mt-1">{deal.description || 'No description provided.'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"> {/* Adjusted grid for better spacing */}
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Investment Amount</h3>
                  <p className="text-lg text-neutral-800 font-semibold">{formatCurrency(deal.investment_amount)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Expected Return (IRR)</h3>
                  <p className="text-lg text-neutral-800 font-semibold">{formatPercentage(deal.expected_return, 0, 1)}%</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Brand</h3>
                  <p className="text-neutral-800">{deal.brand_name || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Chain Scale</h3>
                  <p className="text-neutral-800">{deal.chain_scale_name || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Market</h3>
                  <p className="text-neutral-800">{deal.market_name || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Region</h3>
                  <p className="text-neutral-800">{deal.region_name || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-neutral-700 mb-4">Market Trends Analysis</h2>
              {deal.market_trends && deal.market_trends.length > 0 ? (
                <div className="h-80"><MarketTrendsChart data={deal.market_trends} /></div>
              ) : (
                <p className="text-neutral-500">Market trends data for {deal.market_name || 'this market'} is currently unavailable.</p>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-neutral-700 mb-4">Market Comparison</h2>
              {deal.market_comparison && deal.market_comparison.length > 0 ? (
                <div className="h-80"><PerformanceMetricsChart data={deal.market_comparison} /></div>
              ) : (
                <p className="text-neutral-500">Market comparison data for {deal.market_name || 'this market'} is currently unavailable.</p>
              )}
            </div>
          </div>

          <div className="space-y-6"> {/* Added space-y-6 for consistent spacing */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-neutral-700 mb-4">Property Information</h2>
              <div className="bg-neutral-100 h-48 w-full rounded-md flex items-center justify-center mb-4">
                <span className="text-neutral-400">Property Image Placeholder</span>
              </div>
              <h3 className="text-sm font-medium text-neutral-500">Property Name</h3>
              <p className="text-neutral-800 mb-3">{deal.property_name || 'N/A'}</p>
              <h3 className="text-sm font-medium text-neutral-500">Location</h3>
              <p className="text-neutral-800 mb-3">
                {[deal.property_address, deal.city_name, deal.state_name].filter(Boolean).join(', ') || 'N/A'}
              </p>
              <h3 className="text-sm font-medium text-neutral-500">Hotel Type</h3>
              <p className="text-neutral-800">{deal.hotel_type_name || 'N/A'}</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-neutral-700 mb-4">Key Performance Metrics</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'RevPAR', value: deal.performance_metrics?.revpar, defaultValue: 0, prefix: '$', suffix: '' },
                  { label: 'Occupancy', value: deal.performance_metrics?.occupancy ? deal.performance_metrics.occupancy * 100 : null, defaultValue: 0, prefix: '', suffix: '%', decimals: 1 },
                  { label: 'ADR', value: deal.performance_metrics?.adr, defaultValue: 0, prefix: '$', suffix: '' },
                  { label: 'Cap Rate', value: deal.performance_metrics?.cap_rate ? deal.performance_metrics.cap_rate * 100 : null, defaultValue: 0, prefix: '', suffix: '%', decimals: 1 }
                ].map(metric => (
                  <div key={metric.label} className="bg-neutral-50 p-3 rounded-md shadow-sm"> {/* Added shadow-sm */}
                    <h3 className="text-xs font-medium text-neutral-500 mb-1">{metric.label}</h3>
                    <p className="text-xl font-bold text-secondary"> {/* Changed to text-secondary for emphasis */}
                      {metric.prefix}{formatPercentage(metric.value, metric.defaultValue, metric.decimals || 2)}{metric.suffix}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-neutral-700 mb-4">Actions</h2>
              <div className="space-y-3">
                <button className="w-full inline-flex items-center justify-center py-2 px-4 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Deal
                </button>
                {/* Add other actions like "Download PDF", "Delete Deal" here if needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DealDetailsPageNew;
