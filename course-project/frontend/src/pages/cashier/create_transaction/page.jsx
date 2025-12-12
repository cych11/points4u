import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function CreateTransactionPage() {
    const navigate = useNavigate();
    // Cashiers can ONLY do purchases now
    const [utorid, setUtorid] = useState('');
    const [value, setValue] = useState(''); // This is 'spent'
    const [remark, setRemark] = useState('');
    const [promotionIds, setPromotionIds] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting Purchase:", { utorid, value, remark, promotionIds });

        const token = localStorage.getItem("token");

        // Simple validation
        if (parseFloat(value) < 0) {
            alert("Error: Amount Spent cannot be negative.");
            return;
        }

        // Parse promotion IDs
        const promoArray = promotionIds
            .split(',')
            .map(id => parseInt(id.trim()))
            .filter(id => !isNaN(id));

        const payload = {
            type: 'purchase',
            utorid,
            remark,
            spent: parseFloat(value),
            promotionIds: promoArray
        };

        try {
            const response = await fetch(`${BACKEND_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Purchase recorded successfully!");
                navigate('/cashier');
            } else {
                const err = await response.json();
                alert("Error: " + err.message);
            }
        } catch (error) {
            alert("Network error: " + error.message);
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
            <h1 className="text-3xl font-bold mb-6">Record New Purchase</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md border">

                {/* UtorID Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User UtorID <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={utorid}
                        onChange={(e) => setUtorid(e.target.value)}
                        className="w-full border p-2 rounded-md"
                        placeholder="e.g. smithj"
                        required
                    />
                </div>

                {/* Amount Spent Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Spent ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full border p-2 rounded-md"
                        placeholder="10.50"
                        required
                    />
                </div>

                {/* Promotion IDs Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promotion IDs (Optional)</label>
                    <input
                        type="text"
                        value={promotionIds}
                        onChange={(e) => setPromotionIds(e.target.value)}
                        className="w-full border p-2 rounded-md"
                        placeholder="e.g. 5, 10, 15"
                    />
                </div>

                {/* Remark Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remark (Optional)</label>
                    <input
                        type="text"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        className="w-full border p-2 rounded-md"
                        placeholder="e.g. Coffee purchase"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition duration-200"
                >
                    Record Purchase
                </button>

            </form>
        </div>
    );
}