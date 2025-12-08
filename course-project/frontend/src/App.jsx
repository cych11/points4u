import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ManagerLayout from './pages/managers/layout.jsx'
import ManagerDashboardPage from './pages/managers/dashboard/page.jsx'
import CashierLayout from './pages/cashier/layout.jsx'
import UserLayout from './pages/user/layout.jsx'

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
import ManagePermissionsPage from './pages/managers/manage-permissions/page.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

// Helper Components
import CreateTransactionPage from './pages/cashier/create_transaction/page.jsx'
import CashierHomePage from './pages/cashier/home/page.jsx'
import ProcessRedemptionPage from './pages/cashier/process_redemption/page.jsx'
import CreateUserPage from './pages/cashier/create_user/page.jsx'
import UserHomePage from './pages/user/home/page.jsx'
import UserTransactionsPage from './pages/user/transactions/page.jsx'
import UserEventsPage from './pages/user/events/page.jsx'
import UserProfilePage from './pages/user/profile/page.jsx'
import ForgotPasswordPage from './pages/forgot_password/page.jsx'
import ResetPasswordPage from './pages/reset_password/page.jsx'


export default function App() {
  return (
    <PageProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Manager Routes */}
            <Route path="/managers" element={<ManagerLayout />}>
              <Route path="" element={<ManagerDashboardPage />} />

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
              <Route path="manage-permissions" element={<ManagePermissionsPage />} />
            </Route>

            {/* Cashier Routes */}
            <Route path="/cashier" element={<CashierLayout />}>
              <Route index element={<CashierHomePage />} />
              <Route path="create-transaction" element={<CreateTransactionPage />} />
              <Route path="process-redemption" element={<ProcessRedemptionPage />} />
              <Route path="create-user" element={<CreateUserPage />} />
              <Route path="promotions" element={<DisplayPromotionsPage />} />
            </Route>

            {/* User Routes */}
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserHomePage />} />
              <Route path="transactions" element={<UserTransactionsPage />} />
              <Route path="events" element={<UserEventsPage />} />
              <Route path="profile" element={<UserProfilePage />} />
              <Route path="promotions" element={<DisplayPromotionsPage />} />
            </Route>

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </PageProvider>
  );
}
