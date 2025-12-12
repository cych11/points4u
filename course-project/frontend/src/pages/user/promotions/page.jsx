import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function UserPromotionsPage() {
    const navigate = useNavigate();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPromotions = async () => {
            const token = localStorage.getItem("token");
            try {
                // Fetching active promotions. 
                // The backend controller for getPromotions allows filtering.
                // We'll fetch all and filter in frontend or backend.
                // Let's assume fetching all active ones is default or we just fetch page 1.
                // Assuming standard pagination, let's just get the default list.
                const response = await fetch(`${BACKEND_URL}/api/promotions?limit=100`, { // Get a reasonable number
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Backend returns { count, results: [...] }
                    setPromotions(data.results || data.promotions || []);
                } else {
                    // Start or End date handling might cause 400s if parameters are weird, but plain GET should be fine.
                    const err = await response.json();
                    setError(err.message || "Failed to load promotions");
                }
            } catch (err) {
                setError("Network error: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className="p-10 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Promotions</h1>
                    <p className="text-gray-500 mt-1">Discover our latest deals and rewards.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading promotions...</div>
            ) : error ? (
                <div className="text-center py-20 text-red-500">{error}</div>
            ) : promotions.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-gray-500 text-lg">No active promotions at the moment.</p>
                    <p className="text-gray-400">Check back later!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {promotions.map(promo => (
                        <div key={promo.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full">
                            <div className={`h-2 ${promo.type === 'discount' ? 'bg-green-500' : 'bg-purple-500'}`} />
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide ${promo.type === 'discount' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                                        }`}>
                                        {promo.type}
                                    </span>
                                    {/* Status Badge based on dates could go here */}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{promo.name}</h3>
                                <p className="text-gray-600 text-sm mb-4 flex-1">{promo.description}</p>

                                <div className="bg-gray-50 p-4 rounded-lg mt-auto">
                                    {promo.type === 'discount' && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500">Discount Rate</span>
                                            <span className="text-lg font-bold text-green-600">{promo.rate * 100}% OFF</span>
                                        </div>
                                    )}
                                    {promo.type === 'point_bonus' && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500">Bonus Points</span>
                                            <span className="text-lg font-bold text-purple-600">+{promo.points} pts</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t text-xs text-gray-400 flex justify-between items-center">
                                    <span>Valid: {formatDate(promo.startTime)} - {formatDate(promo.endTime)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
