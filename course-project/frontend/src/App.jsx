import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login.jsx'
import CreateEventsPage from './pages/managers/create_events/page.jsx'
import ManagerLayout from './pages/managers/layout.jsx'
import { PageProvider } from './pages/managers/contexts/PageContext.jsx'

export default function App() {
  return (
    <PageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* Manager routes */}
            <Route path="/managers" element={<ManagerLayout />}>
              <Route path="create-events" element={<CreateEventsPage />} />
            </Route>
        </Routes>
      </BrowserRouter>
    </PageProvider>
  )
}
