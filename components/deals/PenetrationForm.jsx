import React from 'react';

const PenetrationForm = ({ formData, handleChange }) => {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Penetration Analysis</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Comp Name
                    </label>
                    <input
                        type="text"
                        name="comp_name"
                        value={formData.comp_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter text"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Comp Nbr of Rooms
                    </label>
                    <input
                        type="number"
                        name="comp_nbr_of_rooms"
                        value={formData.comp_nbr_of_rooms}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter number"
                        min="0"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Market ADR % Change
                    </label>
                    <input
                        type="number"
                        name="market_adr_change"
                        value={formData.market_adr_change}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Market Occupancy Pct
                    </label>
                    <input
                        type="number"
                        name="market_occupancy_pct"
                        value={formData.market_occupancy_pct}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Occupied Room Growth Pct
                    </label>
                    <input
                        type="number"
                        name="occupied_room_growth_pct"
                        value={formData.occupied_room_growth_pct}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Property ADR % Change
                    </label>
                    <input
                        type="number"
                        name="property_adr_change"
                        value={formData.property_adr_change}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Sample Hotel Occupancy
                    </label>
                    <input
                        type="number"
                        name="sample_hotel_occupancy"
                        value={formData.sample_hotel_occupancy}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Enter percentage"
                        step="0.01"
                        max="100"
                    />
                </div>
            </div>
        </div>
    );
};

export default PenetrationForm;