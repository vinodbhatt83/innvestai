import React from 'react';

const UndistributedExpenses1Form = ({ formData, handleChange }) => {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Undistributed Expenses - Page 1</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        General & Admin Expense - % of Rooms Revenue
                    </label>
                    <input
                        type="number"
                        name="general_admin_expense_percent"
                        value={formData.general_admin_expense_percent}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        General & Admin Expense (Amount)
                    </label>
                    <input
                        type="number"
                        name="general_admin_expense_amount"
                        value={formData.general_admin_expense_amount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        General & Admin Expense POR
                    </label>
                    <input
                        type="number"
                        name="general_admin_expense_por"
                        value={formData.general_admin_expense_por}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Info & Telecom - % of Total Revenue
                    </label>
                    <input
                        type="number"
                        name="info_telecom_percent"
                        value={formData.info_telecom_percent}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Info & Telecom (Amount)
                    </label>
                    <input
                        type="number"
                        name="info_telecom_amount"
                        value={formData.info_telecom_amount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Info & Telecom PAR
                    </label>
                    <input
                        type="number"
                        name="info_telecom_par"
                        value={formData.info_telecom_par}
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

export default UndistributedExpenses1Form;