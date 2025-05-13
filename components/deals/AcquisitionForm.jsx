import React from 'react';

const AcquisitionForm = ({ formData, handleChange }) => {
    // Months for acquisition
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Purchase price methods
    const purchaseMethods = [
        'Per Room',
        'Cap Rate',
        'Gross Revenue Multiple',
        'Custom'
    ];

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Acquisition</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Acquisition Costs (exc. Lender Fees)
                    </label>
                    <input
                        type="number"
                        name="acquisition_costs"
                        value={formData.acquisition_costs}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Acquisition Month
                    </label>
                    <select
                        name="acquisition_month"
                        value={formData.acquisition_month}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option value="">Select month</option>
                        {months.map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Acquisition Year
                    </label>
                    <input
                        type="number"
                        name="acquisition_year"
                        value={formData.acquisition_year}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter number"
                        min="2000"
                        max="2100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Cap Rate (Going In)
                    </label>
                    <input
                        type="number"
                        name="cap_rate_going_in"
                        value={formData.cap_rate_going_in}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Hold Period
                    </label>
                    <input
                        type="number"
                        name="hold_period"
                        value={formData.hold_period}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter number"
                        min="1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Purchase Price (should be calculated?)
                    </label>
                    <input
                        type="number"
                        name="purchase_price"
                        value={formData.purchase_price}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Purchase Price Method
                    </label>
                    <select
                        name="purchase_price_method"
                        value={formData.purchase_price_method}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option value="">Select method</option>
                        {purchaseMethods.map(method => (
                            <option key={method} value={method}>{method}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default AcquisitionForm;