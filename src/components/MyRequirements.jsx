import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchRequirementsByVendor, updateRequirement, deleteRequirement } from '../utils/api';
import { Edit, Trash2, Save, X, Clock } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { isBiddingWindowActive } from '../utils/time'; // Import the time utility

const MyRequirements = () => {
    const { userId } = useAuth();
    const [myRequirements, setMyRequirements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    const biddingActive = isBiddingWindowActive(); // Check if bidding is active

    useEffect(() => {
        if (userId) {
            fetchRequirementsByVendor(userId)
                .then(res => setMyRequirements(res.data))
                .catch(err => console.error("Failed to fetch my requirements", err))
                .finally(() => setIsLoading(false));
        }
    }, [userId]);

    const handleEditClick = (req) => {
        setEditingId(req._id);
        setEditFormData({ item: req.item, quantity: req.quantity, unit: req.unit, price: req.price });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleUpdate = async (id) => {
        try {
            const res = await updateRequirement(id, editFormData);
            setMyRequirements(myRequirements.map(req => req._id === id ? res.data : req));
            setEditingId(null);
            alert("Requirement updated!");
        } catch (error) {
            alert("Failed to update requirement.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this requirement?")) {
            try {
                await deleteRequirement(id);
                setMyRequirements(myRequirements.filter(req => req._id !== id));
                alert("Requirement deleted!");
            } catch (error) {
                alert("Failed to delete requirement.");
            }
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="bg-white p-6 rounded-lg shadow mt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">My Posted Requirements</h3>
                {biddingActive && (
                    <div className="flex items-center text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4 mr-2" />
                        Editing is Disabled During Bidding
                    </div>
                )}
            </div>
            <div className="space-y-4">
                {myRequirements.length > 0 ? myRequirements.map(req => (
                    <div key={req._id} className="p-4 border rounded-lg">
                        {editingId === req._id ? (
                            // --- EDITING VIEW ---
                            <div className="space-y-2">
                                <input value={editFormData.item} onChange={e => setEditFormData({...editFormData, item: e.target.value})} className="w-full p-2 border rounded"/>
                                <div className="flex gap-2">
                                    <input type="number" value={editFormData.quantity} onChange={e => setEditFormData({...editFormData, quantity: e.target.value})} className="w-full p-2 border rounded"/>
                                    <input value={editFormData.unit} onChange={e => setEditFormData({...editFormData, unit: e.target.value})} className="w-full p-2 border rounded"/>
                                    <input type="number" value={editFormData.price} onChange={e => setEditFormData({...editFormData, price: e.target.value})} className="w-full p-2 border rounded"/>
                                </div>
                                <div className="flex justify-end gap-2 mt-2">
                                    <button onClick={() => handleUpdate(req._id)} className="p-2 bg-green-500 text-white rounded hover:bg-green-600"><Save size={18}/></button>
                                    <button onClick={handleCancelEdit} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"><X size={18}/></button>
                                </div>
                            </div>
                        ) : (
                            // --- DISPLAY VIEW ---
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{req.item}</p>
                                    <p className="text-sm text-gray-600">{req.quantity} {req.unit} @ ₹{req.price}/{req.unit}</p>
                                    <p className={`text-xs font-semibold mt-1 ${req.status === 'open' ? 'text-green-600' : 'text-gray-500'}`}>
                                        Status: {req.status}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleEditClick(req)} 
                                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={biddingActive || req.status !== 'open'}
                                        title={biddingActive ? "Editing is disabled during bidding hours." : req.status !== 'open' ? "Cannot edit a closed requirement." : "Edit Requirement"}
                                    >
                                        <Edit size={18}/>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(req._id)} 
                                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={biddingActive || req.status !== 'open'}
                                        title={biddingActive ? "Deleting is disabled during bidding hours." : req.status !== 'open' ? "Cannot delete a closed requirement." : "Delete Requirement"}
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )) : <p className="text-gray-500">You have not posted any requirements yet.</p>}
            </div>
        </div>
    );
};

export default MyRequirements;
