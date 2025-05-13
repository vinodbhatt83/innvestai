import React from 'react';

const InflationForm = ({ formData, handleChange }) => {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Inflation Assumptions</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Inflation Rate (General)
                    </label>
                    <input
                        type="number"
                        name="inflation_rate_general"
                        value={formData.inflation_rate_general}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Insurance Inflation Rate
                    </label>
                    <input
                        type="number"
                        name="insurance_inflation_rate"
                        value={formData.insurance_inflation_rate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Property Tax Inflation Rate
                    </label>
                    <input
                        type="number"
                        name="property_tax_inflation_rate"
                        value={formData.property_tax_inflation_rate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                    />
                </div>
            </div>
        </div>
    );
};

export default InflationForm;