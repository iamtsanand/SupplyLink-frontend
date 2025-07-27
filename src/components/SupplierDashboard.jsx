import React, { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { BarChart, Tag, Users, Handshake } from 'lucide-react';
import { postBid } from '../utils/api'; // Import the API function

const SupplierDashboard = ({ pincode, aggregatedDemands, onBidSubmit }) => {
    const { userId } = useAuth(); // Get the current user's Clerk ID
    const { user } = useUser(); // Get the full user object for metadata

    const [bidItem, setBidItem] = useState(null);
    const [bidPrice, setBidPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePlaceBidClick = (item, data) => {
        setBidItem(item);
        // Suggest a starting price slightly lower than the current best
        setBidPrice(data.lowestBid ? String(data.lowestBid - 0.5) : String(data.highestPrice - 1));
    };
    
    const handleBidSubmit = async (e, item, currentLowestBid) => {
        e.preventDefault();
        if (!userId || !user) {
            alert("You must be logged in to place a bid.");
            return;
        }

        const priceNum = Number(bidPrice);
        // Client-side validation
        if (currentLowestBid && priceNum >= currentLowestBid) {
            alert(`Your bid must be lower than the current lowest bid of ₹${currentLowestBid}.`);
            return;
        }

        setIsSubmitting(true);

        const bidData = {
            item: item,
            state: user.unsafeMetadata?.state,
            clerkUserId: userId,
            supplierName: user.unsafeMetadata.firstName || 'Anonymous Supplier',
            price: priceNum,
        };

        try {
            const response = await postBid(bidData);
            alert(`Bid Placed Successfully!`);
            onBidSubmit(response.data); // Notify HomePage to update its state
            setBidItem(null);
            setBidPrice('');
        } catch (error) {
            console.error("Failed to submit bid:", error);
            // Use the error message from the backend if available
            const errorMessage = error.response?.data?.message || "Could not place your bid. Please try again.";
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BarChart className="mr-2 text-purple-600" /> Aggregated Demand (Pincode: {pincode})
                </h3>
                <div className="space-y-4">
                    {Object.keys(aggregatedDemands).length > 0 ? Object.entries(aggregatedDemands).map(([item, data]) => (
                        <div key={item} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-xl">{item}</h4>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                        <span className="flex items-center"><Tag className="w-4 h-4 mr-1"/> Total Demand: <b className="ml-1">{data.totalQuantity} {data.unit}</b></span>
                                        <span className="flex items-center"><Users className="w-4 h-4 mr-1"/> Vendors: <b className="ml-1">{data.vendorCount}</b></span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Highest vendor expectation: ₹{data.highestPrice}/{data.unit}</p>
                                </div>
                                <div className="mt-4 md:mt-0 text-left md:text-right">
                                    <p className="text-sm text-gray-500">Current Lowest Bid</p>
                                    <p className="text-2xl font-bold text-green-600">{data.lowestBid ? `₹${data.lowestBid}` : 'N/A'}</p>
                                    <button onClick={() => handlePlaceBidClick(item, data)} className="mt-2 bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition text-sm">
                                        Place a Bid
                                    </button>
                                </div>
                            </div>
                            {bidItem === item && (
                                <form onSubmit={(e) => handleBidSubmit(e, item, data.lowestBid)} className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <h5 className="font-semibold mb-2">Your Bid for {item}</h5>
                                    <div className="flex items-end gap-4">
                                        <div>
                                            <label htmlFor="bidPrice" className="block text-sm font-medium text-gray-700">Your Offer Price (per {data.unit})</label>
                                            <input type="number" id="bidPrice" value={bidPrice} onChange={e => setBidPrice(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required step="0.01" />
                                        </div>
                                        <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center disabled:bg-green-300">
                                            <Handshake className="w-4 h-4 mr-2"/>{isSubmitting ? 'Submitting...' : 'Submit Bid'}
                                        </button>
                                        <button type="button" onClick={() => setBidItem(null)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )) : <p className="text-gray-500">No active demands to bid on in your area.</p>}
                </div>
            </div>
        </div>
    );
};

export default SupplierDashboard;
