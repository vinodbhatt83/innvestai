import React from 'react';

const FFEReserveForm = ({ formData, handleChange }) => {
    // Contingency options
    const contingencyOptions = [
        'Low', 'Medium', 'High'
    ];

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">FF&E Reserve</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Reserve for Replacement - % of Total Revenue
                    </label>
                    <input
                        type="number"
                        name="reserve_for_replacement_percent"
                        value={formData.reserve_for_replacement_percent}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Contingency (Option)
                    </label>
                    <select
                        name="contingency"
                        value={formData.contingency}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option value="">Select an option</option>
                        {contingencyOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default FFEReserveForm;