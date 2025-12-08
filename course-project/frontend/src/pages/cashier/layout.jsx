import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"
import RoleSwitcher from "@/components/RoleSwitcher.jsx";

const navLinkCSS = 'px-4 h-[37px] flex items-center rounded-md hover:bg-neutral-100 transition-colors cursor-pointer text-xl font-medium';

export default function CashierLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    // If path is /cashier, split('/').pop() is 'cashier'.
    const active = location.pathname.split("/").pop();

    return (
        <div>
            <div className='flex p-2 border-b space-x-8 pl-6 text-3xl'>
                <h2 className="flex items-center">Cashier View</h2>
                <NavigationMenu>
                    <NavigationMenuList>
                        {/* Dashboard */}
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={`${navLinkCSS} ${active === 'cashier' ? "bg-blue-100 text-blue-900" : ""}`}
                                onClick={() => navigate('/cashier')}
                            >
                                Dashboard
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        {/* Create Transaction */}
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={`${navLinkCSS} ${active === 'create-transaction' ? "bg-blue-100 text-blue-900" : ""}`}
                                onClick={() => navigate('/cashier/create-transaction')}
                            >
                                Purchase
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        {/* Process Redemption */}
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={`${navLinkCSS} ${active === 'process-redemption' ? "bg-blue-100 text-blue-900" : ""}`}
                                onClick={() => navigate('/cashier/process-redemption')}
                            >
                                Redemption
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        {/* Create User */}
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={`${navLinkCSS} whitespace-nowrap ${active === 'create-user' ? "bg-blue-100 text-blue-900" : ""}`}
                                onClick={() => navigate('/cashier/create-user')}
                            >
                                Create User
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        {/* Promotions */}
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={`${navLinkCSS} ${active === 'promotions' ? "bg-blue-100 text-blue-900" : ""}`}
                                onClick={() => navigate('/cashier/promotions')}
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
