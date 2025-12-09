import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext';

export default function RolePermission({ roles }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />
}