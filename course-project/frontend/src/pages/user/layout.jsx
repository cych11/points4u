import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"
import RoleSwitcher from "@/components/RoleSwitcher.jsx";

const navLinkCSS = 'block px-4 py-2 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer text-2xl font-medium';

export default function UserLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    // If path is /user, split('/').pop() is 'user'.
    const active = location.pathname.split("/").pop();

    return (
        <div>
            <div className='flex p-2 border-b space-x-8 pl-6 text-3xl'>
                <h2 className="flex items-center">User View</h2>
                <NavigationMenu>
                    <NavigationMenuList>
                        {/* Dashboard */}
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={`${navLinkCSS} ${active === 'user' ? "bg-blue-100 text-blue-900" : ""}`}
                                onClick={() => navigate('/user')}
                            >
                                Dashboard
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        {/* Transactions */}
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={`${navLinkCSS} ${active === 'transactions' ? "bg-blue-100 text-blue-900" : ""}`}
                                onClick={() => navigate('/user/transactions')}
                            >
                                Transactions
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        {/* Events */}
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={`${navLinkCSS} ${active === 'events' ? "bg-blue-100 text-blue-900" : ""}`}
                                onClick={() => navigate('/user/events')}
                            >
                                Events
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        {/* Promotions */}
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={`${navLinkCSS} ${active === 'promotions' ? "bg-blue-100 text-blue-900" : ""}`}
                                onClick={() => navigate('/user/promotions')}
                            >
                                Promotions
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
                <div className='flex items-center flex-1 justify-end pr-12'>
                    <RoleSwitcher />
                </div>
            </div>

            <main>
                <Outlet />
            </main>
        </div>
    );
}
