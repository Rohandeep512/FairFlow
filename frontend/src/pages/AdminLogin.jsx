import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api.js'
import { AuthContext } from '../context/AuthContext'
const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useContext(AuthContext) // Import the context
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/admin/login', { email, password })
      localStorage.setItem('admin_token', res.data.token)
      localStorage.setItem('admin_role', 'admin')
      localStorage.setItem('admin_name', res.data.user.name)
      setUser({
        token: res.data.token,
        role: 'admin',
        name: res.data.user.name
      })
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="bg-paper bg-grid-pattern bg-grid-size min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-[0_25px_50px_-12px_rgba(40,38,31,0.1)] p-10">
        <Link to="/" className="text-2xl font-black font-editorial tracking-tight text-ink block mb-8">FairFlow.</Link>
        <h1 className="text-3xl font-black font-editorial tracking-tight text-ink mb-2">Welcome back</h1>
        <p className="text-sm text-muted mb-8">Log in to manage your queues</p>
        {error && (
          <div className="bg-terra/10 border border-terra/30 text-terra text-sm font-medium rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold font-tech uppercase tracking-widest text-muted block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sage transition-colors"
              placeholder="admin@fairflow.com"
            />
          </div>
          <div>
            <label className="text-xs font-bold font-tech uppercase tracking-widest text-muted block mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sage transition-colors pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-ink text-paper py-3.5 font-bold font-tech uppercase tracking-wider text-sm rounded-full mt-2 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p className="text-sm text-muted text-center mt-6">
          Don't have an account?{' '}
          <Link to="/admin/register" className="text-terra font-bold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}
export default AdminLogin