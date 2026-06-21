import { useNavigate } from 'react-router-dom'
import AlgorithmExplainer from '../components/AlgorithmExplainer.jsx'
const Landing = () => {
  const navigate = useNavigate()
  return (
    <div className="bg-paper bg-grid-pattern bg-grid-size min-h-screen flex flex-col relative overflow-x-hidden selection:bg-sage selection:text-paper">
      <nav className="w-full px-8 py-5 flex justify-between items-center border-b border-border bg-paper/90 backdrop-blur-md sticky top-0 z-50">
        <div className="text-2xl font-black font-editorial tracking-tight text-ink">FairFlow.</div>
        <div className="hidden md:flex gap-8 text-sm font-tech font-bold uppercase tracking-widest text-muted">
          <a href="#how" className="hover:text-terra transition-colors">How it works</a>
          <a href="#algorithms" className="hover:text-terra transition-colors">Algorithms</a>
        </div>
        <button
          onClick={() => navigate('/admin/login')}
          className="bg-terra text-paper px-7 py-2.5 font-bold font-tech uppercase tracking-wide rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 hover:bg-terraDark transition-all duration-300"
        >
          Get Started
        </button>
      </nav>
      <div className="bg-[#EBE7DA] text-muted/70 py-2.5 border-b border-border overflow-hidden flex" style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
        <div className="animate-marquee inline-block whitespace-nowrap font-tech font-semibold uppercase tracking-widest text-[11px]">
          <span className="text-sage">&nbsp;/// SYSTEM STATUS:</span> SIMPLE LINES CAUSE LONG WAITS <span className="text-terra">/// NOW OPTIMIZING WHO GETS SERVED NEXT ///</span> MAKING SURE NO ONE WAITS FOREVER&nbsp;
          <span className="text-sage">&nbsp;/// SYSTEM STATUS:</span> SIMPLE LINES CAUSE LONG WAITS <span className="text-terra">/// NOW OPTIMIZING WHO GETS SERVED NEXT ///</span> MAKING SURE NO ONE WAITS FOREVER&nbsp;
          <span className="text-sage">&nbsp;/// SYSTEM STATUS:</span> SIMPLE LINES CAUSE LONG WAITS <span className="text-terra">/// NOW OPTIMIZING WHO GETS SERVED NEXT ///</span> MAKING SURE NO ONE WAITS FOREVER&nbsp;
        </div>
      </div>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-3/5 flex flex-col justify-center">
          <div className="inline-block border border-border text-muted px-4 py-1.5 rounded-full font-tech text-[10px] font-bold uppercase tracking-widest mb-8 w-max bg-white shadow-sm">
            OS Theory For Resource Allocation
          </div>
          <h1 className="text-6xl md:text-8xl font-black font-editorial leading-none tracking-tight text-ink mb-6">
            Smarter queues. <br />
            <em className="text-sage font-bold leading-[0.9]">Zero chaos.</em>
          </h1>
          <p className="text-lg text-muted max-w-lg mb-10 leading-relaxed font-medium">
            FairFlow applies CPU scheduling algorithms to physical workflows. Whether allocating lab equipment, booking sports courts, or managing clinic patients, guarantee everyone gets a fair turn, fast.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/admin/login')}
              className="bg-ink text-paper px-8 py-4 font-bold font-tech uppercase tracking-wider text-sm rounded-full shadow-[0_8px_20px_rgba(40,38,31,0.15)] hover:shadow-[0_12px_25px_rgba(40,38,31,0.25)] hover:-translate-y-1 transition-all duration-300"
            >
              Host a Queue
            </button>
            <button
              onClick={() => navigate('/join')}
              className="bg-white text-ink px-8 py-4 font-bold font-tech uppercase tracking-wider text-sm rounded-full border border-border shadow-sm hover:shadow-md hover:-translate-y-1 hover:bg-[#FAFAFA] transition-all duration-300"
            >
              Join a Queue
            </button>
          </div>
        </div>
        <div className="lg:w-2/5 flex items-center justify-center lg:justify-end relative">
          <div className="animate-float relative z-10 w-full max-w-85">
            <div className="bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(40,38,31,0.15)] relative overflow-hidden border border-border/50">
              <div className="absolute w-8 h-8 bg-paper rounded-full -left-4 top-[62%] -translate-y-1/2 z-20" style={{ boxShadow: 'inset -3px 0px 5px rgba(0,0,0,0.03)' }}></div>
              <div className="absolute w-8 h-8 bg-paper rounded-full -right-4 top-[62%] -translate-y-1/2 z-20" style={{ boxShadow: 'inset 3px 0px 5px rgba(0,0,0,0.03)' }}></div>
              <div className="px-8 pt-12 pb-10 text-center bg-white relative z-10">
                <p className="text-xs font-bold tracking-widest text-label uppercase mb-4 font-tech">Now Serving</p>
                <h2 className="text-[7.5rem] font-black font-editorial text-ink leading-none tracking-tighter">04</h2>
              </div>
              <div className="px-8 py-8 relative z-10 bg-white">
                <div className="absolute top-0 left-6 right-6 border-t-2 border-dashed border-border"></div>
                <div className="flex justify-between items-center text-[13px] text-muted font-medium pt-2">
                  <span>Algorithm: <strong className="text-ink font-bold">Shortest job first</strong></span>
                  <span>Wait: <strong className="text-sage font-bold">3 min</strong></span>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-terra/15 blur-[60px] rounded-full z-0 pointer-events-none"></div>
          </div>
        </div>
      </main>
      <div id="how" className="grid grid-cols-1 md:grid-cols-3 border-t border-border bg-white">
        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-border hover:bg-[#FAFAFA] transition-colors">
          <div className="font-editorial text-4xl text-terra font-black mb-4">01</div>
          <h4 className="font-tech font-bold uppercase text-lg mb-2 text-ink">Set the rules</h4>
          <p className="text-sm text-muted leading-relaxed font-medium">Decide how your line should flow. Whether you want to clear quick tasks instantly or give everyone equal turns, just pick a style. Not sure? Our AI will suggest the best fit.</p>
        </div>
        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-border bg-paper">
          <div className="font-editorial text-4xl text-sage font-black mb-4">02</div>
          <h4 className="font-tech font-bold uppercase text-lg mb-2 text-ink">Share a code</h4>
          <p className="text-sm text-muted leading-relaxed font-medium">Hand your visitors a simple code. They join the line from their phone in seconds. No apps to download, no sign ups required. Just their name and they're in.</p>
        </div>
        <div className="p-8 md:p-12 hover:bg-[#FAFAFA] transition-colors">
          <div className="font-editorial text-4xl text-terra font-black mb-4">03</div>
          <h4 className="font-tech font-bold uppercase text-lg mb-2 text-ink">Watch the magic</h4>
          <p className="text-sm text-muted leading-relaxed font-medium">We handle the complex math behind the scenes. You get a clean, live dashboard showing exactly who's up next and proving your line is moving fairly.</p>
        </div>
      </div>
      <div id="algorithms" className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 border-t border-border">
        <AlgorithmExplainer />
      </div>
    </div>
  )
}
export default Landing