import React from 'react';

const RevenueForm = ({ formData, handleChange }) => {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Operating Revenue</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        F&B Revenue - % of Rooms Revenue
                    </label>
                    <input
                        type="number"
                        name="fnb_revenue_percent"
                        value={formData.fnb_revenue_percent}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        F&B Revenue POR
                    </label>
                    <input
                        type="number"
                        name="fnb_revenue_por"
                        value={formData.fnb_revenue_por}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Other Operated Revenue POR
                    </label>
                    <input
                        type="number"
                        name="other_operated_revenue_por"
                        value={formData.other_operated_revenue_por}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Rentals & Other Income (Net) Amount
                    </label>
                    <input
                        type="number"
                        name="rentals_other_income_net_amount"
                        value={formData.rentals_other_income_net_amount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Rentals & Other Income (Net) POR
                    </label>
                    <input
                        type="number"
                        name="rentals_other_income_net_por"
                        value={formData.rentals_other_income_net_por}
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

export default RevenueForm;