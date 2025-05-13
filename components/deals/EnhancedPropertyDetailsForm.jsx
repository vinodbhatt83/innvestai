import React from 'react';
import PropertySearch from './PropertySearch';

const EnhancedPropertyDetailsForm = ({ formData, handleChange, handlePropertySelect, validationErrors = {} }) => {
    // Property types
    const propertyTypes = [
        'Luxury',
        'Upper Upscale',
        'Upscale',
        'Upper Midscale',
        'Midscale',
        'Economy'
    ];

    // Key money options
    const keyMoneyOptions = [
        'Yes', 'No'
    ];

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Property Details</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Property Name <span className="text-red-500">*</span>
                    </label>
                    <PropertySearch 
                        value={formData.property_name}
                        onChange={handleChange}
                        onPropertySelect={handlePropertySelect}
                    />
                    {validationErrors.property_name && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.property_name}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Property Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="property_address"
                        value={formData.property_address}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter property address"
                    />
                    {validationErrors.property_address && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.property_address}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        City <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter city"
                    />
                    {validationErrors.city && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        State <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter state"
                    />
                    {validationErrors.state && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.state}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Number of Rooms <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="number_of_rooms"
                        value={formData.number_of_rooms}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter number of rooms"
                    />
                    {validationErrors.number_of_rooms && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.number_of_rooms}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Property Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="property_type"
                        value={formData.property_type}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option value="">Select an option</option>
                        {propertyTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    {validationErrors.property_type && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.property_type}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Key Money
                    </label>
                    <select
                        name="key_money"
                        value={formData.key_money}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option value="">Select an option</option>
                        {keyMoneyOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Version Name
                    </label>
                    <input
                        type="text"
                        name="version_name"
                        value={formData.version_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter text"
                    />
                </div>
            </div>
        </div>
    );
};

export default EnhancedPropertyDetailsForm;