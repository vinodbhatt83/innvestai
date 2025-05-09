// components/analytics/DepartmentExpensesChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const DepartmentExpensesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-neutral-500">No data available</p>
      </div>
    );
  }

  // Sample department colors
  const COLORS = [
    '#10b981', // secondary (teal)
    '#1e3a8a', // primary (dark blue)
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#3b82f6', // blue
    '#a855f7', // purple
    '#f43f5e', // rose
  ];

  // Transform data for the chart
  // In a real app, you would process the actual data from your API
  const chartData = [
    { name: 'Rooms', value: 35 },
    { name: 'F&B', value: 25 },
    { name: 'Admin & General', value: 15 },
    { name: 'Sales & Marketing', value: 10 },
    { name: 'Property Ops & Maintenance', value: 8 },
    { name: 'Utilities', value: 5 },
    { name: 'Other', value: 2 },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value * 10000);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-neutral-200">
          <p className="text-sm font-medium text-neutral-900">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-neutral-500">
            {payload[0].value}% of total expenses
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend renderer
  const renderLegend = (props) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap justify-center mt-4">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center mx-2 mb-2">
            <div
              className="w-3 h-3 mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-neutral-600">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DepartmentExpensesChart;