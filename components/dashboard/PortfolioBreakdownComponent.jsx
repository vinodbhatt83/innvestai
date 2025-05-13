import React, { useState, useEffect } from 'react';

const PortfolioBreakdownComponent = () => {
  const [breakdownData, setBreakdownData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('market'); // 'market', 'type', 'brand' or 'region'

  useEffect(() => {
    const fetchPortfolioBreakdown = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Calling the appropriate stored procedure via the API
        // The API endpoints would connect to stored procedures like:
        // - get_portfolio_by_market
        // - get_portfolio_by_region
        // - get_portfolio_by_brand
        // - get_portfolio_by_hotel_type
        const response = await fetch(`/api/analytics/portfolio-breakdown?view=${view}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio breakdown data');
        }
        
        const data = await response.json();
        setBreakdownData(data);
      } catch (err) {
        console.error('Error fetching portfolio breakdown:', err);
        setError('Failed to load portfolio breakdown data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPortfolioBreakdown();
  }, [view]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-neutral-200">
        <h3 className="text-lg font-medium leading-6 text-neutral-900">Portfolio Breakdown</h3>
      </div>
      <div className="px-6 py-5">
        <div className="mb-4">
          <div className="flex space-x-2 text-sm">
            <button
              onClick={() => setView('market')}
              className={`px-3 py-1 rounded-full font-medium ${
                view === 'market' 
                  ? 'bg-secondary text-white' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              By Market
            </button>
            <button
              onClick={() => setView('type')}
              className={`px-3 py-1 rounded-full font-medium ${
                view === 'type' 
                  ? 'bg-secondary text-white' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              By Type
            </button>
            <button
              onClick={() => setView('brand')}
              className={`px-3 py-1 rounded-full font-medium ${
                view === 'brand' 
                  ? 'bg-secondary text-white' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              By Brand
            </button>
            <button
              onClick={() => setView('region')}
              className={`px-3 py-1 rounded-full font-medium ${
                view === 'region' 
                  ? 'bg-secondary text-white' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              By Region
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-neutral-200 rounded"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-neutral-500">{error}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {breakdownData.map((item, index) => (
                <div key={index} className="bg-neutral-50 p-3 rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-neutral-500">{item.name}</span>
                    <span className="text-xs font-medium text-neutral-500">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-1.5">
                    <div 
                      className="h-1.5 bg-secondary rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-neutral-500">{formatCurrency(item.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioBreakdownComponent;