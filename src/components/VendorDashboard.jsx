import React, { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { PlusCircle, ShoppingCart, TrendingDown, Clock } from 'lucide-react';
import { postNewRequirement } from '../utils/api'; // Import the API function
import { isBiddingWindowActive, getTimeToNextWindow } from '../utils/time'; // Import time utilities

const RequirementForm = ({ pincode, onRequirementSubmit }) => {
    const { userId } = useAuth(); // Get the current user's Clerk ID
    const { user } = useUser(); // Get the full user object for metadata
    
    const [item, setItem] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('kg'); // Add a state for the unit
    const [price, setPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const biddingActive = isBiddingWindowActive(); // Check if bidding is active

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (biddingActive) {
            alert("You cannot post new requirements while a bidding session is active.");
            return;
        }
        if (!userId || !user) {
            alert("You must be logged in to post a requirement.");
            return;
        }
        setIsSubmitting(true);

        const requirementData = {
            clerkUserId: userId,
            item,
            quantity: Number(quantity),
            unit,
            price: Number(price),
            pincode,
            state: user.unsafeMetadata?.state, // Get state from user metadata
        };

        try {
            const response = await postNewRequirement(requirementData);
            alert(`New Requirement Submitted Successfully!`);
            onRequirementSubmit(response.data); // Notify parent component of the new requirement
            // Reset form
            setItem('');
            setQuantity('');
            setUnit('kg');
            setPrice('');
        } catch (error) {
            console.error("Failed to submit requirement:", error);
            alert("Error: Could not submit your requirement. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Conditionally render the form or a message based on the bidding window
    if (biddingActive) {
        return (
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-center py-4 px-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <Clock className="mx-auto h-10 w-10 text-blue-500" />
                    <h3 className="mt-3 text-lg font-semibold text-blue-800">Posting Disabled During Bidding</h3>
                    <p className="text-blue-600 mt-1">New requirements cannot be posted while a bidding session is active (8-9 AM/PM).</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <PlusCircle className="mr-2 text-blue-600" /> Post a New Requirement
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2">
                    <label htmlFor="item" className="block text-sm font-medium text-gray-700">Item Name</label>
                    <input type="text" id="item" value={item} onChange={e => setItem(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
                    <select id="unit" value={unit} onChange={e => setUnit(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white py-2">
                        <option>kg</option>
                        <option>grams</option>
                        <option>liters</option>
                        <option>pieces</option>
                        <option>bags</option>
                        <option>meters</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Expected Price</label>
                    <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div className="md:col-span-5">
                     <button type="submit" disabled={isSubmitting} className="w-full md:w-auto mt-2 bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300">
                        {isSubmitting ? 'Submitting...' : 'Submit Requirement'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const VendorDashboard = ({ pincode, aggregatedDemands, onRequirementSubmit }) => {
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h2>
            {/* Pass the handler function down to the form */}
            <RequirementForm pincode={pincode} onRequirementSubmit={onRequirementSubmit} />
            
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <ShoppingCart className="mr-2 text-green-600" /> Live Market View (Pincode: {pincode})
                </h3>
                <div className="space-y-4">
                    {/* The aggregatedDemands prop will now be up-to-date */}
                    {Object.keys(aggregatedDemands).length > 0 ? Object.entries(aggregatedDemands).map(([item, data]) => (
                        <div key={item} className="p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <h4 className="font-bold text-gray-800">{item}</h4>
                                <p className="text-sm text-gray-600">
                                    Total Demand: <span className="font-semibold">{data.totalQuantity} {data.unit}</span> from <span className="font-semibold">{data.vendorCount} vendors</span>
                                </p>
                            </div>
                            <div className="mt-2 md:mt-0 text-left md:text-right">
                                {data.lowestBid ? (
                                    <>
                                        <p className="text-sm text-gray-500 flex items-center justify-end"><TrendingDown className="mr-1 text-green-500" /> Current Lowest Bid</p>
                                        <p className="text-2xl font-bold text-green-600">₹{data.lowestBid}</p>
                                    </>
                                ) : (
                                    <p className="text-sm font-semibold text-gray-500">No bids yet</p>
                                )}
                            </div>
                        </div>
                    )) : <p className="text-gray-500">No active demands in your area currently.</p>}
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
