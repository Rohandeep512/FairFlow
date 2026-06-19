import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api.js'

const SERVICE_TYPES = [
  { value: 'print', label: 'Print services' },
  { value: 'equipment', label: 'Facilities & Equipment' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'support', label: 'Support & helpdesk' },
  { value: 'food', label: 'Food & orders' },
  { value: 'general', label: 'General' },
]

const ALGORITHMS = [
  { value: 'fcfs', label: 'First come, first served', desc: 'Simple and familiar. Jobs run in arrival order.' },
  { value: 'sjf', label: 'Shortest job first', desc: 'Quickest jobs go first. Cuts average waiting time.' },
  { value: 'rr', label: 'Round robin', desc: 'Everyone gets equal time in turns. Fair for shared equipment.' },
  { value: 'priority', label: 'Priority + aging', desc: 'Urgent jobs go first. The longer you wait, the more important you become.' },
]

const getRecommendedAlgorithm = (serviceType) => {
  switch (serviceType) {
    case 'print': return 'sjf';
    case 'equipment': return 'rr';
    case 'healthcare': return 'priority';
    case 'support': return 'priority';
    case 'food': return 'fcfs';
    case 'general': return 'fcfs';
    default: return 'fcfs';
  }
}

const AdminDashboard = () => {
  const [orgs, setOrgs] = useState([])
  const [showOrgForm, setShowOrgForm] = useState(false)
  const [showSessionForm, setShowSessionForm] = useState(null)
  const [orgToDelete, setOrgToDelete] = useState(null)
  const [orgName, setOrgName] = useState('')
  const [serviceType, setServiceType] = useState('print')
  const [algorithm, setAlgorithm] = useState('sjf')
  const [timeQuantum, setTimeQuantum] = useState(5)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrgs()
  }, [])

  const fetchOrgs = async () => {
    try {
      const res = await api.get('/org')
      setOrgs(res.data)
    } catch (err) {
      setError('Failed to load organizations')
    }
  }

  const handleCreateOrg = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/org', { name: orgName, service_type: serviceType })
      setOrgName('')
      setShowOrgForm(false)
      fetchOrgs()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create organization')
    }
  }

  const handleDeleteOrg = async (orgId) => {
    try {
      await api.delete(`/org/${orgId}`)
      setOrgToDelete(null)
      fetchOrgs()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete organization')
    }
  }

  const handleCreateSession = async (orgId) => {
    setError('')
    try {
      const res = await api.post('/session', {
        org_id: orgId,
        algorithm,
        aging_enabled: true,
        time_quantum: algorithm === 'rr' ? timeQuantum : null,
      })
      navigate(`/admin/session/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create session')
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_role')
    localStorage.removeItem('admin_name')
    navigate('/')
  }

  return (
    <div className="bg-paper bg-grid-pattern bg-grid-size min-h-screen">
      <nav className="w-full px-8 py-5 flex justify-between items-center border-b border-border bg-paper/90 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="text-2xl font-black font-editorial tracking-tight text-ink">FairFlow.</Link>
        <button onClick={logout} className="text-sm font-bold font-tech uppercase tracking-widest text-muted hover:text-terra transition-colors">
          Log out
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black font-editorial tracking-tight text-ink">Your organizations</h1>
          <button
            onClick={() => setShowOrgForm(!showOrgForm)}
            className="bg-ink text-paper px-6 py-3 font-bold font-tech uppercase tracking-wider text-sm rounded-full hover:-translate-y-0.5 transition-all duration-300"
          >
            + New organization
          </button>
        </div>

        {error && (
          <div className="bg-terra/10 border border-terra/30 text-terra text-sm font-medium rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {showOrgForm && (
          <form onSubmit={handleCreateOrg} className="bg-white rounded-2xl border border-border p-8 mb-8 flex flex-col gap-4 max-w-md">
            <div>
              <label className="text-xs font-bold font-tech uppercase tracking-widest text-muted block mb-2">Organization name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sage transition-colors"
                placeholder="e.g. NSUT Print Shop"
              />
            </div>
            <div>
              <label className="text-xs font-bold font-tech uppercase tracking-widest text-muted block mb-2">Service type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sage transition-colors"
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="bg-terra text-paper py-3 font-bold font-tech uppercase tracking-wider text-sm rounded-full mt-2">
              Create
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orgs.map((org) => (
            <div key={org.id} className="bg-white rounded-2xl border border-border p-8 relative">
              {orgToDelete === org.id ? (
                <div className="absolute top-6 right-6 flex items-center gap-2 text-xs font-bold font-tech uppercase tracking-widest">
                  <span className="text-muted">Delete?</span>
                  <button onClick={() => handleDeleteOrg(org.id)} className="text-terra hover:underline">Yes</button>
                  <button onClick={() => setOrgToDelete(null)} className="text-muted hover:underline">No</button>
                </div>
              ) : (
                <button 
                  onClick={() => setOrgToDelete(org.id)}
                  className="absolute top-6 right-6 text-muted hover:text-terra transition-colors"
                  title="Delete organization"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              )}
              
              <div className="font-tech text-xs font-bold uppercase tracking-widest text-label mb-2">
                {SERVICE_TYPES.find((s) => s.value === org.service_type)?.label}
              </div>
              <h3 className="text-2xl font-black font-editorial text-ink mb-4">{org.name}</h3>

              {showSessionForm === org.id ? (
                <div className="flex flex-col gap-3 mt-4 border-t border-border pt-4">
                  <label className="text-xs font-bold font-tech uppercase tracking-widest text-muted">Choose algorithm</label>
                  {ALGORITHMS.map((a) => {
                    const isRecommended = a.value === getRecommendedAlgorithm(org.service_type)
                    return (
                      <label key={a.value} className={`flex items-start gap-3 border rounded-xl p-3 cursor-pointer transition-colors ${algorithm === a.value ? 'border-sage bg-sage/5' : 'border-border'}`}>
                        <input
                          type="radio"
                          name="algorithm"
                          value={a.value}
                          checked={algorithm === a.value}
                          onChange={() => setAlgorithm(a.value)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-ink">{a.label}</span>
                            {isRecommended && (
                              <span className="bg-sage/10 text-sage text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest font-tech leading-none">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted">{a.desc}</div>
                        </div>
                      </label>
                    )
                  })}
                  {algorithm === 'rr' && (
                    <div>
                      <label className="text-xs font-bold font-tech uppercase tracking-widest text-muted block mb-2">Time quantum (minutes)</label>
                      <input
                        type="number"
                        min={1}
                        value={timeQuantum}
                        onChange={(e) => setTimeQuantum(e.target.value)}
                        className="w-full border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-sage"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => handleCreateSession(org.id)}
                    className="bg-sage text-paper py-3 font-bold font-tech uppercase tracking-wider text-sm rounded-full mt-2"
                  >
                    Start session
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSessionForm(org.id)}
                  className="text-sm font-bold font-tech uppercase tracking-wider text-terra hover:underline"
                >
                  Start new session →
                </button>
              )}
            </div>
          ))}
        </div>

        {orgs.length === 0 && !showOrgForm && (
          <p className="text-muted text-center mt-16">No organizations yet. Create one to get started.</p>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard