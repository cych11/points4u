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
import { PageContext } from "./contexts/PageContext.jsx";

const managerEventPages = ['create-events', 'display-events', 'manage-event', 'event-users'];

const navLinkCSS = 'block px-4 py-2 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer text-sm font-medium';

export default function ManagerLayout() {
  const { page, setPage } = useContext(PageContext);
  const navigate = useNavigate();
  return (
    <div>
      <div className='flex p-2 border-b space-x-8 pl-6'>
        <h2 className="flex items-center">Manager View</h2>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className={`px-4 rounded-md transition-colors ${managerEventPages.includes(page) ? 'bg-blue-100 text-blue-900' : 'hover:bg-neutral-50'}`}>
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
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  )
}