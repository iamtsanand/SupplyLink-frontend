import React, { useState, useEffect, useMemo } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import VendorDashboard from '../components/VendorDashboard';
import SupplierDashboard from '../components/SupplierDashboard';
import LoadingSpinner from '../components/LoadingSpinner';
import PastDeals from '../components/PastDeals'; // Import the new component
import { fetchRequirementsByState, fetchBidsByState, fetchPastDeals } from '../utils/api'; // Import fetchPastDeals

export const HomePage = () => {
    const { isLoaded, user } = useUser();
    const { userId } = useAuth();
    
    const [requirements, setRequirements] = useState([]);
    const [bids, setBids] = useState([]);
    const [pastDeals, setPastDeals] = useState([]); // Add state for past deals
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState(null);

    const pincode = user?.unsafeMetadata?.pincode;
    const state = user?.unsafeMetadata?.state;

    useEffect(() => {
        if (isLoaded && state) {
            const loadData = async () => {
                setIsLoadingData(true);
                try {
                    const [reqResponse, bidsResponse, dealsResponse] = await Promise.all([
                        fetchRequirementsByState(state),
                        fetchBidsByState(state),
                        fetchPastDeals() // Fetch past deals
                    ]);
                    
                    setRequirements(reqResponse.data || []);
                    setBids(bidsResponse.data || []);
                    setPastDeals(dealsResponse.data || []);
                } catch (err) {
                    setError("Could not load market data.");
                } finally {
                    setIsLoadingData(false);
                }
            };
            loadData();
        } else if (isLoaded) {
            setIsLoadingData(false);
        }
    }, [isLoaded, state]);

    const handleRequirementSubmit = (newRequirement) => {
        setRequirements(prevRequirements => [...prevRequirements, newRequirement]);
    };

    const handleBidSubmit = (newBid) => {
        setBids(prevBids => {
            const existingBidIndex = prevBids.findIndex(b => b._id === newBid._id);
            if (existingBidIndex > -1) {
                const updatedBids = [...prevBids];
                updatedBids[existingBidIndex] = newBid;
                return updatedBids;
            }
            return [...prevBids, newBid];
        });
    };

    const aggregatedDemands = useMemo(() => {
        if (!state) return {};
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
            const relevantBids = bids.filter(bid => bid.item === item && bid.state === state);
            if(relevantBids.length > 0) {
                demands[item].lowestBid = Math.min(...relevantBids.map(b => b.price));
            } else {
                demands[item].lowestBid = null;
            }
        });
        return demands;
    }, [requirements, bids, state]);

    const supplierPersonalDemands = useMemo(() => {
        if (!userId) return {};
        const myBidItems = new Set(bids.filter(b => b.clerkUserId === userId).map(b => b.item));
        return Object.entries(aggregatedDemands)
            .filter(([item]) => myBidItems.has(item))
            .reduce((acc, [item, data]) => {
                acc[item] = data;
                return acc;
            }, {});
    }, [aggregatedDemands, bids, userId]);


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
                        Please update your profile with your full address to post requirements.
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 p-10">{error}</div>
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2">
                    {role === 'vendor' ? (
                        <VendorDashboard 
                            pincode={pincode} 
                            aggregatedDemands={aggregatedDemands}
                            onRequirementSubmit={handleRequirementSubmit}
                        />
                    ) : (
                        <SupplierDashboard 
                            state={state}
                            aggregatedDemands={supplierPersonalDemands}
                            onBidSubmit={handleBidSubmit} 
                        />
                    )}
                </div>

                {/* Scrollable Sidebar for Past Deals */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24"> {/* Adjust top value based on your header height */}
                        <div className="h-[calc(100vh-7rem)] overflow-y-auto pr-4">
                             <PastDeals deals={pastDeals} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
