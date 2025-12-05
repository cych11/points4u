import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ManagerLayout from './pages/managers/layout.jsx'
import ManagerDashboardPage from './pages/managers/dashboard/page.jsx'

import DisplayUsersPage from './pages/managers/display_users/page.jsx'
import EditUserPage from './pages/managers/edit_user/page.jsx'

import CreateEventsPage from './pages/managers/create_events/page.jsx'
import DisplayEventsPage from './pages/managers/display_events/page.jsx'
import ManageEventPage from './pages/managers/manage_event/page.jsx'

import { PageProvider } from './pages/managers/contexts/PageContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

export default function App() {
  return (
    <PageProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Manager Routes */}
            <Route path="/managers" element={<ManagerLayout />}>
              <Route path="dashboard" element={<ManagerDashboardPage />} />

              {/* Manager User Routes */}
              <Route path="display-users" element={<DisplayUsersPage />} />
              <Route path="display-user/:id" element={<EditUserPage />} />

              {/* Manager Transaction Routes */}

              {/* Manager Promotion Routes */}

              {/* Manager Event Routes */}
              <Route path="create-events" element={<CreateEventsPage />} />
              <Route path="display-events" element={<DisplayEventsPage />} />
              <Route path="manage-event/:id" element={<ManageEventPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </PageProvider>
  );
}

