{/* Majority of this file was generated with GitHub Co-Pilot to help with speed of development */}
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navLinkCSS = 'px-4 py-3 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer font-medium block w-full text-left';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const splitURL = location.pathname.split("/");
  const active = splitURL[splitURL.length - 1];
  const active2 = splitURL[splitURL.length - 2];
  const eventPages = ['create-events', 'display-events', 'manage-event', 'event-users', 'manage-permissions'];

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const isEventActive = eventPages.includes(active) || eventPages.includes(active2);

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
                onClick={() => handleNavigation('/managers')}
                className={`${navLinkCSS} ${
                  active === 'managers'
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-neutral-900'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => handleNavigation('/managers/display-users')}
                className={`${navLinkCSS} ${
                  active === 'display-users'
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-neutral-900'
                }`}
              >
                Users
              </button>

              <button
                onClick={() => handleNavigation('/managers/display-transactions')}
                className={`${navLinkCSS} ${
                  active === 'display-transactions'
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-neutral-900'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => handleNavigation('/managers/display-promotions')}
                className={`${navLinkCSS} ${
                  active === 'display-promotions'
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-neutral-900'
                }`}
              >
                Promotions
              </button>
              <div className="border-t border-neutral-200 my-2">
                <div
                  className={`${navLinkCSS} ${
                    isEventActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-neutral-900'
                  }`}
                >
                  {active === 'create-events'
                    ? 'Create Event'
                    : active === 'display-events'
                    ? 'Event Display'
                    : active2 === 'manage-event'
                    ? 'Manage Event'
                    : 'Events'}
                </div>
                <button
                  onClick={() => handleNavigation('/managers/create-events')}
                  className={`${navLinkCSS} ml-2 text-sm ${
                    active === 'create-events'
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-neutral-700 hover:text-neutral-900'
                  }`}
                >
                  Create Event
                </button>
                <button
                  onClick={() => handleNavigation('/managers/display-events')}
                  className={`${navLinkCSS} ml-2 text-sm ${
                    active === 'display-events'
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-neutral-700 hover:text-neutral-900'
                  }`}
                >
                  View Events
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
