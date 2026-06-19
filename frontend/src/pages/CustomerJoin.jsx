import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api.js'
import { getMetric } from '../utils/serviceMetrics.js'

const CustomerJoin = () => {
  const [step, setStep] = useState('code')
  const [joinCode, setJoinCode] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [jobSize, setJobSize] = useState('')
  const [serviceType, setServiceType] = useState('general')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const metric = getMetric(serviceType)

  const handleJoin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/customer/join', {
        join_code: joinCode.toUpperCase(),
        name,
        phone,
      })
      localStorage.setItem('customer_token', res.data.token)
      localStorage.setItem('customer_role', 'customer')
      // Fetch session info to get the service_type for dynamic labels
      try {
        const sessionRes = await api.get(`/session/${res.data.session_id}`)
        setServiceType(sessionRes.data.service_type || 'general')
      } catch {
        // Fallback to general if session fetch fails
      }
      setStep('job')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join queue')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitJob = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/job/submit', { job_size: jobSize })
      navigate('/queue-status')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-paper bg-grid-pattern bg-grid-size min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-[0_25px_50px_-12px_rgba(40,38,31,0.1)] p-10">
        <Link to="/" className="text-2xl font-black font-editorial tracking-tight text-ink block mb-8">FairFlow.</Link>

        {error && (
          <div className="bg-terra/10 border border-terra/30 text-terra text-sm font-medium rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {step === 'code' ? (
          <>
            <h1 className="text-3xl font-black font-editorial tracking-tight text-ink mb-2">Join a queue</h1>
            <p className="text-sm text-muted mb-8">Enter the code given by the service desk</p>
            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold font-tech uppercase tracking-widest text-muted block mb-2">Queue code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  required
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm uppercase focus:outline-none focus:border-sage transition-colors"
                  placeholder="PRINT1"
                />
              </div>
              <div>
                <label className="text-xs font-bold font-tech uppercase tracking-widest text-muted block mb-2">Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sage transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs font-bold font-tech uppercase tracking-widest text-muted block mb-2">Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  pattern="[0-9]{10}"
                  title="Phone number must be exactly 10 digits"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sage transition-colors"
                  placeholder="9999999999"
                />
              </div>
              <button type="submit" disabled={loading} className="bg-ink text-paper py-3.5 font-bold font-tech uppercase tracking-wider text-sm rounded-full mt-2 disabled:opacity-50">
                {loading ? 'Joining...' : 'Continue'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black font-editorial tracking-tight text-ink mb-2">Almost there</h1>
            <p className="text-sm text-muted mb-8">Tell us about your request so we can schedule fairly</p>
            <form onSubmit={handleSubmitJob} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold font-tech uppercase tracking-widest text-muted block mb-2">{metric.label}</label>
                <input
                  type="number"
                  min={1}
                  value={jobSize}
                  onChange={(e) => setJobSize(e.target.value)}
                  required
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sage transition-colors"
                  placeholder={metric.placeholder}
                />
              </div>
              <button type="submit" disabled={loading} className="bg-terra text-paper py-3.5 font-bold font-tech uppercase tracking-wider text-sm rounded-full mt-2 disabled:opacity-50">
                {loading ? 'Submitting...' : 'Join queue'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default CustomerJoin