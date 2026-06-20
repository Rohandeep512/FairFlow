import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api.js'
const CustomerStatus = () => {
  const [data, setData] = useState(null)
  const [reason, setReason] = useState('')
  const [showEmergencyForm, setShowEmergencyForm] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get('/job/my')
      setData(res.data)
      if (res.data.emergency && res.data.emergency.status === 'pending') {
        setSuccess('')
      }
    } catch (err) {
      setError('Could not load your queue status')
    }
  }, [])
  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [fetchStatus])
  const submitEmergency = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.post('/job/emergency', { reason })
      setSuccess('Emergency request sent. Waiting for admin approval.')
      setShowEmergencyForm(false)
      setReason('')
      fetchStatus()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request')
    }
  }
  const handleExit = async () => {
    try {
      await api.delete('/job/my')
      localStorage.removeItem('customer_token')
      localStorage.removeItem('customer_role')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to exit queue')
    }
  }
  if (!data) return <div className="bg-paper min-h-screen flex items-center justify-center text-muted">Loading...</div>
  const { job, estimate, emergency } = data
  const isCompleted = job.status === 'completed'
  const isProcessing = job.status === 'processing'
  const isWaiting = job.status === 'waiting'
  const positionLabel = isCompleted ? 'Completed' : isProcessing ? 'Now serving you' : 'Your position'
  const positionValue = isCompleted ? '✓' : isProcessing ? (
    <svg className="w-24 h-24 mx-auto animate-pulse text-sage inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ) : `#${estimate?.position ?? '-'}`
  return (
    <div className="bg-paper bg-grid-pattern bg-grid-size min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="text-2xl font-black font-editorial tracking-tight text-ink block mb-8 text-center">FairFlow.</Link>
        <div className="bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(40,38,31,0.15)] relative overflow-hidden border border-border/50">
          <div className="px-8 pt-10 pb-8 text-center bg-white">
            <p className="text-xs font-bold tracking-widest text-label uppercase mb-4 font-tech">
              {positionLabel}
            </p>
            <h2 className="text-[6rem] font-black font-editorial text-ink leading-none tracking-tighter">
              {positionValue}
            </h2>
          </div>
          <div className="px-8 py-6 relative bg-white">
            <div className="absolute top-0 left-6 right-6 border-t-2 border-dashed border-border"></div>
            <div className="flex justify-between items-center text-[13px] text-muted font-medium pt-3">
              <span>Status: <strong className="text-ink font-bold capitalize">{job.status}</strong></span>
              {estimate && isWaiting && (
                <span>Est. wait: <strong className="text-sage font-bold">{estimate.range}</strong></span>
              )}
            </div>
          </div>
        </div>
        {success && !(emergency && emergency.status === 'pending') && (
          <div className="bg-sage/10 border border-sage/30 text-sage text-sm font-medium rounded-xl px-4 py-3 mt-6">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-terra/10 border border-terra/30 text-terra text-sm font-medium rounded-xl px-4 py-3 mt-6">
            {error}
          </div>
        )}
        {emergency && emergency.status === 'pending' && (
          <div className="bg-terra/10 border border-terra/30 rounded-xl px-4 py-3 mt-6 text-sm text-terra font-medium">
            Emergency request pending admin approval
          </div>
        )}
        {emergency && emergency.status === 'rejected' && (
          <div className="bg-muted/10 border border-border rounded-xl px-4 py-3 mt-6 text-sm text-muted font-medium">
            Emergency request declined. Maintaining current position.
          </div>
        )}
        {isCompleted && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate('/')} 
              className="bg-ink text-paper w-full max-w-xs py-4 font-bold font-tech uppercase tracking-wider text-sm rounded-full hover:-translate-y-0.5 transition-transform"
            >
              Home
            </button>
          </div>
        )}
        {isWaiting && (
          <div className="mt-6 flex flex-col gap-3">
            {!emergency || emergency.status === 'rejected' ? (
              showEmergencyForm ? (
                <form onSubmit={submitEmergency} className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-3">
                  <label className="text-xs font-bold font-tech uppercase tracking-widest text-muted">Reason for emergency</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sage"
                    placeholder="e.g. I have an exam in 10 minutes"
                  />
                  <button type="submit" className="bg-terra text-paper py-3 font-bold font-tech uppercase tracking-wider text-sm rounded-full">
                    Send request
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowEmergencyForm(true)}
                  className="w-full bg-white border border-terra/30 text-terra py-3 font-bold font-tech uppercase tracking-wider text-sm rounded-full"
                >
                  I have an emergency
                </button>
              )
            ) : null}
            {showExitConfirm ? (
              <div className="flex flex-col gap-2 w-full mt-2">
                <span className="text-xs font-bold font-tech uppercase tracking-widest text-muted text-center">Leave queue?</span>
                <div className="flex gap-2">
                  <button onClick={handleExit} className="flex-1 bg-terra text-paper py-2 font-bold font-tech uppercase tracking-wider text-sm rounded-full">Yes</button>
                  <button onClick={() => setShowExitConfirm(false)} className="flex-1 border border-border text-ink py-2 font-bold font-tech uppercase tracking-wider text-sm rounded-full">No</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowExitConfirm(true)}
                className="w-full bg-transparent text-muted hover:text-ink py-2 font-bold font-tech uppercase tracking-wider text-sm rounded-full transition-colors"
              >
                Exit Queue
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
export default CustomerStatus