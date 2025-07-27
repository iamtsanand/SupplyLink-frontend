import React, { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { BarChart, Tag, Users, Handshake, TrendingUp, Clock } from 'lucide-react';
import { postBid } from '../utils/api'; // Import the API function
import { isBiddingWindowActive } from '../utils/time'; // Import the time utility

const SupplierDashboard = ({ state, aggregatedDemands, onBidSubmit }) => {
    const { userId } = useAuth(); // Get the current user's Clerk ID
    const { user } = useUser(); // Get the full user object for metadata

    const [bidItem, setBidItem] = useState(null);
    const [bidPrice, setBidPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const biddingActive = isBiddingWindowActive(); // Check if the bidding window is open

    const handlePlaceBidClick = (item, data) => {
        // Prevent opening the bid form if the window is closed
        if (!biddingActive) {
            alert("Bidding is currently closed. You can only update bids between 8-9 AM and 8-9 PM.");
            return;
        }
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
            supplierName: user.fullName || 'Anonymous Supplier',
            price: priceNum,
        };

        try {
            const response = await postBid(bidData);
            alert(`Bid Updated Successfully!`);
            onBidSubmit(response.data); // Notify HomePage to update its state
            setBidItem(null);
            setBidPrice('');
        } catch (error) {
            console.error("Failed to submit bid:", error);
            const errorMessage = error.response?.data?.message || "Could not update your bid.";
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">My Active Bids</h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <BarChart className="mr-2 text-purple-600" /> Bidding Status in {state}
                    </h3>
                    {!biddingActive && (
                        <div className="flex items-center text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                            <Clock className="w-4 h-4 mr-2" />
                            Bidding is Closed
                        </div>
                    )}
                </div>
                <div className="space-y-4">
                    {Object.keys(aggregatedDemands).length > 0 ? Object.entries(aggregatedDemands).map(([item, data]) => {
                        // Find the user's specific bid for this item
                        const myBid = data.bids?.find(b => b.clerkUserId === userId)?.price;

                        return (
                            <div key={item} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-xl">{item}</h4>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                            <span className="flex items-center"><Tag className="w-4 h-4 mr-1"/> Total Demand: <b className="ml-1">{data.totalQuantity} {data.unit}</b></span>
                                            <span className="flex items-center"><Users className="w-4 h-4 mr-1"/> Vendors: <b className="ml-1">{data.vendorCount}</b></span>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 text-left md:text-right">
                                        <p className="text-sm text-gray-500">Current Lowest Bid</p>
                                        <p className="text-2xl font-bold text-green-600">{data.lowestBid ? `₹${data.lowestBid}` : 'N/A'}</p>
                                        {myBid && <p className="text-sm font-semibold text-blue-600">Your Bid: ₹{myBid}</p>}
                                        <button 
                                            onClick={() => handlePlaceBidClick(item, data)} 
                                            className="mt-2 bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            disabled={!biddingActive}
                                        >
                                            Update Bid
                                        </button>
                                    </div>
                                </div>
                                {bidItem === item && (
                                    <form onSubmit={(e) => handleBidSubmit(e, item, data.lowestBid)} className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <h5 className="font-semibold mb-2">Update Your Bid for {item}</h5>
                                        <div className="flex items-end gap-4">
                                            <div>
                                                <label htmlFor="bidPrice" className="block text-sm font-medium text-gray-700">New Offer Price (per {data.unit})</label>
                                                <input type="number" id="bidPrice" value={bidPrice} onChange={e => setBidPrice(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required step="0.01" />
                                            </div>
                                            <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center disabled:bg-green-300">
                                                <Handshake className="w-4 h-4 mr-2"/>{isSubmitting ? 'Submitting...' : 'Submit Update'}
                                            </button>
                                            <button type="button" onClick={() => setBidItem(null)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )
                    }) : <p className="text-gray-500">You have not placed any bids yet. Go to the Bidding Arena to start.</p>}
                </div>
            </div>
        </div>
    );
};

export default SupplierDashboard;
