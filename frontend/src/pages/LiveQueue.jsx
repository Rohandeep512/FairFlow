import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api.js'
import AlgorithmExplainer from '../components/AlgorithmExplainer.jsx'
import { getMetric } from '../utils/serviceMetrics.js'

const ALGO_LABELS = { fcfs: 'First come, first served', sjf: 'Shortest job first', rr: 'Round robin', priority: 'Priority + aging' }

const LiveQueue = () => {
  const { id } = useParams()
  const [session, setSession] = useState(null)
  const [jobs, setJobs] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [aiRec, setAiRec] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [loadingAction, setLoadingAction] = useState('')
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const sessionRes = await api.get(`/session/${id}`)
      setSession(sessionRes.data)
      const jobsRes = await api.get(`/job/session/${id}`)
      setJobs(jobsRes.data.jobs)
      setMetrics(jobsRes.data.metrics)
    } catch (err) {
      setError('Failed to load session')
    }
  }, [id])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  const startNext = async () => {
    setLoadingAction('start')
    setError('')
    try {
      await api.patch(`/job/session/${id}/start-next`)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start next job')
    } finally {
      setLoadingAction('')
    }
  }

  const completeJob = async (jobId) => {
    setLoadingAction('complete')
    try {
      await api.patch(`/job/${jobId}/complete`)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete job')
    } finally {
      setLoadingAction('')
    }
  }

  const resolveEmergency = async (emergencyId, status) => {
    try {
      await api.patch(`/job/emergency/${emergencyId}/resolve`, { status })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resolve emergency')
    }
  }

  const getAIRecommendation = async () => {
    setLoadingAction('ai')
    try {
      const res = await api.get(`/session/${id}/ai-recommendation`)
      setAiRec(res.data)
    } catch (err) {
      setError('AI recommendation failed')
    } finally {
      setLoadingAction('')
    }
  }

  const getPrediction = async () => {
    setLoadingAction('predict')
    try {
      const res = await api.get(`/session/${id}/predict`)
      setPrediction(res.data)
    } catch (err) {
      setError('Prediction failed')
    } finally {
      setLoadingAction('')
    }
  }

  const compareAlgos = async () => {
    setLoadingAction('compare')
    try {
      const res = await api.get(`/job/session/${id}/compare`)
      setComparison(res.data)
    } catch (err) {
      setError('Comparison failed')
    } finally {
      setLoadingAction('')
    }
  }

  const endSession = async () => {
    try {
      await api.patch(`/session/${id}/end`)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to end session')
    }
  }

  if (!session) return <div className="bg-paper min-h-screen flex items-center justify-center text-muted">Loading...</div>

  const waitMins = (arrival) => Math.floor((Date.now() - new Date(arrival).getTime()) / 60000)

  return (
    <div className="bg-paper bg-grid-pattern bg-grid-size min-h-screen">
      <nav className="w-full px-8 py-5 flex justify-between items-center border-b border-border bg-paper/90 backdrop-blur-md sticky top-0 z-50">
        <Link to="/admin/dashboard" className="text-2xl font-black font-editorial tracking-tight text-ink">FairFlow.</Link>
        <div className="flex items-center gap-4">
          <span className="bg-sage/10 text-sage px-4 py-2 rounded-full text-xs font-bold font-tech uppercase tracking-widest">
            {ALGO_LABELS[session.algorithm]}
          </span>
          <span className="font-tech font-bold text-ink text-sm">Code: {session.join_code}</span>
          {session.status === 'active' && (
            <button onClick={endSession} className="text-xs font-bold font-tech uppercase tracking-widest text-terra hover:underline">
              End session
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {error && (
          <div className="bg-terra/10 border border-terra/30 text-terra text-sm font-medium rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-border p-6 text-center">
            <div className="text-3xl font-black font-editorial text-ink">{metrics?.avgWaitTime ?? 0}</div>
            <div className="text-xs font-tech uppercase tracking-widest text-muted mt-1">Avg wait (min)</div>
          </div>
          <div className="bg-white rounded-2xl border border-border p-6 text-center">
            <div className="text-3xl font-black font-editorial text-sage">{metrics?.fairnessScore ?? 0}%</div>
            <div className="text-xs font-tech uppercase tracking-widest text-muted mt-1">Fairness score</div>
          </div>
          <div className="bg-white rounded-2xl border border-border p-6 text-center">
            <div className="text-3xl font-black font-editorial text-terra">{metrics?.throughput ?? 0}</div>
            <div className="text-xs font-tech uppercase tracking-widest text-muted mt-1">Jobs / hour</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <button onClick={startNext} disabled={loadingAction === 'start'} className="bg-ink text-paper px-6 py-3 rounded-full text-sm font-bold font-tech uppercase tracking-wider disabled:opacity-50">
            Start next job
          </button>
          <button onClick={compareAlgos} disabled={loadingAction === 'compare'} className="bg-white border border-border text-ink px-6 py-3 rounded-full text-sm font-bold font-tech uppercase tracking-wider disabled:opacity-50">
            Compare algorithms
          </button>
          <button onClick={getAIRecommendation} disabled={loadingAction === 'ai'} className="bg-white border border-border text-ink px-6 py-3 rounded-full text-sm font-bold font-tech uppercase tracking-wider disabled:opacity-50">
            {loadingAction === 'ai' ? 'Thinking...' : 'Get AI recommendation'}
          </button>
          <button onClick={getPrediction} disabled={loadingAction === 'predict'} className="bg-white border border-border text-ink px-6 py-3 rounded-full text-sm font-bold font-tech uppercase tracking-wider disabled:opacity-50">
            {loadingAction === 'predict' ? 'Predicting...' : 'Predict completion'}
          </button>
        </div>

        {aiRec && (
          <div className="bg-sage/10 border border-sage/30 rounded-2xl p-6 mb-6">
            <div className="text-xs font-bold font-tech uppercase tracking-widest text-sage mb-2">AI recommendation</div>
            <div className="text-lg font-bold text-ink mb-1">{ALGO_LABELS[aiRec.algorithm] || aiRec.algorithm}</div>
            <p className="text-sm text-muted">{aiRec.reason}</p>
          </div>
        )}

        {prediction && (
          <div className="bg-terra/10 border border-terra/30 rounded-2xl p-6 mb-6">
            <div className="text-xs font-bold font-tech uppercase tracking-widest text-terra mb-2">Completion prediction</div>
            <div className="text-lg font-bold text-ink mb-1">{prediction.estimatedMinutes} minutes remaining</div>
            <p className="text-sm text-muted">{prediction.message}</p>
          </div>
        )}

        {comparison && (
          <div className="bg-white border border-border rounded-2xl p-6 mb-8">
            <div className="text-xs font-bold font-tech uppercase tracking-widest text-muted mb-4">Algorithm comparison</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(comparison).map(([algo, data]) => (
                <div key={algo} className="border border-border rounded-xl p-4">
                  <div className="text-sm font-bold text-ink mb-2">{ALGO_LABELS[algo]}</div>
                  <div className="text-xs text-muted">Avg wait: <strong className="text-ink">{data.avgWaitTime}</strong></div>
                  <div className="text-xs text-muted">Turnaround: <strong className="text-ink">{data.avgTurnaround}</strong></div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-border p-8">
          <h3 className="text-xl font-black font-editorial text-ink mb-6">Queue</h3>
          <div className="flex flex-col gap-3">
            {jobs.map((job) => {
              const wait = waitMins(job.arrival_time)
              const isAlert = wait > 15 && job.status === 'waiting'
              return (
                <div
                  key={job.id}
                  className={`flex justify-between items-center p-4 rounded-xl border ${
                    job.status === 'processing' ? 'bg-sage/5 border-sage/30' :
                    isAlert ? 'bg-terra/5 border-terra/30' :
                    'bg-paper border-border'
                  }`}
                >
                  <div>
                    <div className="font-bold text-ink">{job.customer_name}</div>
                    <div className="text-xs text-muted">{getMetric(session.service_type).columnHeader}: {job.job_size} • Waiting {wait} min</div>
                    {job.emergency_id && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-terra font-bold">Emergency: {job.emergency_reason}</span>
                        <button onClick={() => resolveEmergency(job.emergency_id, 'approved')} className="text-xs bg-sage text-paper px-3 py-1 rounded-full font-bold">Approve</button>
                        <button onClick={() => resolveEmergency(job.emergency_id, 'rejected')} className="text-xs bg-terra text-paper px-3 py-1 rounded-full font-bold">Reject</button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold font-tech uppercase tracking-widest px-3 py-1 rounded-full ${
                      job.status === 'processing' ? 'bg-sage text-paper' :
                      isAlert ? 'bg-terra text-paper' :
                      'bg-border text-muted'
                    }`}>
                      {job.status === 'processing' ? 'Processing' : isAlert ? 'Wait alert' : 'Waiting'}
                    </span>
                    {job.status === 'processing' && (
                      <button onClick={() => completeJob(job.id)} className="text-xs font-bold text-sage hover:underline">
                        Mark complete
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
           {jobs.length === 0 && <p className="text-muted text-center py-8">No jobs in queue yet.</p>}
          </div>
        </div>

        <AlgorithmExplainer currentAlgorithm={session.algorithm} />
      </main>
    </div>
  )
}

export default LiveQueue