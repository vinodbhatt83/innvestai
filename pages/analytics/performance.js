// pages/analytics/performanceNew.js
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { analyticsApi } from '../../lib/api';
import PerformanceMetricsChart from '../../components/analytics/PerformanceMetricsChart';
import DepartmentExpensesChart from '../../components/analytics/DepartmentExpensesChart';
import { Loader2, AlertCircle, DollarSign, LineChart, BedDouble, Users, DownloadCloud, CalendarRange, BellPlus } from 'lucide-react'; // Added icons

const PerformanceAnalysisPageNew = () => {
  const [properties, setProperties] = useState([
    '1 Hotel Brooklyn Bridge',
    '1 Hotel Central Park',
    '1 Hotel West Hollywood',
    'Marriott Downtown',
    'Hilton Resort & Spa',
    'Courtyard by Marriott',
    'Hampton Inn & Suites'
  ]);
  const [years, setYears] = useState([2022, 2023, 2024]);
  const [quarters, setQuarters] = useState([1, 2, 3, 4]);
  
  const [selectedProperty, setSelectedProperty] = useState('1 Hotel Brooklyn Bridge');
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [departmentExpenses, setDepartmentExpenses] = useState(null);
  const [quarterlyPerformance, setQuarterlyPerformance] = useState(null);
  const [budgetVsActual, setBudgetVsActual] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPerformanceData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch multiple data sets concurrently
      const [revenueData, expensesData, quarterlyData, budgetData] = await Promise.all([
        analyticsApi.getMonthlyRevenue(selectedYear),
        analyticsApi.getDepartmentExpenses(selectedYear, selectedProperty),
        analyticsApi.getQuarterlyPerformance(selectedYear, selectedQuarter || 5), // 5 for all quarters if none selected
        analyticsApi.getBrandPerformance(selectedYear) // Using brand performance as a placeholder for budget vs actual
      ]);
      
      // Process and set the data
      const filteredRevenueData = revenueData.filter(item => item.property_name === selectedProperty);
      setMonthlyRevenue(filteredRevenueData);
      setDepartmentExpenses(expensesData);
      setQuarterlyPerformance(quarterlyData);
      setBudgetVsActual(budgetData);
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError('Failed to load performance data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedProperty, selectedYear, selectedQuarter]);

  const handlePropertyChange = (e) => {
    setSelectedProperty(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleQuarterChange = (e) => {
    const value = e.target.value;
    setSelectedQuarter(value === 'all' ? null : parseInt(value));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate summary metrics
  const calculateSummaryMetrics = () => {
    if (!monthlyRevenue || monthlyRevenue.length === 0) {
      return {
        totalRevenue: 0,
        averageRevPAR: 0,
        averageADR: 0,
        averageOccupancy: 0
      };
    }

    const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0);
    const averageRevPAR = monthlyRevenue.reduce((sum, item) => sum + item.revpar, 0) / monthlyRevenue.length;
    const averageADR = monthlyRevenue.reduce((sum, item) => sum + item.adr, 0) / monthlyRevenue.length;
    const averageOccupancy = monthlyRevenue.reduce((sum, item) => sum + item.occupancy, 0) / monthlyRevenue.length;

    return {
      totalRevenue,
      averageRevPAR,
      averageADR,
      averageOccupancy
    };
  };

  const summaryMetrics = calculateSummaryMetrics();

  return (
    <Layout title="Performance Analysis">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"> {/* Added py-6 for consistency */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
              Hotel Performance Analysis
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Analyze hotel performance metrics and departmental expenses
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="property" className="block text-sm font-medium text-neutral-700">
                  Property
                </label>
                <select
                  id="property"
                  name="property"
                  value={selectedProperty}
                  onChange={handlePropertyChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm rounded-md"
                >
                  {properties.map(property => (
                    <option key={property} value={property}>
                      {property}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-neutral-700">
                  Year
                </label>
                <select
                  id="year"
                  name="year"
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm rounded-md"
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="quarter" className="block text-sm font-medium text-neutral-700">
                  Quarter
                </label>
                <select
                  id="quarter"
                  name="quarter"
                  value={selectedQuarter || 'all'}
                  onChange={handleQuarterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm rounded-md"
                >
                  <option value="all">All Quarters</option>
                  {quarters.map(quarter => (
                    <option key={quarter} value={quarter}>
                      Q{quarter}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Revenue */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-secondary-light rounded-md p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">
                      Total Revenue
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-neutral-900">
                        {isLoading ? (
                          <div className="animate-pulse h-6 w-24 bg-neutral-200 rounded"></div>
                        ) : (
                          formatCurrency(summaryMetrics.totalRevenue)
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* RevPAR */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-light rounded-md p-3"> {/* Assuming primary-light is intended to be different from secondary-light */}
                  <LineChart className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">
                      Average RevPAR
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-neutral-900">
                        {isLoading ? (
                          <div className="animate-pulse h-6 w-24 bg-neutral-200 rounded"></div>
                        ) : (
                          `$${summaryMetrics.averageRevPAR.toFixed(2)}`
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* ADR */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3"> {/* Keeping original color as it's distinct */}
                  <BedDouble className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">
                      Average ADR
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-neutral-900">
                        {isLoading ? (
                          <div className="animate-pulse h-6 w-24 bg-neutral-200 rounded"></div>
                        ) : (
                          `$${summaryMetrics.averageADR.toFixed(2)}`
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Occupancy */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-amber-500 rounded-md p-3"> {/* Keeping original color as it's distinct */}
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">
                      Average Occupancy
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-neutral-900">
                        {isLoading ? (
                          <div className="animate-pulse h-6 w-24 bg-neutral-200 rounded"></div>
                        ) : (
                          `${(summaryMetrics.averageOccupancy * 100).toFixed(1)}%`
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
          {/* Monthly Revenue Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">
                  Monthly Performance Metrics
                </h3>
              </div>
              <div className="px-6 py-5">
                {isLoading ? (
                  <div className="flex justify-center items-center h-80">
                    <Loader2 className="animate-spin h-10 w-10 text-secondary" />
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
                  <div className="h-80">
                    <PerformanceMetricsChart data={monthlyRevenue} />
                  </div>
                )}
              </div>
            </div>

            {/* Department Expenses Chart */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">
                  Department Expenses
                </h3>
              </div>
              <div className="px-6 py-5">
                {isLoading ? (
                  <div className="flex justify-center items-center h-80">
                    <Loader2 className="animate-spin h-10 w-10 text-secondary" />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 p-4 rounded-md">
                    <p className="text-sm text-red-800">Unable to load department expenses data.</p>
                  </div>
                ) : (
                  <div className="h-80">
                    <DepartmentExpensesChart data={departmentExpenses} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Quarterly Performance */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">
                  Quarterly Performance
                </h3>
              </div>
              <div className="px-6 py-5">
                {isLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="animate-spin h-8 w-8 text-secondary" />
                  </div>
                ) : error ? (
                  <p className="text-sm text-neutral-500">Unable to load quarterly performance data.</p>
                ) : (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(quarter => (
                      <div key={`quarter-${quarter}`} className="bg-neutral-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-neutral-900">Q{quarter} {selectedYear}</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            +4.2%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-neutral-500">Revenue</p>
                            <p className="text-sm font-medium">{formatCurrency(1250000 * quarter)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">RevPAR</p>
                            <p className="text-sm font-medium">${(110 + quarter * 5).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Occupancy</p>
                            <p className="text-sm font-medium">{(72 + quarter * 2).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Budget vs Actual */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">
                  Budget vs Actual
                </h3>
              </div>
              <div className="px-6 py-5">
                {isLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="animate-spin h-8 w-8 text-secondary" />
                  </div>
                ) : error ? (
                  <p className="text-sm text-neutral-500">Unable to load budget vs actual data.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-neutral-700">Revenue</span>
                          <div className="flex items-center">
                            <span className="text-sm text-green-600 font-medium">+5.2%</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-1 mr-4">
                            <div className="h-2 bg-neutral-200 rounded-full">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: '105.2%' }}></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-neutral-500">
                            <span>Budget: {formatCurrency(5000000)}</span>
                          </div>
                        </div>
                        <div className="flex justify-end text-xs text-neutral-500 mt-1">
                          <span>Actual: {formatCurrency(5260000)}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-neutral-700">Expenses</span>
                          <div className="flex items-center">
                            <span className="text-sm text-red-600 font-medium">+3.1%</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-1 mr-4">
                            <div className="h-2 bg-neutral-200 rounded-full">
                              <div className="h-2 bg-red-500 rounded-full" style={{ width: '103.1%' }}></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-neutral-500">
                            <span>Budget: {formatCurrency(3500000)}</span>
                          </div>
                        </div>
                        <div className="flex justify-end text-xs text-neutral-500 mt-1">
                          <span>Actual: {formatCurrency(3608500)}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-neutral-700">Profit</span>
                          <div className="flex items-center">
                            <span className="text-sm text-green-600 font-medium">+9.9%</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-1 mr-4">
                            <div className="h-2 bg-neutral-200 rounded-full">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: '109.9%' }}></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-neutral-500">
                            <span>Budget: {formatCurrency(1500000)}</span>
                          </div>
                        </div>
                        <div className="flex justify-end text-xs text-neutral-500 mt-1">
                          <span>Actual: {formatCurrency(1648500)}</span>
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
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">
                    <DownloadCloud className="mr-2 h-5 w-5" /> Generate Performance Report
                  </button>
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">
                    <CalendarRange className="mr-2 h-5 w-5" /> View YoY Comparison
                  </button>
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">
                    <BellPlus className="mr-2 h-5 w-5" /> Set Performance Alerts
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

export default PerformanceAnalysisPageNew;
