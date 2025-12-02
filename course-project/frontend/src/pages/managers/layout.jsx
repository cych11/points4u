import { Outlet } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { useContext } from "react";
import { PageContext } from "./contexts/PageContext.jsx";

export default function ManagerLayout() {
  const { page } = useContext(PageContext);
  return (
    <div>
      <div className='flex p-2 border-b space-x-4 pl-6'>
        <h2 className="flex items-center">Manager View</h2>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className={`${page === 'create-events' ? 'bg-neutral-100' : ''}`}>Create Events</NavigationMenuTrigger>
              {/* <NavigationMenuContent>
                <NavigationMenuLink>Link</NavigationMenuLink>
              </NavigationMenuContent> */}
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  )
}