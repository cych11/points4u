import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RoleSwitcher() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!user) return null;

    const { role } = user;
    const currentPath = location.pathname;

    const isSuperuser = role === 'superuser';
    const isManager = role === 'manager';
    const isCashier = role === 'cashier';

    // Everyone can access User view
    const showUser = true;
    // Super, Manager, Cashier can access Cashier view
    const showCashier = isSuperuser || isManager || isCashier;
    // Super, Manager can access Manager view
    const showManager = isSuperuser || isManager;

    const isInUserView = currentPath.startsWith('/user');
    const isInCashierView = currentPath.startsWith('/cashier');
    const isInManagerView = currentPath.startsWith('/managers');

    const buttonClass = (isActive) =>
        `px-3 py-1 text-sm font-medium rounded-md transition-colors ${isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
        }`;

    return (
        <div className="flex gap-2 mb-4 justify-center print:hidden">
            {showManager && (
                <button
                    onClick={() => navigate('/managers/dashboard')}
                    className={buttonClass(isInManagerView)}
                >
                    Manager View
                </button>
            )}
            {showCashier && (
                <button
                    onClick={() => navigate('/cashier')}
                    className={buttonClass(isInCashierView)}
                >
                    Cashier View
                </button>
            )}
            {showUser && (
                <button
                    onClick={() => navigate('/user')}
                    className={buttonClass(isInUserView)}
                >
                    User View
                </button>
            )}
        </div>
    );
}
