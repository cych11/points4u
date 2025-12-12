import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function UserTransactionsPage() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            const token = localStorage.getItem("token");
            try {
                // Default fetching page 1, limit 50 for now
                const response = await fetch(`${BACKEND_URL}/users/me/transactions?limit=50`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setTransactions(data.transactions || []);
                } else {
                    setError("Failed to load transactions.");
                }
            } catch (err) {
                setError("Network error: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
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
        <div className="p-10 max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/user')}
                className="mb-4 text-gray-600 hover:text-gray-900 underline"
            >
                &larr; Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold mb-6">My Transactions</h1>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && transactions.length === 0 && (
                <p className="text-gray-500 italic">No transactions found.</p>
            )}

            <div className="space-y-4">
                {transactions.map((tx) => (
                    <div
                        key={tx.id}
                        className={`p-4 rounded-lg shadow-sm border ${getTypeColor(tx.type)} flex justify-between items-center transition hover:shadow-md`}
                    >
                        <div>
                            <span className="font-bold uppercase text-xs tracking-wider block mb-1 opacity-75">{tx.type}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm bg-white/50 px-1 rounded">#{tx.id}</span>
                                <span className="font-medium">{tx.remark || "No remark"}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>

                        <div className="text-right">
                            {/* Showing points change if available, or amount */}
                            {tx.type === 'purchase' && (
                                <div className="text-lg font-bold">+{tx.earned} pts</div>
                            )}
                            {tx.type === 'redemption' && (
                                <div className="text-lg font-bold text-red-600">-{tx.amount} pts</div>
                            )}
                            {tx.type === 'adjustment' && (
                                <div className={`text-lg font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount} pts
                                </div>
                            )}

                            {/* Validating if 'spent' exists for purchase to show dollar amount */}
                            {tx.spent !== undefined && tx.spent !== null && (
                                <div className="text-xs text-gray-500">Spent: ${tx.spent.toFixed(2)}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
