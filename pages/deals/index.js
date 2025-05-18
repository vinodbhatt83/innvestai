// pages/deals/index.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { dealApi } from '../../lib/api';

const DealsListPage = () => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0
  });

  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      const response = await dealApi.listDeals({
        limit: pagination.limit,
        offset: pagination.offset,
        sortBy: 'created_at',
        order: 'DESC'
      });
      
      setDeals(response.deals);
      setPagination(prev => ({
        ...prev,
        total: response.total
      }));
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('Failed to load deals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [pagination.offset, pagination.limit]);

  const handleNextPage = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  const handlePrevPage = () => {
    setPagination(prev => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit)
    }));
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
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationYears = Math.round((end - start) / (365 * 24 * 60 * 60 * 1000));
    return `${durationYears} ${durationYears === 1 ? 'year' : 'years'}`;
  };

  return (
    <Layout title="Deals">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
              Investment Deals
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              View and manage all hotel investment deals
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 flex">
            <Link href="/deals/create">
              <span className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary cursor-pointer">
                Create Deal
                <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {isLoading && deals.length === 0 ? (
          <div className="flex justify-center mt-8">
            <svg className="animate-spin h-10 w-10 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 mt-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="mt-8 flex flex-col">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-neutral-300">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-neutral-900 sm:pl-6">
                            Deal Name
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">
                            Location
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">
                            Rooms
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">
                            Investment
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">
                            Return
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">
                            Duration
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">
                            Status
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 bg-white">
                        {deals.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="py-10 text-center text-sm text-neutral-500">
                              No deals found. Create your first deal to get started.
                            </td>
                          </tr>
                        ) : (
                          deals.map((deal) => (
                            <tr key={deal.deal_id} className="hover:bg-neutral-50">
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-neutral-900 sm:pl-6">
                                <Link href={`/deals/${deal.deal_id}`}>
                                  <span className="text-primary hover:text-primary-light cursor-pointer">
                                    {deal.deal_name}
                                  </span>
                                </Link>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-500">
                                {deal.city || ''}{deal.city && deal.state ? ', ' : ''}{deal.state || ''}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-500">
                                {deal.number_of_rooms || 'N/A'}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-500">
                                {formatCurrency(deal.investment_amount)}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-500">
                                {deal.expected_return}%
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-500">
                                {formatDuration(deal.start_date, deal.end_date)}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(deal.status)}`}>
                                  {deal.status}
                                </span>
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <Link href={`/deals/${deal.deal_id}/edit`}>
                                  <span className="text-primary hover:text-primary-light cursor-pointer mr-4">
                                    Edit
                                  </span>
                                </Link>
                                <Link href={`/deals/${deal.deal_id}`}>
                                  <span className="text-primary hover:text-primary-light cursor-pointer">
                                    View
                                  </span>
                                </Link>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-5 flex items-center justify-between border-t border-neutral-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.offset === 0}
                  className={`relative inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 ${
                    pagination.offset === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={pagination.offset + pagination.limit >= pagination.total}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 ${
                    pagination.offset + pagination.limit >= pagination.total ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-neutral-700">
                    Showing <span className="font-medium">{pagination.offset + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.offset + pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={handlePrevPage}
                      disabled={pagination.offset === 0}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-neutral-400 ring-1 ring-inset ring-neutral-300 ${
                        pagination.offset === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={pagination.offset + pagination.limit >= pagination.total}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-neutral-400 ring-1 ring-inset ring-neutral-300 ${
                        pagination.offset + pagination.limit >= pagination.total ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default DealsListPage;