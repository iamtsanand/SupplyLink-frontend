import React, { useState, useMemo, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Users, BarChart, Handshake, TrendingDown, ShieldAlert, Tag } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchRequirementsByState, fetchBidsByState, postBid } from '../utils/api';

const BiddingPage = () => {
    const { isLoaded, user } = useUser();
    const { userId } = useAuth();
    const navigate = useNavigate();
    
    // State to hold raw data fetched from the backend
    const [requirements, setRequirements] = useState([]);
    const [bids, setBids] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState(null);
    
    // Local state for bidding UI
    const [activeBidItem, setActiveBidItem] = useState(null);
    const [bidPrice, setBidPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const role = user?.unsafeMetadata?.role;
    const userState = user?.unsafeMetadata?.state;

    // useEffect hook to fetch all necessary data
    useEffect(() => {
        if (isLoaded && userState) {
            const loadData = async () => {
                setIsLoadingData(true);
                try {
                    const [reqResponse, bidsResponse] = await Promise.all([
                        fetchRequirementsByState(userState),
                        fetchBidsByState(userState)
                    ]);
                    setRequirements(reqResponse.data || []);
                    setBids(bidsResponse.data || []);
                } catch (err) {
                    setError("Could not load market data.");
                } finally {
                    setIsLoadingData(false);
                }
            };
            loadData();
        }
    }, [isLoaded, userState]);

    // This effect redirects vendors.
    useEffect(() => {
        if (isLoaded && role === 'vendor') {
            setTimeout(() => { navigate('/home'); }, 3000);
        }
    }, [isLoaded, role, navigate]);

    // --- AGGREGATION LOGIC ---
    const aggregatedDemands = useMemo(() => {
        if (!userState) return {};
        const demands = {};

        requirements
            .filter(req => req.status === 'open')
            .forEach(req => {
                if (!demands[req.item]) {
                    demands[req.item] = { totalQuantity: 0, unit: req.unit, vendorCount: 0, highestPrice: 0 };
                }
                demands[req.item].totalQuantity += req.quantity;
                demands[req.item].vendorCount += 1;
                if(req.price > demands[req.item].highestPrice) {
                    demands[req.item].highestPrice = req.price;
                }
            });
        
        Object.keys(demands).forEach(item => {
            const relevantBids = bids.filter(bid => bid.item === item && bid.state === userState);
            if(relevantBids.length > 0) {
                demands[item].lowestBid = Math.min(...relevantBids.map(b => b.price));
            } else {
                demands[item].lowestBid = null;
            }
        });
        return demands;
    }, [requirements, bids, userState]);


    const handlePlaceBidClick = (item, data) => {
        setActiveBidItem(item);
        setBidPrice(data.lowestBid ? String(data.lowestBid - 0.5) : String(data.highestPrice - 1));
    };

    const handleBidSubmit = async (e, item, currentLowestBid) => {
        e.preventDefault();
        if (!userId || !user) {
            alert("You must be signed in to place a bid.");
            return;
        }

        const priceNum = Number(bidPrice);
        if (currentLowestBid && priceNum >= currentLowestBid) {
            alert(`Your bid must be lower than the current lowest bid of ₹${currentLowestBid}.`);
            return;
        }
        
        setIsSubmitting(true);
        const bidData = {
            item,
            state: user.unsafeMetadata?.state,
            clerkUserId: userId,
            supplierName: user.fullName || 'Anonymous Supplier',
            price: priceNum,
        };

        try {
            const response = await postBid(bidData);
            const updatedOrNewBid = response.data;
            alert(`Bid Placed Successfully!`);

            // Update the local bids state to reflect the change
            setBids(prevBids => {
                const existingBidIndex = prevBids.findIndex(bid => bid._id === updatedOrNewBid._id);
                if (existingBidIndex > -1) {
                    // If the bid was updated, replace it in the array
                    const newBids = [...prevBids];
                    newBids[existingBidIndex] = updatedOrNewBid;
                    return newBids;
                } else {
                    // If it was a new bid, add it to the array
                    return [...prevBids, updatedOrNewBid];
                }
            });

            setActiveBidItem(null);
            setBidPrice('');
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Could not place your bid.";
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDER LOGIC ---
    if (!isLoaded || isLoadingData) {
        return <div className="flex justify-center items-center p-10"><LoadingSpinner /></div>;
    }
    if (error) {
        return <div className="text-center text-red-500 p-10">{error}</div>
    }
    if (role === 'vendor') {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-10 px-6 bg-red-50 border border-red-200 rounded-lg shadow-md">
                    <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-4 text-xl font-semibold text-red-800">Access Denied</h3>
                    <p className="text-red-600 mt-2">This page is only for suppliers. Redirecting...</p>
                </div>
            </div>
        );
    }
    if (role === 'supplier') {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Live Bidding Arena</h1>
                    <p className="text-lg text-gray-600 mt-1">
                        Aggregated demands from vendors in <span className="font-semibold text-purple-700">{userState || 'your state'}</span>.
                    </p>
                </div>
                <div className="space-y-6">
                    {Object.keys(aggregatedDemands).length > 0 ? Object.entries(aggregatedDemands).map(([item, data]) => (
                        <div key={item} className="bg-white p-6 rounded-lg shadow-md transition-shadow hover:shadow-lg">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div className="flex-1">
                                    <h2 className="font-bold text-gray-800 text-xl">{item}</h2>
                                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
                                        <span className="flex items-center"><Tag className="w-4 h-4 mr-1.5 text-gray-400"/>Total Demand: <b className="ml-1">{data.totalQuantity} {data.unit}</b></span>
                                        <span className="flex items-center"><Users className="w-4 h-4 mr-1.5 text-gray-400"/>From <b className="ml-1">{data.vendorCount} Vendors</b></span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Highest vendor expectation: ₹{data.highestPrice}/{data.unit}</p>
                                </div>
                                <div className="w-full md:w-auto mt-4 md:mt-0 md:text-right">
                                    <p className="text-sm text-gray-500 flex items-center md:justify-end"><TrendingDown className="mr-1 text-green-500" /> Lowest Bid</p>
                                    <p className="text-3xl font-bold text-green-600">{data.lowestBid ? `₹${data.lowestBid}` : 'No Bids Yet'}</p>
                                    <button onClick={() => handlePlaceBidClick(item, data)} className="mt-2 bg-purple-600 text-white py-2 px-5 rounded-lg font-semibold hover:bg-purple-700 transition text-sm">
                                        Place a Bid
                                    </button>
                                </div>
                            </div>
                            {activeBidItem === item && (
                                <form onSubmit={(e) => handleBidSubmit(e, item, data.lowestBid)} className="mt-4 pt-4 border-t border-gray-200">
                                    <h3 className="font-semibold mb-2 text-gray-700">Your Offer for {item}</h3>
                                    <div className="flex flex-wrap items-end gap-4">
                                        <div>
                                            <label htmlFor="bidPrice" className="block text-sm font-medium text-gray-700">Your Offer Price (per {data.unit})</label>
                                            <input type="number" id="bidPrice" value={bidPrice} onChange={e => setBidPrice(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" required step="0.01" />
                                        </div>
                                        <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center disabled:bg-green-300">
                                            <Handshake className="w-4 h-4 mr-2"/>{isSubmitting ? 'Submitting...' : 'Submit Bid'}
                                        </button>
                                        <button type="button" onClick={() => setActiveBidItem(null)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )) : (
                        <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-gray-700">No Active Requirements</h3>
                            <p className="text-gray-500 mt-2">There are no open requirements from vendors in your state.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-10 px-6 bg-gray-100 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-700">Authorizing...</h3>
                <p className="text-gray-500 mt-2">Please wait while we verify your role.</p>
            </div>
        </div>
    );
};

export default BiddingPage;
