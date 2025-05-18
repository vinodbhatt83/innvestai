// components/deals/DealMetrics.jsx
import React, { useEffect, useState } from 'react';

const DealMetrics = ({ metrics, className = "", previousMetrics = null }) => {
  // State to track animation status for each metric
  const [animating, setAnimating] = useState({});
  
  // Trigger animations when metrics change
  useEffect(() => {
    if (!previousMetrics) return;
    
    const changedMetrics = {};
    Object.keys(metrics).forEach(key => {
      if (metrics[key] !== previousMetrics[key]) {
        changedMetrics[key] = true;
      }
    });
    
    if (Object.keys(changedMetrics).length > 0) {
      setAnimating(changedMetrics);
      
      // Reset animation flags after animation duration
      const timer = setTimeout(() => {
        setAnimating({});
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [metrics, previousMetrics]);
  
  // Helper function to determine the trend indicator class
  const getTrendClass = (value) => {
    if (value >= 10) return "text-green-500";
    if (value >= 8) return "text-blue-500";
    if (value >= 5) return "text-yellow-600";
    return "text-red-500";
  };
  
  // Helper function to determine if the value has changed
  const hasChanged = (key) => {
    if (!previousMetrics) return false;
    return metrics[key] !== previousMetrics[key];
  };
  
  // Helper function to determine arrow direction based on change
  const getChangeIndicator = (key) => {
    if (!previousMetrics) return null;
    
    const current = parseFloat(metrics[key]);
    const previous = parseFloat(previousMetrics[key]);
    
    if (current > previous) {
      return (
        <div className="ml-2 text-green-500 flex items-center text-xs font-semibold">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="ml-1">{((current - previous) / previous * 100).toFixed(1)}%</span>
        </div>
      );
    } else if (current < previous) {
      return (
        <div className="ml-2 text-red-500 flex items-center text-xs font-semibold">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="ml-1">{((previous - current) / previous * 100).toFixed(1)}%</span>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className={`mb-8 ${className}`}>
      <style jsx global>{`
        .metric-value {
          transition: all 0.5s ease-in-out;
        }
        .metric-value:hover {
          transform: scale(1.05);
        }
        @keyframes highlight {
          0% { background-color: rgba(255, 255, 0, 0.3); }
          100% { background-color: transparent; }
        }
        .value-changed {
          animation: highlight 1.5s ease-out;
        }
        .metric-card {
          transition: all 0.3s ease;
        }
        .metric-card.changed {
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
        }
      `}</style>
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 shadow-xl rounded-lg p-6 border-l-4 border-secondary">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-secondary flex items-center">
            Key Performance Metrics
            <span className="ml-3 text-xs bg-secondary text-white px-2 py-1 rounded-full">Real-time</span>
          </h3>
          <div className="flex gap-2 items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <div className="text-sm text-neutral-600 font-medium">Live Updates</div>
          </div>
        </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className={`metric-card bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200 shadow-sm transform transition-all hover:scale-105 hover:shadow-md ${hasChanged('irr') ? 'changed' : ''}`}>
            <div className="flex justify-between items-start">
              <p className="text-sm text-neutral-600 mb-2 font-medium">Internal Rate of Return</p>
              <div className="bg-blue-200 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">IRR</div>
            </div>
            <div className="flex items-baseline">
              <div className="flex items-center">
                <p className={`text-3xl font-bold ${getTrendClass(metrics.irr)} metric-value ${hasChanged('irr') ? 'value-changed' : ''}`}>{metrics.irr}%</p>
                {getChangeIndicator('irr')}
              </div>
              <span className="ml-2 text-xs bg-white px-2 py-1 rounded-md shadow-sm text-gray-600 border border-gray-100">target: 12%</span>
            </div>
          </div>
          
          <div className={`metric-card bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-200 shadow-sm transform transition-all hover:scale-105 hover:shadow-md ${hasChanged('capRate') ? 'changed' : ''}`}>
            <div className="flex justify-between items-start">
              <p className="text-sm text-neutral-600 mb-2 font-medium">Cap Rate</p>
              <div className="bg-green-200 text-green-700 text-xs px-2 py-1 rounded-full font-bold">CAP</div>
            </div>
            <div className="flex items-baseline">
              <div className="flex items-center">
                <p className={`text-3xl font-bold ${getTrendClass(metrics.capRate)} metric-value ${hasChanged('capRate') ? 'value-changed' : ''}`}>{metrics.capRate}%</p>
                {getChangeIndicator('capRate')}
              </div>
              <span className="ml-2 text-xs bg-white px-2 py-1 rounded-md shadow-sm text-gray-600 border border-gray-100">target: 8.5%</span>
            </div>
          </div>
          
          <div className={`metric-card bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-lg border border-yellow-200 shadow-sm transform transition-all hover:scale-105 hover:shadow-md ${hasChanged('cashOnCash') ? 'changed' : ''}`}>
            <div className="flex justify-between items-start">
              <p className="text-sm text-neutral-600 mb-2 font-medium">Cash on Cash</p>
              <div className="bg-amber-200 text-amber-800 text-xs px-2 py-1 rounded-full font-bold">CoC</div>
            </div>            <div className="flex items-baseline">
              <div className="flex items-center">
                <p className={`text-3xl font-bold ${getTrendClass(metrics.cashOnCash)} metric-value ${hasChanged('cashOnCash') ? 'value-changed' : ''}`}>{metrics.cashOnCash}%</p>
                {getChangeIndicator('cashOnCash')}
              </div>
              <span className="ml-2 text-xs bg-white px-2 py-1 rounded-md shadow-sm text-gray-600 border border-gray-100">target: 9%</span>
            </div>
          </div>
          
          <div className={`metric-card bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border border-purple-200 shadow-sm transform transition-all hover:scale-105 hover:shadow-md ${hasChanged('adr') ? 'changed' : ''}`}>
            <div className="flex justify-between items-start">
              <p className="text-sm text-neutral-600 mb-2 font-medium">Average Daily Rate</p>
              <div className="bg-purple-200 text-purple-700 text-xs px-2 py-1 rounded-full font-bold">ADR</div>
            </div>
            <div className="flex items-baseline">
              <div className="flex items-center">
                <p className={`text-3xl font-bold text-primary metric-value ${hasChanged('adr') ? 'value-changed' : ''}`}>${metrics.adr}</p>
                {getChangeIndicator('adr')}
              </div>
              <span className="ml-2 text-xs bg-white px-2 py-1 rounded-md shadow-sm text-gray-600 border border-gray-100">per night</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealMetrics;
