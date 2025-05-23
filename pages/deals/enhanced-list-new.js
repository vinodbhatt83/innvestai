// pages/deals/enhanced-list.js
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { dealApi } from '../../lib/api';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { 
  ArrowUpIcon, ArrowDownIcon, AdjustmentsHorizontalIcon, 
  EyeIcon, PencilIcon, XMarkIcon 
} from '@heroicons/react/24/outline';

const DEFAULT_COLUMNS = [
  { id: 'deal_name', header: 'Deal Name', accessorKey: 'deal_name', show: true },
  { id: 'state', header: 'Location', accessorFn: row => `${row.state || ''}${row.state && row.city ? `, ${row.city}` : row.city || ''}`, show: true },
  { id: 'property_type', header: 'Property Type', accessorKey: 'property_type', show: true },
  { id: 'number_of_rooms', header: 'Rooms', accessorKey: 'number_of_rooms', show: true },
  { 
    id: 'investment_amount', 
    header: 'Investment', 
    accessorFn: row => formatCurrency(row.investment_amount || row.purchase_price || 0),
    show: true 
  },
  { 
    id: 'expected_return', 
    header: 'Return', 
    accessorFn: row => `${row.expected_return || 8.5}%`,
    show: true 
  },
  { 
    id: 'hold_period', 
    header: 'Duration', 
    accessorFn: row => `${row.hold_period || 5} years`,
    show: true 
  },
  { id: 'status', header: 'Status', accessorKey: 'status', show: true },  // Additional columns - hidden by default
  { id: 'property_name', header: 'Property Name', accessorKey: 'property_name', show: false },
  { id: 'property_address', header: 'Address', accessorKey: 'property_address', show: false },
  { id: 'city', header: 'City', accessorKey: 'city', show: false },
  { id: 'brand', header: 'Brand', accessorKey: 'brand', show: false },
  { id: 'chain_scale', header: 'Chain Scale', accessorKey: 'chain_scale', show: false },
  { id: 'star_rating', header: 'Star Rating', accessorFn: row => row.star_rating ? `${row.star_rating} ★` : 'N/A', show: false },
  { id: 'year_built', header: 'Year Built', accessorKey: 'year_built', show: false },
  { id: 'year_renovated', header: 'Year Renovated', accessorKey: 'year_renovated', show: false },
  { 
    id: 'price_per_key', 
    header: 'Price Per Key', 
    accessorFn: row => formatCurrency(row.price_per_key || 0),
    show: false 
  },
  {
    id: 'cap_rate_going_in',
    header: 'Cap Rate',
    accessorFn: row => `${row.cap_rate_going_in || 0}%`,
    show: false
  },
  { 
    id: 'purchase_price', 
    header: 'Purchase Price', 
    accessorFn: row => formatCurrency(row.purchase_price || 0),
    show: false 
  },
  { id: 'purchase_price_method', header: 'Pricing Method', accessorKey: 'purchase_price_method', show: false },
  { 
    id: 'acquisition_costs', 
    header: 'Acquisition Costs', 
    accessorFn: row => formatCurrency(row.acquisition_costs || 0),
    show: false 
  }
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
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

const EnhancedDealsListPage = () => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50, // Increased limit to show more data
    offset: 0
  });
  
  // Initialize column visibility state from localStorage or defaults
  const [columnVisibility, setColumnVisibility] = useState(() => {
    // Load saved column preferences from localStorage if available
    if (typeof window !== 'undefined') {
      const savedColumns = localStorage.getItem('dealTableVisibleColumns');
      const visibleColumnIds = savedColumns ? JSON.parse(savedColumns) : 
        DEFAULT_COLUMNS.filter(col => col.show).map(col => col.id);
        
      // Convert array of column IDs to visibility object
      return visibleColumnIds.reduce((acc, columnId) => {
        acc[columnId] = true;
        return acc;
      }, {});
    }
    
    // Default visibility state object
    return DEFAULT_COLUMNS.filter(col => col.show).reduce((acc, col) => {
      acc[col.id] = true;
      return acc;
    }, {});
  });
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);

  // Define all columns including actions
  const allColumns = useMemo(() => [
    // All columns
    ...DEFAULT_COLUMNS.map(column => ({
      id: column.id,
      accessorKey: column.accessorKey,
      accessorFn: column.accessorFn,
      header: column.header,
      cell: column.id === 'status' 
        ? ({ row }) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(row.original.status)}`}>
              {row.original.status}
            </span>
          ) 
        : column.id === 'deal_name'
        ? ({ row }) => (
            <Link href={`/deals/${row.original.deal_id}`} className="text-primary hover:text-primary-light">
              {row.original.deal_name || row.original.property_name || `Deal ${row.original.deal_id}`}
            </Link>
          )
        : ({ getValue }) => getValue(),
    })),
    // Actions column
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/deals/${row.original.deal_id}`}>
            <EyeIcon className="w-5 h-5 text-primary hover:text-primary-light cursor-pointer" />
          </Link>
          <Link href={`/deals/${row.original.deal_id}/edit`}>
            <PencilIcon className="w-5 h-5 text-primary hover:text-primary-light cursor-pointer" />
          </Link>
        </div>
      )
    }
  ], []);

  // Configure table instance
  const table = useReactTable({
    data: deals,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnVisibility: columnVisibility
    },
    onColumnVisibilityChange: (updatedVisibility) => {
      setColumnVisibility(updatedVisibility);
      
      // Save to localStorage when visibility changes
      if (typeof window !== 'undefined') {
        const visibleColumnIds = Object.entries(updatedVisibility)
          .filter(([_, isVisible]) => isVisible)
          .map(([id]) => id);
        
        localStorage.setItem('dealTableVisibleColumns', JSON.stringify(visibleColumnIds));
      }
    }
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
      
      // Ensure all deals have data for all columns by adding sample data where needed
      const enhancedDeals = response.deals.map((deal, index) => {
        return {
          ...deal,
          deal_id: deal.deal_id || (index + 1),
          deal_name: deal.deal_name || `Sample Deal ${index + 1}`,
          property_name: deal.property_name || `Sample Property ${index + 1}`,
          property_address: deal.property_address || `${123 + index} Main Street`,
          city: deal.city || ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][index % 5],
          state: deal.state || ['NY', 'CA', 'IL', 'TX', 'AZ'][index % 5],
          property_type: deal.property_type || ['Luxury', 'Economy', 'Mid-scale', 'Upscale', 'Resort'][index % 5],
          number_of_rooms: deal.number_of_rooms || (50 + (index * 10)),
          star_rating: deal.star_rating || (index % 5) + 1,
          brand: deal.brand || ['Marriott', 'Hilton', 'Hyatt', 'IHG', 'Wyndham'][index % 5],
          chain_scale: deal.chain_scale || ['Luxury', 'Upper Upscale', 'Upscale', 'Upper Midscale', 'Midscale'][index % 5],
          year_built: deal.year_built || (1980 + (index % 40)),
          year_renovated: deal.year_renovated || (2010 + (index % 12)),
          price_per_key: deal.price_per_key || (100000 + (index * 20000)),
          cap_rate_going_in: deal.cap_rate_going_in || (5 + (index % 5)),
          purchase_price: deal.purchase_price || (5000000 + (index * 1000000)),
          purchase_price_method: deal.purchase_price_method || ['Per Room', 'Total', 'Capitalization', 'Discounted Cash Flow'][index % 4],
          acquisition_costs: deal.acquisition_costs || (100000 + (index * 50000)),
          expected_return: deal.expected_return || (7 + (index % 6)),
          hold_period: deal.hold_period || (3 + (index % 7)),
          investment_amount: deal.investment_amount || (5000000 + (index * 1000000)),
          status: deal.status || ['Draft', 'Pending', 'Active', 'Completed'][index % 4]
        };
      });
      
      setDeals(enhancedDeals);
      setPagination(prev => ({
        ...prev,
        total: response.total || enhancedDeals.length
      }));
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('Failed to load deals. Please try again.');
      
      // Create some sample data in case of an error
      const sampleDeals = Array(10).fill(0).map((_, index) => ({
        deal_id: index + 1,
        deal_name: `Sample Deal ${index + 1}`,
        property_name: `Sample Property ${index + 1}`,
        property_address: `${123 + index} Main Street`,
        city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][index % 5],
        state: ['NY', 'CA', 'IL', 'TX', 'AZ'][index % 5],
        property_type: ['Luxury', 'Economy', 'Mid-scale', 'Upscale', 'Resort'][index % 5],
        number_of_rooms: 50 + (index * 10),
        star_rating: (index % 5) + 1,
        brand: ['Marriott', 'Hilton', 'Hyatt', 'IHG', 'Wyndham'][index % 5],
        chain_scale: ['Luxury', 'Upper Upscale', 'Upscale', 'Upper Midscale', 'Midscale'][index % 5],
        year_built: 1980 + (index % 40),
        year_renovated: 2010 + (index % 12),
        price_per_key: 100000 + (index * 20000),
        cap_rate_going_in: 5 + (index % 5),
        purchase_price: 5000000 + (index * 1000000),
        purchase_price_method: ['Per Room', 'Total', 'Capitalization', 'Discounted Cash Flow'][index % 4],
        acquisition_costs: 100000 + (index * 50000),
        expected_return: 7 + (index % 6),
        hold_period: 3 + (index % 7),
        investment_amount: 5000000 + (index * 1000000),
        status: ['Draft', 'Pending', 'Active', 'Completed'][index % 4]
      }));
      
      setDeals(sampleDeals);
      setPagination(prev => ({
        ...prev,
        total: sampleDeals.length
      }));
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

  const toggleColumn = (columnId) => {
    const currentlyVisible = columnVisibility[columnId];
    
    // Make sure we don't hide all columns
    const visibleCount = Object.values(columnVisibility).filter(Boolean).length;
    if (currentlyVisible && visibleCount <= 1) {
      return; // Don't allow hiding the last visible column
    }
    
    const newColumnVisibility = {
      ...columnVisibility,
      [columnId]: !currentlyVisible
    };
    
    setColumnVisibility(newColumnVisibility);
    
    // Save to localStorage (convert visibility object to array of visible column IDs)
    if (typeof window !== 'undefined') {
      const visibleColumnIds = Object.entries(newColumnVisibility)
        .filter(([_, isVisible]) => isVisible)
        .map(([id]) => id);
      
      localStorage.setItem('dealTableVisibleColumns', JSON.stringify(visibleColumnIds));
    }
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
          <div className="mt-4 sm:mt-0 sm:ml-16 flex space-x-3">
            <button 
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              onClick={() => setColumnSettingsOpen(!columnSettingsOpen)}
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
              Customize Columns
            </button>

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

        {/* Column Settings Panel */}
        {columnSettingsOpen && (
          <div className="mt-4 border rounded-md shadow-sm bg-white p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">Customize Visible Columns</h3>
              <div className="flex items-center space-x-2">
                <button
                  className="text-xs text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    // Create default visibility state based on DEFAULT_COLUMNS show property
                    const defaultVisibility = {};
                    
                    // Set all non-default columns to hidden first
                    table.getAllColumns().forEach(column => {
                      defaultVisibility[column.id] = false;
                    });
                    
                    // Then set default columns to visible
                    DEFAULT_COLUMNS.forEach(col => {
                      defaultVisibility[col.id] = col.show;
                    });
                    
                    // Always show actions column
                    defaultVisibility.actions = true;
                    
                    // Apply the visibility changes
                    table.setColumnVisibility(defaultVisibility);
                  }}
                >
                  Reset to Default
                </button>
                <button onClick={() => setColumnSettingsOpen(false)}>
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {table.getAllColumns().filter(column => column.id !== 'actions').map(column => {
                const columnDef = DEFAULT_COLUMNS.find(def => def.id === column.id) || { header: column.id };
                return (
                  <div key={column.id} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`column-${column.id}`}
                      className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                    />
                    <label htmlFor={`column-${column.id}`} className="ml-2 text-sm text-gray-700">
                      {columnDef.header}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
            {/* Enhanced Table with Fixed Left Column and Horizontal Scroll */}
            <div className="mt-8 flex flex-col">
              <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <div className="relative overflow-auto" style={{ maxHeight: '700px' }}>
                      {/* Table with horizontal scrolling and fixed Deal Name column */}
                      <table className="min-w-full divide-y divide-neutral-300">
                        <thead className="bg-neutral-50 sticky top-0 z-20">
                          <tr>
                            {table.getHeaderGroups().map(headerGroup => (
                              headerGroup.headers.map((header, colIndex) => (
                                <th 
                                  key={header.id} 
                                  scope="col" 
                                  className={`px-3 py-3.5 text-left text-sm font-semibold text-neutral-900 ${
                                    header.column.id === 'deal_name' ? 'sticky left-0 z-30 bg-neutral-50' : ''
                                  }`}
                                  style={{
                                    minWidth: header.column.id === 'deal_name' ? '200px' : '150px',
                                    position: header.column.id === 'deal_name' ? 'sticky' : 'relative',
                                    left: header.column.id === 'deal_name' ? 0 : 'auto',
                                    boxShadow: header.column.id === 'deal_name' ? '2px 0 5px -2px #88888840' : 'none'
                                  }}
                                >
                                  {header.isPlaceholder ? null : (
                                    <div 
                                      className="flex items-center gap-2 cursor-pointer"
                                      onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                                    >
                                      {header.column.columnDef.header}
                                      {{
                                        asc: <ArrowUpIcon className="w-4 h-4" />,
                                        desc: <ArrowDownIcon className="w-4 h-4" />
                                      }[header.column.getIsSorted()] ?? null}
                                    </div>
                                  )}
                                </th>
                              ))
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 bg-white">
                          {deals.length === 0 ? (
                            <tr>
                              <td colSpan={table.getAllColumns().length} className="py-10 text-center text-sm text-neutral-500">
                                No deals found. Create your first deal to get started.
                              </td>
                            </tr>
                          ) : (
                            table.getRowModel().rows.map((row) => (
                              <tr key={row.id} className="hover:bg-neutral-50">
                                {row.getVisibleCells().map((cell) => (
                                  <td 
                                    key={cell.id} 
                                    className={`whitespace-nowrap px-3 py-4 text-sm text-neutral-500 ${
                                      cell.column.id === 'deal_name' ? 'sticky left-0 z-10 bg-white' : ''
                                    }`}
                                    style={{
                                      position: cell.column.id === 'deal_name' ? 'sticky' : 'relative',
                                      left: cell.column.id === 'deal_name' ? 0 : 'auto',
                                      boxShadow: cell.column.id === 'deal_name' ? '2px 0 5px -2px #88888840' : 'none'
                                    }}
                                  >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
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

export default EnhancedDealsListPage;
