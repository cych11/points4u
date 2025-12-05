import { Outlet, useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { useContext } from "react";
import { PageContext } from "../contexts/PageContext.jsx";
import { useAuth } from "../../../contexts/AuthContext.jsx";

const managerEventPages = ['dashboard', 'create-events', 'display-events', 'manage-event', 'event-users'];

const navLinkCSS = 'block px-4 py-2 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer text-sm font-medium';

export default function ManagerDashboardPage() {
  const { user, logout } = useAuth();
  const { page, setPage } = useContext(PageContext);
  const navigate = useNavigate();
  return (
    <div>
      <main>
        <Outlet />
        <div className="p-4 justify-center items-center grid grid-cols-2">
          <div className="flex flex-col items-center justify-center p-4 w-full">
            {user ? (
              <>
                <div className="flex flex-col items-center justify-center border-2 border-gray-300 rounded-md p-4">
                  <h1 className="text-2xl font-bold">User Info</h1>
                  <p className="text-lg">Welcome, {user.name}</p>
                  <p className="text-lg">UTORid: {user.utorid}</p>
                  <p className="text-lg">Email: {user.email}</p>
                  <p className="text-lg">Role: {user.role}</p>
                </div>
                <div className="flex flex-col items-center justify-center border-2 border-gray-300 rounded-md p-4">
                  <h1>Your Points</h1>
                  <p className="text-lg">Points: {user.points}</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-gray-300 rounded-md p-4">
                <p className="text-lg">Loading user information...</p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <div className="flex flex-col p-4 text-xl w-full gap-8">
              <a
                className="flex flex-col border-2 rounded-md p-6 w-full hover:bg-neutral-100"
                href="/managers/display-users"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="font-bold text-3xl">Users</h1>
                    <h3 className="text-s">View and edit user's information</h3>
                  </div>
                  <div>
                    <div className="ml-4 shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7">
                        </path>
                      </svg>
                    </div>
                  </div>
                </div>
              </a>

              <a
                className="flex flex-col border-2 rounded-md p-6 w-full hover:bg-neutral-100"
                href="/managers/display-events"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="font-bold text-3xl">Transactions</h1>
                    <h3 className="text-s">View and adjust transactions</h3>
                  </div>
                  <div>
                    <div className="ml-4 shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7">
                        </path>
                      </svg>
                    </div>
                  </div>
                </div>
              </a>

              <a
                className="flex flex-col border-2 rounded-md p-6 w-full hover:bg-neutral-100"
                href="/managers/display-events"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="font-bold text-3xl">Promotions</h1>
                    <h3 className="text-s">Create, view, edit, delete promotions</h3>
                  </div>
                  <div>
                    <div className="ml-4 shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7">
                        </path>
                      </svg>
                    </div>
                  </div>
                </div>
              </a>

              <a
                className="flex flex-col border-2 rounded-md p-6 w-full hover:bg-neutral-100"
                href="/managers/display-events"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="font-bold text-3xl">Events</h1>
                    <h3 className="text-s">Create, view, edit, delete events</h3>
                  </div>
                  <div>
                    <div className="ml-4 shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7">
                        </path>
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            </div>

          </div>
        </div>

      </main>
    </div>
  )
}