const ALGORITHMS = [
  {
    key: 'fcfs',
    name: 'First Come, First Serve',
    emoji: '🎟️',
    tagline: 'The Classic Line',
    explanation:
      'Exactly what you are used to. Simple, predictable, and fair.',
    bestFor: 'Queues where everyone is doing the exact same thing.',
    color: 'sage',
  },
  {
    key: 'sjf',
    name: 'Shortest Job First',
    emoji: '⚡',
    tagline: 'The Express Lane',
    explanation:
      'Got a 2 minute task? Jump ahead of the 45 minute projects.',
    bestFor: 'Clearing out crowded rooms fast.',
    color: 'terra',
  },
  {
    key: 'rr',
    name: 'Round Robin',
    emoji: '🔄',
    tagline: 'The Fair Share',
    explanation:
      'Everyone gets a guaranteed slice of time before rotating to the next person.',
    bestFor: 'Shared resources like sports courts or gaming setups.',
    color: 'sage',
  },
  {
    key: 'priority',
    name: 'Priority + Aging',
    emoji: '🚑',
    tagline: 'The Triage System',
    explanation:
      'Urgent needs get VIP access, but normal requests slowly gain priority the longer they wait.',
    bestFor: 'Ensuring nobody is left behind when handling emergencies.',
    color: 'terra',
  },
]
const AlgorithmExplainer = ({ currentAlgorithm }) => {
  return (
    <div className="mt-12 mb-4">
      <div className="mb-8">
        <h3 className="text-2xl font-black font-editorial tracking-tight text-ink mb-2">
          The Logic Behind the Line
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ALGORITHMS.map((algo) => {
          const isActive = currentAlgorithm === algo.key
          return (
            <div
              key={algo.key}
              className={`relative rounded-2xl border p-6 transition-all duration-300 ${
                isActive
                  ? 'bg-white border-sage/40 shadow-[0_8px_30px_rgba(107,143,104,0.12)]'
                  : 'bg-white border-border hover:border-border hover:shadow-sm'
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4 bg-sage text-paper text-[10px] font-bold font-tech uppercase tracking-widest px-3 py-1 rounded-full">
                  Active
                </div>
              )}
              <div className="text-3xl mb-3">{algo.emoji}</div>
              <h4 className="text-base font-black font-editorial text-ink mb-0.5 tracking-tight">
                {algo.name}
              </h4>
              <p className={`text-xs font-bold font-tech uppercase tracking-widest mb-3 ${
                algo.color === 'sage' ? 'text-sage' : 'text-terra'
              }`}>
                {algo.tagline}
              </p>
              <p className="text-sm text-muted leading-relaxed mb-4 font-medium">
                {algo.explanation}
              </p>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-label font-tech">
                  <span className="font-bold uppercase tracking-widest">Best for: </span>
                  {algo.bestFor}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default AlgorithmExplainer
