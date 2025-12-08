import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext.jsx';

export default function CashierHomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const cardClass = "bg-white border p-8 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition flex flex-col justify-center h-48 group";
    const titleClass = "text-xl font-bold text-gray-800 group-hover:text-blue-600 mb-2";
    const descClass = "text-gray-500 text-sm";

    return (
        <div className="p-10 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-8 rounded-2xl shadow-sm border">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Cashier Dashboard</h1>
                    <p className="text-gray-500 mt-1">Ready to process orders.</p>
                </div>
                <div className="mt-6 md:mt-0 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium text-sm">
                    Role: {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Cashier'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Card 1: Create Transaction */}
                <div
                    onClick={() => navigate('/cashier/create-transaction')}
                    className={cardClass}
                >
                    <h2 className={titleClass}>New Sale</h2>
                    <p className={descClass}>Process a new customer purchase.</p>
                </div>

                {/* Card 2: Process Redemption */}
                <div
                    onClick={() => navigate('/cashier/process-redemption')}
                    className={cardClass}
                >
                    <h2 className={titleClass}>Redeem Points</h2>
                    <p className={descClass}>Apply points for a discount.</p>
                </div>

                {/* Card 3: Create User */}
                <div
                    onClick={() => navigate('/cashier/create-user')}
                    className={cardClass}
                >
                    <h2 className={titleClass}>Register Customer</h2>
                    <p className={descClass}>Create a new loyalty account.</p>
                </div>
            </div>
        </div>
    );
}
