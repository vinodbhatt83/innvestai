import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const MarketPerformanceComponent = () => {
  const [marketData, setMarketData] = useState({
    topMarkets: [],
    industryMetrics: {
      averageRevPar: 0,
      averageOccupancy: 0,
      averageADR: 0,
      revParGrowth: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayMarketCount, setDisplayMarketCount] = useState(2); // Show only top 2 markets by default

  useEffect(() => {
    const fetchMarketData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // This endpoint already exists in your codebase (market-dashboard.js)
        const response = await fetch('/api/analytics/market-dashboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch market data');
        }
        
        const data = await response.json();
        setMarketData(data);
      } catch (err) {
        console.error('Error fetching market performance data:', err);
        setError('Failed to load market performance data.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMarketData();
  }, []);

  // Get displayed markets based on the display count
  const displayedMarkets = marketData.topMarkets.slice(0, displayMarketCount);

  return (
    <div className="bg-white shadow rounded-lg">
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
              <div className="flex justify-between mb-2">
                <h4 className="text-sm font-medium text-neutral-500">Top Performing Markets</h4>
                {marketData.topMarkets.length > displayMarketCount && (
                  <button 
                    onClick={() => setDisplayMarketCount(prev => prev === displayMarketCount ? marketData.topMarkets.length : displayMarketCount)}
                    className="text-xs font-medium text-secondary hover:text-secondary-light"
                  >
                    {displayMarketCount === marketData.topMarkets.length ? 'Show Less' : 'Show All'}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {displayedMarkets.map((market, index) => (
                  <div key={index} className="bg-neutral-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-neutral-900">{market.name}</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        +{market.growth.toFixed(1)}%
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
                  <p className="text-lg font-semibold text-neutral-900">${marketData.industryMetrics.averageRevPar.toFixed(2)}</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-neutral-500">ADR</p>
                  <p className="text-lg font-semibold text-neutral-900">${marketData.industryMetrics.averageADR.toFixed(2)}</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-neutral-500">Occupancy</p>
                  <p className="text-lg font-semibold text-neutral-900">{marketData.industryMetrics.averageOccupancy.toFixed(1)}%</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-neutral-500">RevPAR Growth</p>
                  <p className="text-lg font-semibold text-neutral-900">+{marketData.industryMetrics.revParGrowth.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPerformanceComponent;