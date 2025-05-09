// components/analytics/PerformanceMetricsChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PerformanceMetricsChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-neutral-500">No data available</p>
            </div>
        );
    }

    // Transform data for the chart
    const chartData = data.map(item => {
        const month = new Date(0, item.month - 1).toLocaleString('default', { month: 'short' });
        return {
            month,
            revenue: parseFloat(item.revenue || 0),
            revpar: parseFloat(item.revpar || 0),
            adr: parseFloat(item.adr || 0),
            occupancy: parseFloat(item.occupancy || 0) * 100 // Convert to percentage
        };
    });

    // Custom tooltip formatter
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-md rounded-md border border-neutral-200">
                    <p className="text-sm font-medium text-neutral-900">{`Month: ${label}`}</p>
                    {payload.map((entry, index) => {
                        let value = entry.value;
                        let prefix = '';
                        let suffix = '';

                        if (entry.name === 'revenue') {
                            prefix = '$';
                            value = value.toLocaleString();
                        } else if (entry.name === 'revpar' || entry.name === 'adr') {
                            prefix = '$';
                            value = value.toFixed(2);
                        } else if (entry.name === 'occupancy') {
                            suffix = '%';
                            value = value.toFixed(1);
                        }

                        return (
                            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
                                {`${entry.name === 'revpar' ? 'RevPAR' : entry.name === 'adr' ? 'ADR' : entry.name === 'occupancy' ? 'Occupancy' : 'Revenue'}: ${prefix}${value}${suffix}`}
                            </p>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis
                    yAxisId="revenue"
                    orientation="left"
                    tickLine={false}
                    axisLine={{ stroke: '#d1d5db' }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                    label={{ value: 'Revenue', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                />
                <YAxis
                    yAxisId="metrics"
                    orientation="right"
                    tickLine={false}
                    axisLine={{ stroke: '#d1d5db' }}
                    label={{ value: 'Metrics', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => {
                        return value === 'revenue' ? 'Revenue' : value === 'revpar' ? 'RevPAR' : value === 'adr' ? 'ADR' : 'Occupancy';
                    }}
                />
                <Bar yAxisId="revenue" dataKey="revenue" fill="#10b981" name="revenue" />
                <Bar yAxisId="metrics" dataKey="revpar" fill="#1e3a8a" name="revpar" />
                <Bar yAxisId="metrics" dataKey="adr" fill="#f59e0b" name="adr" />
                <Bar yAxisId="metrics" dataKey="occupancy" fill="#ef4444" name="occupancy" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default PerformanceMetricsChart;