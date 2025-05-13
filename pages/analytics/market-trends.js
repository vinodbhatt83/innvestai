// pages/analytics/market-trends.js
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { analyticsApi } from '../../lib/api';
import MarketTrendsChart from '../../components/analytics/MarketTrendsChart';

const MarketTrendsPage = () => {
  const [markets, setMarkets] = useState([
    'New York', 'Miami', 'Chicago', 'Los Angeles', 'Boston',
    'San Francisco', 'Washington DC', 'Las Vegas', 'Orlando', 'Austin'
  ]);
  const [selectedMarket, setSelectedMarket] = useState('Miami');
  const [yearRange, setYearRange] = useState({ startYear: 2019, endYear: 2023 });
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMarketTrends = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await analyticsApi.getMarketTrends(
        selectedMarket,
        yearRange.startYear,
        yearRange.endYear
      );
      setMarketData(data);
    } catch (err) {
      console.error('Error fetching market trends:', err);
      setError('Failed to load market trends data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketTrends();
  }, [selectedMarket, yearRange.startYear, yearRange.endYear]);

  const handleMarketChange = (e) => {
    setSelectedMarket(e.target.value);
  };

  const handleYearRangeChange = (e) => {
    const { name, value } = e.target;
    setYearRange(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  return (
    <Layout title="Market Trends Analysis">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
              Market Trends Analysis
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Analyze hotel market performance trends over time
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="market" className="block text-sm font-medium text-neutral-700">
                  Market
                </label>
                <select
                  id="market"
                  name="market"
                  value={selectedMarket}
                  onChange={handleMarketChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm rounded-md"
                >
                  {markets.map(market => (
                    <option key={market} value={market}>
                      {market}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="startYear" className="block text-sm font-medium text-neutral-700">
                  Start Year
                </label>
                <select
                  id="startYear"
                  name="startYear"
                  value={yearRange.startYear}
                  onChange={handleYearRangeChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm rounded-md"
                >
                  {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map(year => (
                    <option key={`start-${year}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="endYear" className="block text-sm font-medium text-neutral-700">
                  End Year
                </label>
                <select
                  id="endYear"
                  name="endYear"
                  value={yearRange.endYear}
                  onChange={handleYearRangeChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm rounded-md"
                >
                  {[2019, 2020, 2021, 2022, 2023, 2024].map(year => (
                    <option key={`end-${year}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">
                  {selectedMarket} Market Performance ({yearRange.startYear} - {yearRange.endYear})
                </h3>
              </div>
              <div className="px-6 py-5">
                {isLoading ? (
                  <div className="flex justify-center items-center h-80">
                    <svg className="animate-spin h-10 w-10 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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
                  <div className="h-80">
                    <MarketTrendsChart data={marketData} />
                  </div>
                )}
              </div>
            </div>

            {/* Market Metrics Table */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">
                  Market Metrics
                </h3>
              </div>
              <div className="px-6 py-5">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <svg className="animate-spin h-8 w-8 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 p-4 rounded-md">
                    <p className="text-sm text-red-800">Unable to load market metrics.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-neutral-200 sm:rounded-lg">
                          <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Year
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  RevPAR
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  ADR
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Occupancy
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Supply Growth
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Demand Growth
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                              {marketData && marketData.map((item, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                    {item.year}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                    ${item.revpar}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                    ${item.adr}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                    {item.occupancy && (item.occupancy * 100).toFixed(1)}%
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                    {item.supply_growth && (item.supply_growth * 100).toFixed(1)}%
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                    {item.demand_growth && (item.demand_growth * 100).toFixed(1)}%
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
            {/* Market Overview */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">
                  Market Overview
                </h3>
              </div>
              <div className="px-6 py-5">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <svg className="animate-spin h-8 w-8 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : error ? (
                  <p className="text-sm text-neutral-500">Unable to load market overview.</p>
                ) : (
                  <div>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-neutral-500">Current Performance</h4>
                      <dl className="mt-2 grid grid-cols-2 gap-4">
                        <div className="col-span-1 bg-neutral-50 rounded-lg p-4 flex flex-col items-center justify-center">
                          <dt className="text-xs font-medium text-neutral-500 mb-1">RevPAR</dt>
                          <dd className="text-lg font-semibold text-secondary">
                            ${marketData && marketData.length > 0 && marketData[marketData.length - 1].revpar ? 
                              marketData[marketData.length - 1].revpar.toFixed(2) : '0.00'}
                          </dd>
                        </div>
                        <div className="col-span-1 bg-neutral-50 rounded-lg p-4 flex flex-col items-center justify-center">
                          <dt className="text-xs font-medium text-neutral-500 mb-1">Occupancy</dt>
                          <dd className="text-lg font-semibold text-secondary">
                            {marketData && marketData.length > 0 && marketData[marketData.length - 1].occupancy ? 
                              (marketData[marketData.length - 1].occupancy * 100).toFixed(1) : '0.0'}%
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-neutral-500">Market Analysis</h4>
                      <p className="mt-2 text-sm text-neutral-600">
                        {selectedMarket} has shown a {marketData && marketData.length > 1 &&
                          (marketData[marketData.length - 1].revpar > marketData[marketData.length - 2].revpar ? 'positive' : 'negative')
                        } trend in RevPAR over the analyzed period, with {
                          marketData && marketData.length > 0 &&
                          (marketData[marketData.length - 1].demand_growth > marketData[marketData.length - 1].supply_growth
                            ? 'demand growth outpacing supply growth'
                            : 'supply growth outpacing demand growth')
                        }.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-neutral-500">Growth Summary</h4>
                      <div className="mt-2 space-y-3">
                        <div className="bg-neutral-50 p-3 rounded-md">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-neutral-500">RevPAR Growth</span>
                            {marketData && marketData.length > 1 && marketData[marketData.length - 1].revpar && marketData[0].revpar && (
                              <span className={`text-xs font-medium ${marketData[marketData.length - 1].revpar > marketData[0].revpar
                                  ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {marketData[marketData.length - 1].revpar > marketData[0].revpar ? '+' : ''}
                                {((marketData[marketData.length - 1].revpar / marketData[0].revpar - 1) * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-1.5">
                            {marketData && marketData.length > 1 && marketData[marketData.length - 1].revpar && marketData[0].revpar && (
                              <div
                                className={`h-1.5 rounded-full ${marketData[marketData.length - 1].revpar > marketData[0].revpar
                                    ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.abs((marketData[marketData.length - 1].revpar / marketData[0].revpar - 1) * 100)
                                  )}%`
                                }}
                              ></div>
                            )}
                          </div>
                        </div>

                        <div className="bg-neutral-50 p-3 rounded-md">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-neutral-500">ADR Growth</span>
                            {marketData && marketData.length > 1 && marketData[marketData.length - 1].adr && marketData[0].adr && (
                              <span className={`text-xs font-medium ${marketData[marketData.length - 1].adr > marketData[0].adr
                                  ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {marketData[marketData.length - 1].adr > marketData[0].adr ? '+' : ''}
                                {((marketData[marketData.length - 1].adr / marketData[0].adr - 1) * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-1.5">
                            {marketData && marketData.length > 1 && marketData[marketData.length - 1].adr && marketData[0].adr && (
                              <div
                                className={`h-1.5 rounded-full ${marketData[marketData.length - 1].adr > marketData[0].adr
                                    ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.abs((marketData[marketData.length - 1].adr / marketData[0].adr - 1) * 100)
                                  )}%`
                                }}
                              ></div>
                            )}
                          </div>
                        </div>

                        <div className="bg-neutral-50 p-3 rounded-md">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-neutral-500">Occupancy Growth</span>
                            {marketData && marketData.length > 1 && marketData[marketData.length - 1].occupancy && marketData[0].occupancy && (
                              <span className={`text-xs font-medium ${marketData[marketData.length - 1].occupancy > marketData[0].occupancy
                                  ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {marketData[marketData.length - 1].occupancy > marketData[0].occupancy ? '+' : ''}
                                {((marketData[marketData.length - 1].occupancy / marketData[0].occupancy - 1) * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-1.5">
                            {marketData && marketData.length > 1 && marketData[marketData.length - 1].occupancy && marketData[0].occupancy && (
                              <div
                                className={`h-1.5 rounded-full ${marketData[marketData.length - 1].occupancy > marketData[0].occupancy
                                    ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.abs((marketData[marketData.length - 1].occupancy / marketData[0].occupancy - 1) * 100)
                                  )}%`
                                }}
                              ></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">Actions</h3>
              </div>
              <div className="px-6 py-5">
                <div className="flex flex-col space-y-3">
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">
                    Generate Market Report
                  </button>
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    View Investment Opportunities
                  </button>
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">
                    Compare with Other Markets
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

export default MarketTrendsPage;