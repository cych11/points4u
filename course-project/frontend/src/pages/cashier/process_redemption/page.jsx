import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProcessRedemptionPage() {
    const navigate = useNavigate();
    const [transactionId, setTransactionId] = useState('');
    const [fetchedTransaction, setFetchedTransaction] = useState(null);
    const [error, setError] = useState('');

    const handleLookup = async (e) => {
        e.preventDefault();
        setError('');
        setFetchedTransaction(null);

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/transactions/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.type !== 'redemption') {
                    setError("This ID is not a redemption request.");
                } else if (data.processedBy) {
                    // It might appear as processed already
                    setFetchedTransaction(data); // Still show it, but maybe disable approve button
                    setError("This redemption has already been processed.");
                } else {
                    setFetchedTransaction(data);
                }
            } else {
                setError("Transaction not found.");
            }
        } catch (err) {
            setError("Network error: " + err.message);
        }
    };

    const handleApprove = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/transactions/${transactionId}/processed`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ processed: true })
            });

            if (response.ok) {
                alert("Redemption Processed Successfully!");
                navigate('/cashier');
            } else {
                const err = await response.json();
                alert("Error: " + err.message);
            }
        } catch (err) {
            alert("Network error: " + err.message);
        }
    };

    return (
        <div className="p-10 max-w-lg mx-auto">
            <button
                onClick={() => navigate('/cashier')}
                className="mb-4 text-gray-600 hover:text-gray-900 underline"
            >
                &larr; Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold mb-6">Process Redemption</h1>

            {/* Lookup Form */}
            <form onSubmit={handleLookup} className="space-y-4 bg-white p-6 rounded-lg shadow-md border mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="flex-1 border p-2 rounded-md"
                            placeholder="e.g. 101"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                            Look Up
                        </button>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>

            {/* Transaction Details Card */}
            {fetchedTransaction && (
                <div className="bg-gray-50 border p-6 rounded-lg shadow-inner">
                    <h2 className="text-xl font-bold mb-4">Request Details</h2>
                    <div className="space-y-2 mb-6">
                        <p><strong>User:</strong> {fetchedTransaction.utorid}</p>
                        <p><strong>Points to Redeem:</strong> {fetchedTransaction.amount}</p> {/* Usually negative or positive depending on schema, likely stored as field 'amount' */}
                        <p><strong>Status:</strong> {fetchedTransaction.processedBy ? <span className="text-green-600">Processed</span> : <span className="text-yellow-600">Pending</span>}</p>
                    </div>

                    {!fetchedTransaction.processedBy && !error.includes("processed") && (
                        <button
                            onClick={handleApprove}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition duration-200"
                        >
                            Approve Redemption
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
