import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"
import RoleSwitcher from "@/components/RoleSwitcher.jsx";
import UserHamburgerMenu from "@/components/UserHamburgerMenu.jsx";

const navLinkCSS = 'px-4 h-[37px] flex items-center rounded-md hover:bg-neutral-100 transition-colors cursor-pointer text-xl font-medium';

export default function UserLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    // If path is /user, split('/').pop() is 'user'.
    const active = location.pathname.split("/").pop();

    return (
        <div>
            <div className='flex p-2 border-b space-x-4 lg:space-x-8 pl-4 lg:pl-6 items-center'>
                <h2 className="text-2xl lg:text-3xl font-semibold whitespace-nowrap">User View</h2>
                <div className="flex lg:hidden ml-auto gap-4 items-center">
                    <UserHamburgerMenu />
                    <RoleSwitcher />
                </div>
                <div className="hidden lg:flex gap-2 flex-1">
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
                </div>
                <div className='hidden lg:flex items-center'>
                    <RoleSwitcher />
                </div>
            </div>

            <main>
                <Outlet />
            </main>
        </div>
    );
}
