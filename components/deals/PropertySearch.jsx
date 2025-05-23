// components/deals/PropertySearchNew.jsx
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react'; // Import Loader2

const PropertySearchNew = ({ value, onChange, onPropertySelect }) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effect to fetch properties when search query changes
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/properties/search?query=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (data.properties) {
          setSearchResults(data.properties);
        } else if (Array.isArray(data)) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        setError(error.message);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchProperties, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    onChange({ target: { name: 'property_name', value: val } });
  };

  const handleSelectProperty = (property) => { // Renamed to avoid conflict with prop
    onPropertySelect(property);
    setSearchResults([]);
    // Optional: setSearchQuery to the selected property's name if desired
    // setSearchQuery(property.property_name || property.name || ''); 
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
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2"> {/* Adjusted position for better centering */}
          <Loader2 className="animate-spin h-5 w-5 text-neutral-500" /> {/* Using Loader2 icon */}
        </div>
      )}
      
      {error && (
        <div className="text-xs text-red-500 mt-1">
          Error: {error}.
        </div>
      )}
      
      {searchResults && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-md border border-neutral-200 max-h-60 overflow-auto">
          <ul>
            {searchResults.map((property, index) => {
              const key = property.property_key || property.property_id || property.id || `property-${index}`;
              const name = property.property_name || property.name || 'Unknown Property';
              const city = property.city || property.city_name || '';
              const state = property.state || property.state_name || '';
              const address = property.property_address || property.address || '';
              const rooms = property.number_of_rooms || property.rooms || '';
              const type = property.property_type || property.type || '';
              
              return (
                <li 
                  key={key}
                  className="px-4 py-2 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-0"
                  onClick={() => handleSelectProperty(property)} // Corrected handler name
                >
                  <div className="font-medium">{name}</div>
                  <div className="text-sm text-neutral-500">
                    {city && state ? `${city}, ${state}` : address || 'No address available'}
                    {type && ` • ${type}`}
                    {rooms && ` • ${rooms} rooms`}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {searchQuery.length >= 2 && !isLoading && searchResults.length === 0 && !error && ( // Added !error condition
        <div className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-md border border-neutral-200 p-3">
          <p className="text-sm text-neutral-500">No properties found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default PropertySearchNew;
