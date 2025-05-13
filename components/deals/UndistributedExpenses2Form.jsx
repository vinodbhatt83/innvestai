import React from 'react';

const UndistributedExpenses2Form = ({ formData, handleChange }) => {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Undistributed Expenses - Page 2</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Property Operations & Maintenance PAR
                    </label>
                    <input
                        type="number"
                        name="property_ops_maintenance_par"
                        value={formData.property_ops_maintenance_par}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Property Operations & Maintenance POR
                    </label>
                    <input
                        type="number"
                        name="property_ops_maintenance_por"
                        value={formData.property_ops_maintenance_por}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Property Operations & Maintenance - % of Total Revenue
                    </label>
                    <input
                        type="number"
                        name="property_ops_maintenance_percent"
                        value={formData.property_ops_maintenance_percent}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Sales & Marketing Expense - % of Total Revenue
                    </label>
                    <input
                        type="number"
                        name="sales_marketing_expense_percent"
                        value={formData.sales_marketing_expense_percent}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Sales & Marketing Expense (Amount)
                    </label>
                    <input
                        type="number"
                        name="sales_marketing_expense_amount"
                        value={formData.sales_marketing_expense_amount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Sales & Marketing Expense PAR
                    </label>
                    <input
                        type="number"
                        name="sales_marketing_expense_par"
                        value={formData.sales_marketing_expense_par}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Utilities Expense PAR
                    </label>
                    <input
                        type="number"
                        name="utilities_expense_par"
                        value={formData.utilities_expense_par}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Utilities Expense POR
                    </label>
                    <input
                        type="number"
                        name="utilities_expense_por"
                        value={formData.utilities_expense_por}
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

export default UndistributedExpenses2Form;