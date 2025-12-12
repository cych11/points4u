import { useEffect, useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PopoverClose } from "@radix-ui/react-popover"

const BACKEND_URL = import.meta.env.VITE_API_URL;

const mockUsers = [
  { 
    id: 1, 
    utorid: "johndoe1", 
    name: "John Doe", 
    email: "john.doe@mail.utoronto.ca", 
    birthday: "2000-01-01", 
    role: "regular", 
    points: 0, 
    createdAt: "2025-02-22T00:00:00.000Z", 
    lastLogin: null, 
    verified: false, 
    avatarUrl: null 
  },
  { 
    id: 2, 
    utorid: "bowser", 
    name: "bowser alt", 
    email: "bowser@mail.utoronto.ca", 
    birthday: "2000-01-01", 
    role: "manager", 
    points: 0, 
    createdAt: "2025-02-22T00:00:00.000Z",
    lastLogin: null,
    verified: false,
    avatarUrl: null
  },
  { 
    id: 3, 
    utorid: "mario", 
    name: "mario", 
    email: "mario@mail.utoronto.ca", 
    birthday: "2000-01-01", 
    role: "superuser", 
    points: 0, 
    createdAt: "2025-02-22T00:00:00.000Z",
    lastLogin: null,
    verified: false,
    avatarUrl: null
  }
]

export default function ManagePermissionsPage() {
  const [users, setUsers] = useState(mockUsers);
  const roleCSS = 'text-center text-sm p-1 border rounded-md cursor-pointer'
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    async function getUsers() {
      const response = await fetch(`${BACKEND_URL}/api/users`);
      const result = await response.json();
      setUsers(result.results)
    }
    getUsers();
  }, []);

  return (
    <div className='ml-40 mt-20'>
      <h1 className='font-bold text-3xl'>Change User Permissions</h1>
      <div className='border w-[70%] max-h-[500px] overflow-y-auto mt-12 p-3 rounded-lg shadow-sm'>
        <div className='flex'></div>
        {users.map(user => (
          <div key={user.id} className='grid grid-cols-8 items-center p-1 hover:bg-gray-100 rounded-md px-2'>
            <span className='col-span-2'>
              <span className='text-gray-500'>Name:</span> {user.name}
            </span> 
            <span className='col-span-2'>
              <span className="text-gray-500">Utorid:</span> {user.utorid}
            </span>
            <span className='col-span-2'>
              <span className="text-gray-500">Role:</span> {user.role}
            </span>
            <span className='col-span-2 ml-auto pr-8'>
              <Popover>
                <PopoverTrigger className='border px-2 py-1 rounded-md text-sm hover:bg-blue-100'>Change Role</PopoverTrigger>
                <PopoverContent
                  className="flex flex-col justify-center"
                  onInteractOutside={() => setSelectedRole(null)}
                  onEscapeKeyDown={() => setSelectedRole(null)}
                >
                  <h1 className='text-lg font-bold mb-4 text-center'>Change Role</h1>
                  <div className='space-y-1'>
                    <div className={`${roleCSS} ${user.role === 'regular' ? 'bg-green-100' : selectedRole === 'regular' ? 'bg-blue-100' : ''}`} onClick={() => setSelectedRole('regular')}>Regular</div>
                    <div className={`${roleCSS} ${user.role === 'cashier' ? 'bg-green-100' : selectedRole === 'cashier' ? 'bg-blue-100' : ''}`} onClick={() => setSelectedRole('cashier')}>Cashier</div>
                    <div className={`${roleCSS} ${user.role === 'manager' ? 'bg-green-100' : selectedRole === 'manager' ? 'bg-blue-100' : ''}`} onClick={() => setSelectedRole('manager')}>Manager</div>
                    <div className={`${roleCSS} ${user.role === 'superuser' ? 'bg-green-100' : selectedRole === 'superuser' ? 'bg-blue-100' : ''}`} onClick={() => setSelectedRole('superuser')}>Superuser</div>
                  </div>
                  <PopoverClose asChild>
                    <button
                      className='mt-3 border rounded-md bg-blue-600 hover:bg-blue-700 text-white p-1'
                      onClick={() => {
                        setSelectedRole(null);
                      }}
                    >
                      Change
                    </button>
                  </PopoverClose>
                </PopoverContent>
              </Popover>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}