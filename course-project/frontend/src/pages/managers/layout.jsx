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

const eventPages = ['create-events', 'display-events', 'manage-event', 'event-users'];
const navLinkCSS = 'block px-4 py-2 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer text-sm font-medium';

export default function ManagerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname.split("/").pop();

  return (
    <div>
      <div className='flex p-2 border-b space-x-8 pl-6'>
        <h2 className="flex items-center">Manager View</h2>

        <NavigationMenu>
          <NavigationMenuList>

            {/* Events dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={`px-4 rounded-md transition-colors w-full
                  ${eventPages.includes(active)
                    ? "bg-blue-100 text-blue-900"
                    : "hover:bg-neutral-50"}
                `}
              >
                Events
              </NavigationMenuTrigger>

              <NavigationMenuContent className="w-[300px]">
                <div className="p-2 whitespace-nowrap">

                  <NavigationMenuLink
                    className={`${navLinkCSS} ${active === 'create-events' ? "bg-blue-100 text-blue-900" : ""}`}
                    onClick={() => navigate('/managers/create-events')}
                  >
                    Create Event
                  </NavigationMenuLink>

                  <NavigationMenuLink
                    className={`${navLinkCSS} ${active === 'display-events' ? "bg-blue-100 text-blue-900" : ""}`}
                    onClick={() => navigate('/managers/display-events')}
                  >
                    View Events
                  </NavigationMenuLink>

                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

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

            {/* Logout */}
            <NavigationMenuItem>
              <NavigationMenuLink
                className={`${navLinkCSS}`}
                onClick={logout}
              >
                Logout
              </NavigationMenuLink>
            </NavigationMenuItem>

          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
