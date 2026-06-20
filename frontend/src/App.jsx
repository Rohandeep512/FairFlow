import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Landing from './pages/Landing.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminRegister from './pages/AdminRegister.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import LiveQueue from './pages/LiveQueue.jsx'
import CustomerJoin from './pages/CustomerJoin.jsx'
import CustomerStatus from './pages/CustomerStatus.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/join" element={<CustomerJoin />} />
        <Route path="/queue-status" element={<CustomerStatus />} />
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/session/:id" element={<LiveQueue />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
export default App