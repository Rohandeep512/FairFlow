import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
const ProtectedRoute = ({ role }) => {
  const { user, loading } = useContext(AuthContext)
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-ink font-tech">Loading...</div>
  }
  if (!user || (role && user.role !== role)) {
    return <Navigate to="/admin/login" replace />
  }
  return <Outlet />
}
export default ProtectedRoute