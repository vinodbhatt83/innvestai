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

    // Process the data for the chart
    const chartData = data.map(item => ({
        market: item.market_name,
        revpar: parseFloat(item.avg_revpar || item.revpar || 0).toFixed(2),
        adr: parseFloat(item.avg_adr || item.adr || 0).toFixed(2),
        occupancy: parseFloat(item.avg_occupancy || item.occupancy || 0) * 100 // Convert to percentage
    }));

    // Custom tooltip formatter
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-md rounded-md border border-neutral-200">
                    <p className="text-sm font-medium text-neutral-900">{`Market: ${label}`}</p>
                    {payload.map((entry, index) => {
                        const metricName = entry.name === 'revpar' ? 'RevPAR' : 
                                         entry.name === 'adr' ? 'ADR' : 'Occupancy';
                        
                        const value = entry.name === 'occupancy' ? 
                                    `${parseFloat(entry.value).toFixed(1)}%` :
                                    `$${parseFloat(entry.value).toFixed(2)}`;
                        
                        return (
                            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
                                {`${metricName}: ${value}`}
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
                    bottom: 10,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                    dataKey="market" 
                    tickLine={false}
                    axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                    yAxisId="left"
                    orientation="left"
                    tickLine={false}
                    axisLine={{ stroke: '#d1d5db' }}
                    tickFormatter={(value) => `$${value}`}
                    label={{ value: 'Rates ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                />
                <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={{ stroke: '#d1d5db' }}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                    label={{ value: 'Occupancy (%)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                    formatter={(value) => {
                        return value === 'revpar' ? 'RevPAR' : 
                               value === 'adr' ? 'ADR' : 'Occupancy';
                    }}
                />
                <Bar 
                    yAxisId="left" 
                    dataKey="revpar" 
                    name="revpar" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]} 
                />
                <Bar 
                    yAxisId="left" 
                    dataKey="adr" 
                    name="adr" 
                    fill="#1e3a8a" 
                    radius={[4, 4, 0, 0]} 
                />
                <Bar 
                    yAxisId="right" 
                    dataKey="occupancy" 
                    name="occupancy" 
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]} 
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default PerformanceMetricsChart;