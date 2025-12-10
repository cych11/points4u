{/* Majority of this file was generated with GitHub Co-Pilot to help with speed of development */}
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navLinkCSS = 'px-4 py-3 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer font-medium block w-full text-left';

export default function CashierHamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname.split("/").pop();
  const { logout } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-neutral-100 transition-colors"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
            <div className="py-2">
              <button
                onClick={() => handleNavigation('/cashier')}
                className={`${navLinkCSS} ${
                  active === 'cashier'
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-neutral-900'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => handleNavigation('/cashier/create-transaction')}
                className={`${navLinkCSS} ${
                  active === 'create-transaction'
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-neutral-900'
                }`}
              >
                Purchase
              </button>

              <button
                onClick={() => handleNavigation('/cashier/process-redemption')}
                className={`${navLinkCSS} ${
                  active === 'process-redemption'
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-neutral-900'
                }`}
              >
                Redemption
              </button>

              <button
                onClick={() => handleNavigation('/cashier/create-user')}
                className={`${navLinkCSS} ${
                  active === 'create-user'
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-neutral-900'
                }`}
              >
                Create User
              </button>

              <button
                onClick={() => handleNavigation('/cashier/promotions')}
                className={`${navLinkCSS} ${
                  active === 'promotions'
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-neutral-900'
                }`}
              >
                Promotions
              </button>

              <button
                onClick={() => handleNavigation('/user/profile')}
                className={`${navLinkCSS} ${
                  active === 'profile'
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-neutral-900'
                }`}
              >
                Profile
              </button>

              <div className="border-t border-neutral-200 my-2">
                <button
                  onClick={handleLogout}
                  className={`${navLinkCSS} text-neutral-900`}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
