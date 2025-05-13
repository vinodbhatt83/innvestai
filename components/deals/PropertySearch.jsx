import React, { useState, useEffect } from 'react';

const PropertySearch = ({ value, onChange, onPropertySelect }) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effect to fetch properties when search query changes
  useEffect(() => {
    // Don't search if query is less than 2 characters
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching properties with query:', searchQuery);
        
        // Make the API request
        const response = await fetch(`/api/properties/search?query=${encodeURIComponent(searchQuery)}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        
        // Check data structure and set results
        if (data.properties) {
          setSearchResults(data.properties);
        } else if (Array.isArray(data)) {
          setSearchResults(data);
        } else {
          console.warn('Unexpected API response format:', data);
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError(error.message);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(fetchProperties, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    console.log('Input changed to:', value);
    setSearchQuery(value);
    onChange({ target: { name: 'property_name', value } });
  };

  // Handle property selection
  const handlePropertySelect = (property) => {
    console.log('Property selected:', property);
    // Update parent form with selected property data
    onPropertySelect(property);
    // Clear search results after selection
    setSearchResults([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        name="property_name"
        value={searchQuery}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
        placeholder="Enter property name to search"
        required
      />
      
      {isLoading && (
        <div className="absolute right-3 top-3">
          <svg className="animate-spin h-4 w-4 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {error && (
        <div className="text-xs text-red-500 mt-1">
          Error: {error}. Please check browser console for details.
        </div>
      )}
      
      {searchResults && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-md border border-neutral-200 max-h-60 overflow-auto">
          <ul>
            {searchResults.map((property, index) => {
              // Ensure we have a unique key
              const key = property.property_key || property.property_id || property.id || `property-${index}`;
              
              // Get property name (adjust field names based on your API)
              const name = property.property_name || property.name || 'Unknown Property';
              
              // Get city, state and other details
              const city = property.city || property.city_name || '';
              const state = property.state || property.state_name || '';
              const address = property.property_address || property.address || '';
              const rooms = property.number_of_rooms || property.rooms || '';
              const type = property.property_type || property.type || '';
              
              return (
                <li 
                  key={key}
                  className="px-4 py-2 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-0"
                  onClick={() => handlePropertySelect(property)}
                >
                  <div className="font-medium">{name}</div>
                  <div className="text-sm text-neutral-500">
                    {city && state ? 
                      `${city}, ${state}` : 
                      address || 'No address available'}
                    
                    {type && ` • ${type}`}
                    
                    {rooms && ` • ${rooms} rooms`}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {searchQuery.length >= 2 && !isLoading && searchResults.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-md border border-neutral-200 p-3">
          <p className="text-sm text-neutral-500">No properties found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default PropertySearch;