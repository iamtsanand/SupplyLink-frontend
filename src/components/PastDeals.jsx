import React from 'react';
import { Award, Package, Users, Calendar } from 'lucide-react';

const PastDeals = ({ deals }) => {
    if (!deals || deals.length === 0) {
        return (
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Recent Deals</h2>
                <p className="text-gray-500 mt-2">No recent deals have been closed yet.</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Deals</h2>
            {/* FIX: Changed from a multi-column grid to a single-column layout with spacing */}
            <div className="space-y-6">
                {deals.map(deal => (
                    <div key={deal._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                        <div className="flex items-center mb-4">
                            <Package className="w-8 h-8 text-gray-700 mr-3" />
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{deal.item}</h3>
                                <p className="text-sm text-gray-500">{deal.state}</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-gray-700">
                            <div className="flex items-center">
                                <Award className="w-5 h-5 text-green-600 mr-2" />
                                <div>
                                    <span className="font-semibold">Winning Bid:</span> ₹{deal.winningPrice} / {deal.unit}
                                    <p className="text-xs text-gray-500">by {deal.winningSupplierName}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Users className="w-5 h-5 text-blue-600 mr-2" />
                                <div>
                                    <span className="font-semibold">Vendors Fulfilled:</span> {deal.vendorNames.length}
                                    <p className="text-xs text-gray-500 truncate" title={deal.vendorNames.join(', ')}>
                                        {deal.vendorNames.join(', ')}
                                    </p>
                                </div>
                            </div>
                             <div className="flex items-center text-xs text-gray-400 pt-2 border-t mt-3">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>Closed on: {new Date(deal.closedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PastDeals;
