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

const eventPages = ['create-events', 'display-events', 'manage-event', 'event-users'];
const navLinkCSS = 'block px-4 py-2 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer text-2xl font-medium';

export default function ManagerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname.split("/").pop();

  return (
    <div>
      <div className="bg-gray-50 border-b py-2">
        <RoleSwitcher />
      </div>
      <div className='flex p-2 border-b space-x-8 pl-6 text-3xl'>
        <h2 className="flex items-center">Manager View</h2>

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
              <NavigationMenuLink
                className={`${navLinkCSS} ${active === 'profile' ? "bg-blue-100 text-blue-900" : ""}`}
                onClick={() => navigate('/user/profile')}
              >
                Profile
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
