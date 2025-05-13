import React from 'react';

const ManagementForm = ({ formData, handleChange }) => {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Management & Franchise Fees</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Base Management Fee - % of Total Revenue
                    </label>
                    <input
                        type="number"
                        name="base_management_fee"
                        value={formData.base_management_fee}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Franchise Fees - % of F&B Revenue
                    </label>
                    <input
                        type="number"
                        name="franchise_fees_fnb"
                        value={formData.franchise_fees_fnb}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Franchise Fees - % of Rooms Revenue
                    </label>
                    <input
                        type="number"
                        name="franchise_fees_rooms"
                        value={formData.franchise_fees_rooms}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Incentive Management Fee - % of Total Revenue
                    </label>
                    <input
                        type="number"
                        name="incentive_management_fee_percent"
                        value={formData.incentive_management_fee_percent}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Incentive Management Fee (Amount)
                    </label>
                    <input
                        type="number"
                        name="incentive_management_fee_amount"
                        value={formData.incentive_management_fee_amount}
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

export default ManagementForm;