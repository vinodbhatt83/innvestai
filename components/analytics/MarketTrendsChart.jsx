// components/analytics/MarketTrendsChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MarketTrendsChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-neutral-500">No data available</p>
            </div>
        );
    }

    // Process the data to make it suitable for the chart
    const processedData = data.map(item => {
        // Format date as "MMM YYYY"
        const date = new Date(item.year, item.month - 1);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        return {
            date: formattedDate,
            revpar: parseFloat(item.revpar),
            adr: parseFloat(item.adr),
            occupancy: parseFloat(item.occupancy) * 100, // Convert to percentage
        };
    });

    // Get data for every 3 months to avoid cluttering the chart
    const filteredData = processedData.filter((_, index) => index % 3 === 0);

    // Custom tooltip formatter
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-md rounded-md border border-neutral-200">
                    <p className="text-sm font-medium text-neutral-900">{`${label}`}</p>
                    {payload.map((entry, index) => (
                        <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
                            {`${entry.name === 'revpar' ? 'RevPAR' : entry.name === 'adr' ? 'ADR' : 'Occupancy'}: ${entry.name === 'occupancy' ? `${entry.value.toFixed(1)}%` : `$${entry.value.toFixed(2)}`
                                }`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={filteredData}
                margin={{
                    top: 10,
                    right: 30,
                    left: 20,
                    bottom: 30,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: '#d1d5db' }}
                    tick={{ angle: -45, textAnchor: 'end', fontSize: 12 }}
                    height={50}
                />
                <YAxis
                    yAxisId="left"
                    tickLine={false}
                    axisLine={{ stroke: '#d1d5db' }}
                    tickFormatter={(value) => `$${value}`}
                />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={{ stroke: '#d1d5db' }}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => {
                        return value === 'revpar' ? 'RevPAR' : value === 'adr' ? 'ADR' : 'Occupancy';
                    }}
                />
                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revpar"
                    stroke="#10b981"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    dot={{ r: 3 }}
                />
                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="adr"
                    stroke="#1e3a8a"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    dot={{ r: 3 }}
                />
                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    dot={{ r: 3 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default MarketTrendsChart;