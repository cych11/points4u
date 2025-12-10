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

const eventPages = ['create-events', 'display-events', 'manage-event', 'event-users', 'manage-permissions'];
const navLinkCSS = 'px-4 h-[37px] flex items-center rounded-md hover:bg-neutral-100 transition-colors cursor-pointer text-xl font-medium';

export default function ManagerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const splitURL = location.pathname.split("/")
  const active = splitURL[splitURL.length - 1];
  const active2 = splitURL[splitURL.length - 2];

  return (
    <div>
      <div className='flex p-2 border-b space-x-8 pl-6 text-3xl'>
        <h2 className="flex items-center">Manager View</h2>
        <div className="flex justify-between flex-1">
          <div className='flex'>
            <NavigationMenu>
              <NavigationMenuList>
                {/* Dashboard */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={`${navLinkCSS} ${active === 'managers' ? "bg-blue-100 text-blue-900" : ""}`}
                    onClick={() => navigate('/managers')}
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
              </NavigationMenuList>
            </NavigationMenu>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={`${navLinkCSS} ${eventPages.includes(active) || eventPages.includes(active2) ? 'bg-blue-100 text-blue-900' : 'hover:bg-neutral-50'}`}>
                    {active === 'create-events' ? 'Create Event' : active === 'display-events' ? 'Event Display' : active2 === 'manage-event' ? 'Manage Event' : active === 'event-users' ? 'Event Users' : 'Events'}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="w-[300px]">
                    <div className="p-2 whitespace-nowrap">
                      <NavigationMenuLink className={navLinkCSS} onClick={() => {
                        // setPage('create-events');
                        navigate('/managers/create-events');
                      }}>
                        Create Event
                      </NavigationMenuLink>
                      <NavigationMenuLink className={navLinkCSS} onClick={() => {
                        // setPage('display-events');
                        navigate('/managers/display-events');
                      }}>
                        View Events
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className='flex items-center pr-12'>
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
