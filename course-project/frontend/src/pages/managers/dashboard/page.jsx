import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext.jsx";

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cardClass = "bg-white border p-8 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition flex flex-col justify-center h-48 group";
  const titleClass = "text-xl font-bold text-gray-800 group-hover:text-blue-600 mb-2";
  const descClass = "text-gray-500 text-sm";

  return (
    <div className="p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-8 rounded-2xl shadow-sm border">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manager Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Manager'}.</p>
        </div>
        <div className="mt-6 md:mt-0 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium text-sm">
          Role: {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Manager'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {/* Users */}
        <div
          onClick={() => navigate('/managers/display-users')}
          className={cardClass}
        >
          <h2 className={titleClass}>Manage Users</h2>
          <p className={descClass}>View, edit, promote, or delete users.</p>
        </div>

        {/* Transactions */}
        <div
          onClick={() => navigate('/managers/display-transactions')}
          className={cardClass}
        >
          <h2 className={titleClass}>Manage Transactions</h2>
          <p className={descClass}>View transaction history and flag suspicious activity.</p>
        </div>

        {/* Promotions */}
        <div
          onClick={() => navigate('/managers/display-promotions')}
          className={cardClass}
        >
          <h2 className={titleClass}>Manage Promotions</h2>
          <p className={descClass}>Create and manage discount codes.</p>
        </div>

        {/* Events */}
        <div
          onClick={() => navigate('/managers/display-events')}
          className={cardClass}
        >
          <h2 className={titleClass}>Manage Events</h2>
          <p className={descClass}>Organize events and manage guest lists.</p>
        </div>
      </div>
    </div>
  );
}