import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Info, ChevronRight } from 'lucide-react';

const AIInsightsComponent = () => {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Call to the API endpoint that interfaces with database functions
        // such as find_market_investment_opportunities or analyze_market_dynamics
        const response = await fetch('/api/analytics/insights');
        
        if (!response.ok) {
          throw new Error('Failed to fetch investment insights');
        }
        
        const data = await response.json();
        setInsights(data);
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError('Failed to load AI insights. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInsights();
  }, []);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'opportunity':
        return <Info className="h-5 w-5 text-secondary" />;
      case 'roi':
        return <TrendingUp className="h-5 w-5 text-primary" />;
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-secondary" />;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-neutral-200">
        <h3 className="text-lg font-medium leading-6 text-neutral-900">
          AI Investment Insights
        </h3>
      </div>
      <div className="px-6 py-5">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-neutral-200 rounded"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="bg-neutral-50 hover:bg-neutral-100 transition-colors rounded-md p-4 cursor-pointer">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-neutral-900">{insight.title}</h4>
                      {insight.confidence && (
                        <span className="text-xs text-neutral-500">
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">
                      {insight.description}
                    </p>
                  </div>
                  <div className="ml-2">
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </div>
                </div>
              </div>
            ))}
            {insights.length > 0 && (
              <div className="mt-2 text-right">
                <a href="/insights" className="text-sm font-medium text-secondary hover:text-secondary-light">
                  View all insights
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsComponent;