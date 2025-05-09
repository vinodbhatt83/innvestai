// components/deals/PropertySearch.jsx
import React, { useState, useEffect } from 'react';
import { dealApi } from '../../lib/api';

const PropertySearch = ({ onPropertySelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Don't search if query is too short
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    // Set a new timeout for search
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await dealApi.searchDeals(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching properties:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    setDebounceTimeout(timeout);

    // Cleanup
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery]);

  return (
    <div className="w-full">
      <label htmlFor="property-search" className="block text-sm font-medium text-neutral-700">
        Property Search
      </label>
      <div className="mt-1 relative">
        <input
          type="text"
          id="property-search"
          className="shadow-sm focus:ring-secondary focus:border-secondary block w-full sm:text-sm border-neutral-300 rounded-md"
          placeholder="Start typing to search for properties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="animate-spin h-5 w-5 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 focus:outline-none sm:text-sm">
          <ul className="divide-y divide-neutral-200">
            {searchResults.map((property) => (
              <li
                key={property.property_id}
                className="px-4 py-2 cursor-pointer hover:bg-neutral-100"
                onClick={() => onPropertySelect(property)}
              >
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-neutral-900">{property.property_name}</p>
                  <p className="text-sm text-neutral-500">{property.brand_name}</p>
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-neutral-500">
                    {property.city_name}, {property.state_name}
                  </p>
                  <p className="text-xs text-neutral-500">{property.hotel_type_name}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PropertySearch;