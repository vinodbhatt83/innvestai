import React from 'react';

const NonOperatingForm = ({ formData, handleChange }) => {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Non-Operating Expenses</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Ground Rent - % of Total Revenue
                    </label>
                    <input
                        type="number"
                        name="ground_rent_percent"
                        value={formData.ground_rent_percent}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Ground Rent (Amount)
                    </label>
                    <input
                        type="number"
                        name="ground_rent_amount"
                        value={formData.ground_rent_amount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Insurance Expense - % of Total Revenue
                    </label>
                    <input
                        type="number"
                        name="insurance_expense_percent"
                        value={formData.insurance_expense_percent}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Insurance Expense (Amount)
                    </label>
                    <input
                        type="number"
                        name="insurance_expense_amount"
                        value={formData.insurance_expense_amount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Leases & Other (Amount)
                    </label>
                    <input
                        type="number"
                        name="leases_other_amount"
                        value={formData.leases_other_amount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Leases & Other PAR
                    </label>
                    <input
                        type="number"
                        name="leases_other_par"
                        value={formData.leases_other_par}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Property Taxes (Amount)
                    </label>
                    <input
                        type="number"
                        name="property_taxes_amount"
                        value={formData.property_taxes_amount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Property Taxes PAR
                    </label>
                    <input
                        type="number"
                        name="property_taxes_par"
                        value={formData.property_taxes_par}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
            </div>
        </div>
    );
};

export default NonOperatingForm;