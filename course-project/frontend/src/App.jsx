import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ManagerLayout from './pages/managers/layout.jsx'
import ManagerDashboardPage from './pages/managers/dashboard/page.jsx'

import DisplayUsersPage from './pages/managers/display_users/page.jsx'
import EditUserPage from './pages/managers/edit_user/page.jsx'

import DisplayTransactionsPage from './pages/managers/display_transactions/page.jsx'
import EditTransactionPage from './pages/managers/edit_transaction/page.jsx'

import CreatePromotionsPage from './pages/managers/create_promotions/page.jsx'
import DisplayPromotionsPage from './pages/managers/display_promotions/page.jsx'
import ManagePromotionPage from './pages/managers/manage_promotion/page.jsx'

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
              <Route path="display-users/:id" element={<EditUserPage />} />

              {/* Manager Transaction Routes */}
              <Route path="display-transactions" element={<DisplayTransactionsPage />} />
              <Route path="display-transactions/:id" element={<EditTransactionPage />} />

              {/* Manager Promotion Routes */}
              <Route path="create-promotions" element={<CreatePromotionsPage />} />
              <Route path="display-promotions" element={<DisplayPromotionsPage />} />
              <Route path="display-promotions/:id" element={<ManagePromotionPage />} />

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

