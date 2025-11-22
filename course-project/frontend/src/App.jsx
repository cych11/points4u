import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}


