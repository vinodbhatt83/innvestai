// components/deals/DealForm.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { dealApi } from '../../lib/api';

const DealForm = ({ initialData = {} }) => {
  const router = useRouter();
  const isEditMode = !!initialData.id || !!initialData.deal_id;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [formData, setFormData] = useState({
    deal_name: initialData.deal_name || '',
    street_address: initialData.street_address || '',
    street_address_line_2: initialData.street_address_line_2 || '',
    city: initialData.city || '',
    state_province: initialData.state_province || '',
    zip_postal_code: initialData.zip_postal_code || '',
    country: initialData.country || '',
    property_key: initialData.property_key || null,
    investment_amount: initialData.investment_amount || 1000000,
    expected_return: initialData.expected_return || 8.5,
    start_date: initialData.start_date || new Date().toISOString().split('T')[0],
    end_date: initialData.end_date || new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
    status: initialData.status || 'Draft'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Search properties when user types in deal name
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await dealApi.searchDeals(searchQuery);
        setSearchResults(results);
        console.log('Search results:', results);
      } catch (error) {
        console.error('Error searching properties:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle property selection and auto-fill form fields
  const handlePropertySelect = (property) => {
    console.log('Selected property:', property);
    
    // Auto-fill form fields with property data
    setFormData(prev => ({
      ...prev,
      deal_name: property.property_name || '',
      property_key: property.property_key,
      // Auto-fill address fields with sample data if not present in property object
      street_address: property.street_address || '123 Main Street',
      street_address_line_2: property.street_address_line_2 || '',
      city: property.city_name || property.city || 'New York',
      state_province: property.state_name || property.state || 'NY',
      zip_postal_code: property.zip_postal_code || property.zip || '10001',
      country: property.country_name || property.country || 'United States'
    }));
    
    // Clear search results and query
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If changing deal_name, update search query as well
    if (name === 'deal_name') {
      setSearchQuery(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.deal_name.trim()) {
      newErrors.deal_name = 'Deal name is required';
    }
    
    // Only validate these fields if they are being shown in the form
    if (formData.street_address !== undefined && !formData.street_address.trim()) {
      newErrors.street_address = 'Street address is required';
    }
    
    if (formData.city !== undefined && !formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (formData.state_province !== undefined && !formData.state_province.trim()) {
      newErrors.state_province = 'State/Province is required';
    }
    
    if (formData.zip_postal_code !== undefined && !formData.zip_postal_code.trim()) {
      newErrors.zip_postal_code = 'ZIP/Postal code is required';
    }
    
    if (formData.country !== undefined && !formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send required fields for the deals table
      const dealData = {
        deal_name: formData.deal_name,
        property_key: formData.property_key,
        investment_amount: formData.investment_amount || 1000000,
        expected_return: formData.expected_return || 8.5,
        start_date: formData.start_date || new Date().toISOString().split('T')[0],
        end_date: formData.end_date || new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
        status: formData.status || 'Draft'
      };
      
      console.log('Submitting deal data:', dealData);
      
      let response;
      
      if (isEditMode) {
        const dealId = initialData.id || initialData.deal_id;
        response = await dealApi.updateDeal(dealId, dealData);
      } else {
        response = await dealApi.createDeal(dealData);
      }
      
      console.log('API response:', response);
      
      // Redirect to the deal details page
      router.push(`/deals/${response.id || response.deal_id}`);
    } catch (error) {
      console.error('Error saving deal:', error);
      setErrors(prev => ({
        ...prev,
        form: 'Failed to save deal. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/deals');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-neutral-900">Basic Deal Information</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Enter the basic details for this investment deal.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6">
                <label htmlFor="deal_name" className="block text-sm font-medium text-neutral-700">
                  Deal Name *
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    name="deal_name"
                    id="deal_name"
                    value={formData.deal_name}
                    onChange={handleChange}
                    className="mt-1 focus:ring-secondary focus:border-secondary block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                    placeholder="Enter deal name"
                  />
                  {isSearching && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="animate-spin h-5 w-5 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 focus:outline-none sm:text-sm">
                      <ul className="divide-y divide-neutral-200">
                        {searchResults.map((property) => (
                          <li
                            key={property.property_key}
                            className="px-4 py-2 cursor-pointer hover:bg-neutral-100"
                            onClick={() => handlePropertySelect(property)}
                          >
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-neutral-900">{property.property_name}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {errors.deal_name && (
                  <p className="mt-2 text-sm text-red-600">{errors.deal_name}</p>
                )}
              </div>
              
              {/* Hidden Investment Amount Field (required by database) */}
              <input
                type="hidden"
                name="investment_amount"
                id="investment_amount"
                value={formData.investment_amount}
              />
              
              {/* Hidden Expected Return Field */}
              <input
                type="hidden"
                name="expected_return"
                id="expected_return"
                value={formData.expected_return}
              />
              
              {/* Hidden Start Date Field */}
              <input
                type="hidden"
                name="start_date"
                id="start_date"
                value={formData.start_date}
              />
              
              {/* Hidden End Date Field */}
              <input
                type="hidden"
                name="end_date"
                id="end_date"
                value={formData.end_date}
              />
              
              {/* Hidden Status Field */}
              <input
                type="hidden"
                name="status"
                id="status"
                value={formData.status}
              />
            </div>
            
            <div className="mt-6">
              <h4 className="text-base font-medium text-neutral-900 mb-3">Property Address</h4>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="street_address" className="block text-sm font-medium text-neutral-700">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street_address"
                    id="street_address"
                    value={formData.street_address}
                    onChange={handleChange}
                    className="mt-1 focus:ring-secondary focus:border-secondary block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                    placeholder="Enter street address"
                  />
                  {errors.street_address && (
                    <p className="mt-2 text-sm text-red-600">{errors.street_address}</p>
                  )}
                </div>

                <div className="col-span-6">
                  <label htmlFor="street_address_line_2" className="block text-sm font-medium text-neutral-700">
                    Street Address Line 2
                  </label>
                  <input
                    type="text"
                    name="street_address_line_2"
                    id="street_address_line_2"
                    value={formData.street_address_line_2}
                    onChange={handleChange}
                    className="mt-1 focus:ring-secondary focus:border-secondary block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="city" className="block text-sm font-medium text-neutral-700">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 focus:ring-secondary focus:border-secondary block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                    placeholder="Enter city"
                  />
                  {errors.city && (
                    <p className="mt-2 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="state_province" className="block text-sm font-medium text-neutral-700">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    name="state_province"
                    id="state_province"
                    value={formData.state_province}
                    onChange={handleChange}
                    className="mt-1 focus:ring-secondary focus:border-secondary block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                    placeholder="Enter state/province"
                  />
                  {errors.state_province && (
                    <p className="mt-2 text-sm text-red-600">{errors.state_province}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="zip_postal_code" className="block text-sm font-medium text-neutral-700">
                    ZIP/Postal Code *
                  </label>
                  <input
                    type="text"
                    name="zip_postal_code"
                    id="zip_postal_code"
                    value={formData.zip_postal_code}
                    onChange={handleChange}
                    className="mt-1 focus:ring-secondary focus:border-secondary block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                    placeholder="Enter ZIP/postal code"
                  />
                  {errors.zip_postal_code && (
                    <p className="mt-2 text-sm text-red-600">{errors.zip_postal_code}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="country" className="block text-sm font-medium text-neutral-700">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    id="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1 focus:ring-secondary focus:border-secondary block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                    placeholder="Enter country"
                  />
                  {errors.country && (
                    <p className="mt-2 text-sm text-red-600">{errors.country}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {errors.form && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{errors.form}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCancel}
          className="bg-white py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Deal' : 'Create Deal'}
        </button>
      </div>
    </form>
  );
};

export default DealForm;