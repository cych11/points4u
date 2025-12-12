import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext.jsx';

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function UserHomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loadingTx, setLoadingTx] = useState(true);

    useEffect(() => {
        const fetchRecentTransactions = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`${BACKEND_URL}/api/users/me/transactions?limit=5`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setTransactions(data.transactions || []);
                }
            } catch (err) {
                console.error("Failed to fetch transactions", err);
            } finally {
                setLoadingTx(false);
            }
        };
        fetchRecentTransactions();
    }, []);

    const getTypeColor = (type) => {
        switch (type) {
            case 'purchase': return 'bg-blue-100 text-blue-800';
            case 'redemption': return 'bg-purple-100 text-purple-800';
            case 'adjustment': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-50';
        }
    };

    return (
        <div className="p-10 max-w-6xl mx-auto">
            {/* Header / Welcome / Balance */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-8 rounded-2xl shadow-sm border">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name || 'User'}!</h1>
                    <p className="text-gray-500 mt-1">Here is your loyalty program overview.</p>
                </div>
                <div className="mt-6 md:mt-0 text-center md:text-right">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Current Balance</p>
                    <p className="text-5xl font-extrabold text-indigo-600">{user?.points || 0} <span className="text-xl text-gray-400 font-normal">pts</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Navigation Cards */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Card 1: View Transactions */}
                        <div
                            onClick={() => navigate('/user/transactions')}
                            className="bg-white border p-8 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition flex flex-col justify-center h-48 group"
                        >
                            <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 mb-2">My Transactions</h2>
                            <p className="text-gray-500 text-sm">View full history of your earnings and redemptions.</p>
                        </div>

                        {/* Card 2: Events */}
                        <div
                            onClick={() => navigate('/user/events')}
                            className="bg-white border p-8 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 cursor-pointer transition flex flex-col justify-center h-48 group"
                        >
                            <h2 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 mb-2">Upcoming Events</h2>
                            <p className="text-gray-500 text-sm">Browse exclusive events and RSVP today.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent Activity Widget */}
                <div className="lg:col-span-1">
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800">Recent Activity</h2>
                            <button onClick={() => navigate('/user/transactions')} className="text-xs font-semibold text-blue-600 hover:text-blue-800 uppercase">View All</button>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
                            {loadingTx ? (
                                <p className="text-center text-gray-400 text-sm py-4">Loading...</p>
                            ) : transactions.length === 0 ? (
                                <p className="text-center text-gray-400 text-sm py-4 italic">No recent transactions.</p>
                            ) : (
                                <div className="space-y-3">
                                    {transactions.map(tx => (
                                        <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border hover:bg-gray-50 transition">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getTypeColor(tx.type)}`}>{tx.type}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                {tx.type === 'purchase' || tx.type === 'adjustment' && tx.amount > 0 ? (
                                                    <span className="font-bold text-green-600">+{tx.type === 'purchase' ? tx.earned : tx.amount}</span>
                                                ) : (
                                                    <span className="font-bold text-red-600">{tx.amount ? (tx.amount > 0 ? `+${tx.amount}` : tx.amount) : `-${tx.amount || 0}`}</span>
                                                )}
                                                <span className="text-xs text-gray-400 ml-1">pts</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
