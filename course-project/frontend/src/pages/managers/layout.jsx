import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import RoleSwitcher from "@/components/RoleSwitcher.jsx";
import { useContext } from "react";
import { PageContext } from "./contexts/PageContext.jsx";

const eventPages = ['create-events', 'display-events', 'manage-event', 'event-users', 'manage-permissions'];
const navLinkCSS = 'block px-4 py-2 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer text-2xl font-medium';

export default function ManagerLayout() {
  const { user, logout } = useAuth();
  const { page, setPage } = useContext(PageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname.split("/").pop();

  return (
    <div>
      <div className='flex p-2 border-b space-x-8 pl-6 text-3xl'>
        <h2 className="flex items-center">{true === true ? 'Manager View' : true === true ? 'Event Organizer View' : 'Superuser View'}</h2>
        <div className='flex justify-between w-[80%]'>
          <NavigationMenu>
            <NavigationMenuList>
              {/* Dashboard */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={`${navLinkCSS} ${active === 'dashboard' ? "bg-blue-100 text-blue-900" : ""}`}
                  onClick={() => navigate('/managers/dashboard')}
                >
                  Dashboard
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Users */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={`${navLinkCSS} ${active === 'display-users' ? "bg-blue-100 text-blue-900" : ""}`}
                  onClick={() => navigate('/managers/display-users')}
                >
                  Users
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Transactions */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={`${navLinkCSS} ${active === 'display-transactions' ? "bg-blue-100 text-blue-900" : ""}`}
                  onClick={() => navigate('/managers/display-transactions')}
                >
                  Transactions
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Promotions */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={`${navLinkCSS} ${active === 'display-promotions' ? "bg-blue-100 text-blue-900" : ""}`}
                  onClick={() => navigate('/managers/display-promotions')}
                >
                  Promotions
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Events dropdown */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={`${navLinkCSS} ${active === 'display-events' ? "bg-blue-100 text-blue-900" : ""}`}
                  onClick={() => navigate('/managers/display-events')}
                >
                  Events
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Profile */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={`px-4 rounded-md transition-colors ${eventPages.includes(page) ? 'bg-blue-100 text-blue-900' : 'hover:bg-neutral-50'}`}>
                  {page === 'create-events' ? 'Create Event' : page === 'display-events' ? 'Event Display' : page === 'manage-event' ? 'Manage Event' : page === 'event-users' ? 'Event Users' : 'Events'}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="w-[300px]">
                  <div className="p-2 whitespace-nowrap">
                    <NavigationMenuLink className={navLinkCSS} onClick={() => {
                      setPage('create-events');
                      navigate('/managers/create-events');
                    }}>
                      Create Event
                    </NavigationMenuLink>
                    <NavigationMenuLink className={navLinkCSS} onClick={() => {
                      setPage('display-events');
                      navigate('/managers/display-events');
                    }}>
                      View Events
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
          <div className='flex items-center'>
              <RoleSwitcher />
          </div>
        </div>
      </div>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
