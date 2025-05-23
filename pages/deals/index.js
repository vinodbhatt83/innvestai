// pages/deals/indexNew.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { dealApi } from '../../lib/api';
import { Plus, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'; // Import Lucide icons

const DealsListPageNew = () => {
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
      <div className="px-4 sm:px-6 lg:px-8 py-6"> {/* Added py-6 for consistency */}
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
              <span className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary cursor-pointer">
                Create Deal
                <Plus className="ml-2 -mr-1 h-5 w-5" />
              </span>
            </Link>
          </div>
        </div>

        {isLoading && deals.length === 0 ? (
          <div className="flex justify-center items-center mt-12"> {/* Increased margin and centered */}
            <Loader2 className="animate-spin h-12 w-12 text-secondary" /> {/* Made spinner larger */}
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 mt-8">
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
          <>
            {/* Table */}
            <div className="mt-8 flex flex-col">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-neutral-300">
                      <thead className="bg-neutral-100"> {/* Slightly darker header for more contrast */}
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
                                  <span className="text-primary hover:text-secondary cursor-pointer"> {/* Changed hover to secondary for more pop */}
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
                                  <span className="text-secondary hover:text-secondary-light cursor-pointer mr-4"> {/* Changed to secondary for Edit action */}
                                    Edit
                                  </span>
                                </Link>
                                <Link href={`/deals/${deal.deal_id}`}>
                                  <span className="text-neutral-600 hover:text-secondary cursor-pointer"> {/* View is less primary than Edit */}
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
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-neutral-500 ring-1 ring-inset ring-neutral-300 ${ /* Adjusted text color for icons */
                        pagination.offset === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-100' /* Slightly more visible hover */
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={pagination.offset + pagination.limit >= pagination.total}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-neutral-500 ring-1 ring-inset ring-neutral-300 ${ /* Adjusted text color for icons */
                        pagination.offset + pagination.limit >= pagination.total ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-100' /* Slightly more visible hover */
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
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

export default DealsListPageNew;
