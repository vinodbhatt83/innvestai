import React from 'react';

const DepartmentalExpensesForm = ({ formData, handleChange }) => {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Departmental Expenses</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        F&B Expense - % of F&B Revenue
                    </label>
                    <input
                        type="number"
                        name="fnb_expense_percent"
                        value={formData.fnb_expense_percent}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        F&B Expense (Amount)
                    </label>
                    <input
                        type="number"
                        name="fnb_expense_amount"
                        value={formData.fnb_expense_amount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        F&B Expense POR
                    </label>
                    <input
                        type="number"
                        name="fnb_expense_por"
                        value={formData.fnb_expense_por}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Other Operated Expense - % of Other Operated Revenue
                    </label>
                    <input
                        type="number"
                        name="other_operated_expense_percent"
                        value={formData.other_operated_expense_percent}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Other Operated Expense (Amount)
                    </label>
                    <input
                        type="number"
                        name="other_operated_expense_amount"
                        value={formData.other_operated_expense_amount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Other Operated Expense POR
                    </label>
                    <input
                        type="number"
                        name="other_operated_expense_por"
                        value={formData.other_operated_expense_por}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Rooms Expense - % of Rooms Revenue
                    </label>
                    <input
                        type="number"
                        name="rooms_expense_percent"
                        value={formData.rooms_expense_percent}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Rooms Expense (Amount)
                    </label>
                    <input
                        type="number"
                        name="rooms_expense_amount"
                        value={formData.rooms_expense_amount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter amount"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Rooms Expense POR
                    </label>
                    <input
                        type="number"
                        name="rooms_expense_por"
                        value={formData.rooms_expense_por}
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

export default DepartmentalExpensesForm;