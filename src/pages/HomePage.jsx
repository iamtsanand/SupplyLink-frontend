import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import VendorDashboard from '../components/VendorDashboard';
import SupplierDashboard from '../components/SupplierDashboard';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchRequirementsByState, fetchBidsByState } from '../utils/api'; // Import the new API functions

export const HomePage = () => {
    const { isLoaded, user } = useUser();
    
    // State to hold data fetched from the backend
    const [requirements, setRequirements] = useState([]);
    const [bids, setBids] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState(null);

    const pincode = user?.unsafeMetadata?.pincode;
    const state = user?.unsafeMetadata?.state;

    useEffect(() => {
        // Only fetch data if Clerk has loaded and the user has a state
        if (isLoaded && state) {
            const loadData = async () => {
                setIsLoadingData(true);
                try {
                    // Fetch requirements and bids for the user's state
                    const [reqResponse, bidsResponse] = await Promise.all([
                        fetchRequirementsByState(state),
                        fetchBidsByState(state)
                    ]);
                    
                    setRequirements(reqResponse.data || []);
                    setBids(bidsResponse.data || []);
                } catch (err) {
                    console.error("Failed to fetch data from backend:", err);
                    setError("Could not load market data. Please try again later.");
                } finally {
                    setIsLoadingData(false);
                }
            };
            loadData();
        } else if (isLoaded) {
            // If user is loaded but has no state, stop loading
            setIsLoadingData(false);
        }
    }, [isLoaded, state]); // Rerun this effect if the user or state changes

    const handleRequirementSubmit = (newRequirement) => {
        setRequirements(prevRequirements => [...prevRequirements, newRequirement]);
    };

    const handleBidSubmit = (newBid) => {
        setBids(prevBids => [...prevBids, newBid]);
    };

    if (!isLoaded || isLoadingData) {
        return <div className="flex justify-center items-center p-10"><LoadingSpinner /></div>;
    }

    const role = user?.unsafeMetadata?.role || 'vendor';

    if (role === 'vendor' && (!pincode || !state)) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-10 px-6 bg-yellow-50 border border-yellow-200 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-yellow-800">Complete Your Profile</h3>
                    <p className="text-yellow-700 mt-2">
                        Please update your profile with your full address, including pincode and state, to post requirements.
                    </p>
                </div>
            </div>
        );
    }

    const getAggregatedDemands = (currentUserState, currentUserPincode) => {
        const demands = {};
        const relevantRequirements = role === 'vendor' 
            ? requirements.filter(req => req.pincode === currentUserPincode)
            : requirements; // Suppliers see all requirements in the state

        relevantRequirements
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
        
        // **CORRECTED LOGIC:** This now correctly finds the lowest bid by matching the item and state.
        Object.keys(demands).forEach(item => {
            const relevantBids = bids.filter(bid => bid.item === item && bid.state === currentUserState);
            if(relevantBids.length > 0) {
                demands[item].lowestBid = Math.min(...relevantBids.map(b => b.price));
            } else {
                demands[item].lowestBid = null;
            }
        });
        return demands;
    };

    const aggregatedDemands = getAggregatedDemands(state, pincode);

    if (error) {
        return <div className="text-center text-red-500 p-10">{error}</div>
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {role === 'vendor' ? (
                <VendorDashboard 
                    pincode={pincode} // **FIXED:** Pass pincode to VendorDashboard
                    aggregatedDemands={aggregatedDemands}
                    onRequirementSubmit={handleRequirementSubmit}
                />
            ) : (
                <SupplierDashboard 
                    state={state} // Pass state to SupplierDashboard
                    aggregatedDemands={aggregatedDemands}
                    onBidSubmit={handleBidSubmit} 
                />
            )}
        </div>
    );
};
