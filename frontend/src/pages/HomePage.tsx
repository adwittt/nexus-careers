import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, MapPin, ArrowRight, Briefcase, Users, TrendingUp, 
  Lightbulb, MousePointerClick, BarChart3, 
  Code, Palette, Megaphone, DollarSign, Heart, LineChart, GraduationCap, Settings, Star
} from 'lucide-react'
import { getAllJobs } from '../services/api'
import JobCard from '../components/JobCard'

const COMPANY_COLORS = {
  Google:    { bg: '#4285F4', letter: 'G' },
  Amazon:    { bg: '#FF9900', letter: 'A' },
  Microsoft: { bg: '#00A4EF', letter: 'M' },
  Meta:      { bg: '#1877F2', letter: 'F' },
}

/**
 * Landing page — matches mockup Image 5:
 * Hero with search bar + Featured Jobs grid with Browse All button
 */
export default function HomePage() {
  const [title, setTitle]         = useState('')
  const [location, setLocation]   = useState('')
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [loading, setLoading]     = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getAllJobs()
      .then(r => setFeaturedJobs((r.data || []).slice(0, 3)))
      .catch(() => setFeaturedJobs([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (title)    params.set('title', title)
    if (location) params.set('location', location)
    navigate(`/jobs?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#020817] transition-colors relative">
      
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden items-center justify-center flex flex-col">
        {/* Animated Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 dark:bg-blue-600/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute top-40 -left-64 w-[600px] h-[600px] bg-purple-500/20 dark:bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10 mix-blend-screen"></div>
        <div className="absolute top-20 -right-64 w-[600px] h-[600px] bg-cyan-400/20 dark:bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10 mix-blend-screen"></div>

        <div className="max-w-4xl mx-auto px-4 text-center z-10 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm text-blue-700 dark:text-blue-300 font-semibold text-xs tracking-widest uppercase mb-8 shadow-sm">
            <Star size={14} className="text-yellow-500 fill-current" /> Leading career platform 2026
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-black tracking-tight mb-6 text-gray-900 dark:text-white leading-[1.05]">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">Dream Job</span> Today
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover thousands of pristine opportunities from world-class companies. 
            Your next leap forward is just one search away.
          </p>

          {/* Epic Search Bar */}
          <form onSubmit={handleSearch}
            className="flex flex-col md:flex-row items-center gap-2 max-w-3xl mx-auto bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 dark:border-slate-700/50 focus-within:ring-4 ring-blue-500/20 transition-all dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]"
          >
            <div className="flex items-center gap-3 flex-1 px-4 py-2 w-full">
              <Search size={22} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Job Title, Keyword or Company"
                className="w-full text-base font-medium text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none bg-transparent"
              />
            </div>

            <div className="w-px h-8 bg-gray-200 dark:bg-slate-700 hidden md:block" />

            <div className="flex items-center gap-3 flex-1 px-4 py-2 w-full md:w-auto">
              <MapPin size={22} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City, State or Remote"
                className="w-full text-base font-medium text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none bg-transparent"
              />
            </div>

            <button type="submit" className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-3.5 rounded-2xl flex-shrink-0 shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 text-lg flex justify-center items-center gap-2">
              Search <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick stats floating */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 mt-12 text-gray-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-2"><div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600"><Briefcase size={16}/></div> 10,000+ Verified Jobs</span>
            <span className="flex items-center gap-2"><div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600"><Users size={16}/></div> 5,000+ Top Companies</span>
            <span className="flex items-center gap-2"><div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600"><TrendingUp size={16}/></div> 50,000+ Successful Hires</span>
          </div>
        </div>
      </div>

      {/* ── Featured Jobs ─────────────────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 z-10 -mt-10">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
          
          {/* Header row */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Featured Opportunities</h2>
              <p className="text-gray-500 dark:text-slate-400 font-medium">Hand-picked roles from our elite partners</p>
            </div>
            <button
              onClick={() => navigate('/jobs')}
              className="text-blue-600 dark:text-blue-400 font-bold px-6 py-3 rounded-xl border-2 border-blue-100 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-transparent transition-all flex items-center gap-2 group"
            >
              Browse All Jobs
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Job grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-gray-100 dark:bg-slate-800/50 rounded-3xl h-48 animate-pulse border border-gray-200 dark:border-slate-700" />
              ))}
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-300 dark:border-slate-600">
              <Briefcase size={48} className="mx-auto mb-4 text-gray-300 dark:text-slate-500" />
              <p className="text-lg text-gray-500 dark:text-slate-400 font-medium">No featured jobs available right now.</p>
              <button onClick={() => navigate('/register')} className="mt-4 text-blue-600 font-bold hover:underline bg-transparent">Post the first one!</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map(job => {
                const co = COMPANY_COLORS[job.companyName]
                return (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="group relative bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all hover:-translate-y-1 flex flex-col"
                  >
                    {/* Glowing highlight orb on hover inside card */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-6 relative">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/20"
                        style={{ background: co?.bg || 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
                      >
                        {co?.letter || job.companyName?.[0] || '?'}
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800">
                        {job.status === 'OPEN' ? 'Actively Hiring' : 'Closed'}
                      </div>
                    </div>

                    <h3 className="font-extrabold text-gray-900 dark:text-white text-xl mb-1 line-clamp-1">{job.title}</h3>
                    <p className="text-gray-500 dark:text-slate-400 font-medium text-sm mb-4">{job.companyName}</p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-sm font-medium">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                        <MapPin size={14} className="text-gray-400" /> {job.location.split(',')[0]}
                      </div>
                      <div className="text-gray-900 dark:text-blue-300 font-bold bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                        {job.salary}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Our Advantage ─────────────────────────────────────────────────── */}
      <div className="relative bg-slate-50 dark:bg-slate-950 py-32 px-4 overflow-hidden border-b border-gray-200 dark:border-slate-900 hidden-scroll overflow-x-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="inline-block py-1.5 px-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-black tracking-widest text-xs uppercase mb-6 border border-blue-200 dark:border-blue-800/50">Our Advantage</h3>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">Nexus Edge</span></h2>
            <p className="mt-4 text-gray-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">Experience a fundamentally superior way to hire or get hired. Powered by cutting-edge tech.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-10 border border-gray-100 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all shadow-xl shadow-gray-100 dark:shadow-none hover:shadow-blue-500/10 hover:-translate-y-2 flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Lightbulb size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Smart Matching</h3>
                <p className="text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                  Our proprietary AI doesn't just look at keywords. It analyzes career trajectories to suggest the perfect mutual fit.
                </p>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-10 border border-gray-100 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all shadow-xl shadow-gray-100 dark:shadow-none hover:shadow-indigo-500/10 hover:-translate-y-2 flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                  <MousePointerClick size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">One-Click Apply</h3>
                <p className="text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                  Say goodbye to tedious redundant forms. Build your master profile once and apply blazing fast to multiple roles.
                </p>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-10 border border-gray-100 dark:border-slate-800 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all shadow-xl shadow-gray-100 dark:shadow-none hover:shadow-cyan-500/10 hover:-translate-y-2 flex flex-col">
               <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/50 to-transparent dark:from-cyan-900/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Real-Time Tracking</h3>
                <p className="text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                  Total transparency at every step. Track your applications with live recruiter pipeline status and precise feedback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Explore By Domain ─────────────────────────────────────────────────── */}
      <div className="relative bg-white dark:bg-[#070b14] py-32 px-4 shadow-[inset_0_100px_100px_-100px_rgba(0,0,0,0.5)] dark:shadow-[inset_0_100px_100px_-100px_rgba(0,0,0,0.8)]">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 dark:bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h3 className="inline-block py-1.5 px-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-black tracking-widest text-xs uppercase mb-4 border border-blue-200 dark:border-blue-800/50">Explore By Domain</h3>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Popular Categories</h2>
            </div>
            <button onClick={() => navigate('/jobs')} className="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-50 dark:bg-slate-800/80 text-gray-900 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700 group">
              View all sectors <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Code, name: 'Technology & Eng', jobs: '2.4k Jobs', bg: 'bg-blue-500', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)]' },
              { icon: Palette, name: 'Product Design', jobs: '840 Jobs', bg: 'bg-pink-500', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.5)]' },
              { icon: Megaphone, name: 'Marketing & PR', jobs: '1.2k Jobs', bg: 'bg-orange-500', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.5)]' },
              { icon: DollarSign, name: 'Finance & Fintech', jobs: '950 Jobs', bg: 'bg-green-500', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.5)]' },
              { icon: Heart, name: 'Health & Med', jobs: '1.5k Jobs', bg: 'bg-red-500', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.5)]' },
              { icon: LineChart, name: 'Sales & BD', jobs: '3.1k Jobs', bg: 'bg-purple-500', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.5)]' },
              { icon: GraduationCap, name: 'EdTech & Learning', jobs: '620 Jobs', bg: 'bg-cyan-500', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.5)]' },
              { icon: Settings, name: 'Operations', jobs: '1.1k Jobs', bg: 'bg-slate-600', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(71,85,105,0.5)]' },
            ].map((cat, i) => (
              <div key={i} onClick={() => navigate('/jobs')} className={`group relative bg-gray-50 dark:bg-slate-800/40 backdrop-blur-md border border-gray-200 dark:border-slate-800 rounded-3xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 ${cat.glow} hover:border-transparent`}>
                
                {/* Background color block that slides up on hover */}
                <div className={`absolute inset-0 ${cat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative z-10 flex items-start justify-between">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${cat.bg} text-white group-hover:bg-white group-hover:text-gray-900 shadow-md`}>
                    <cat.icon size={26} strokeWidth={2.5} />
                  </div>
                  
                  {/* Arrow indicating clickability */}
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700/50 flex items-center justify-center text-gray-400 group-hover:bg-white/20 group-hover:text-white transition-all transform group-hover:rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1">
                     <ArrowRight size={16} strokeWidth={3} />
                  </div>
                </div>

                <div className="relative z-10 mt-8">
                  <h4 className="font-black text-xl text-gray-900 dark:text-white group-hover:text-white transition-colors">{cat.name}</h4>
                  <p className="text-sm font-bold text-gray-500 dark:text-slate-400 mt-2 group-hover:text-white/80 transition-colors uppercase tracking-wider">{cat.jobs}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => navigate('/jobs')} className="mt-10 md:hidden w-full flex justify-center items-center gap-2 px-6 py-4 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold border border-gray-200 dark:border-slate-700">
            View all sectors <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* ── Success Stories ─────────────────────────────────────────────────── */}
      <div className="relative bg-slate-50 dark:bg-slate-950 py-32 px-4 border-t border-gray-200 dark:border-slate-800 overflow-hidden">
        {/* Subtle mesh background effect */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/5 dark:bg-blue-600/10 blur-[100px] rounded-[100%] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto z-10">
          <div className="text-center mb-20">
            <h3 className="inline-block py-1.5 px-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-black tracking-widest text-xs uppercase mb-6 border border-blue-200 dark:border-blue-800/50">Success Stories</h3>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Voices of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500 dark:from-blue-400 dark:to-purple-400">Success</span></h2>
            <p className="mt-4 text-gray-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">Don’t just take our word for it. Hear from professionals who accelerated their careers with Nexus.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "Found my dream job within 2 weeks. The platform's smart matching algorithm is legitimately magical. It connected me completely flawlessly with top companies!",
                name: "Sarah Johnson",
                role: "Product Manager · Tech Corp",
                avatar: "SJ",
                color: "from-pink-500 to-rose-500",
                glow: "hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.3)] hover:border-pink-500/50"
              },
              {
                text: "Great job opportunities and an incredibly supportive community. The one-click apply saved me countless hours. Highly recommended for all tech professionals.",
                name: "Mike Chen",
                role: "Software Engineer · Innovation Labs",
                avatar: "MC",
                color: "from-blue-500 to-indigo-600",
                glow: "hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)] hover:border-blue-500/50"
              },
              {
                text: "Best platform for finding quality talent. Excellent service, precise pipeline tracking, and a very intuitive experience both as an applicant and recruiter!",
                name: "Emily Davis",
                role: "UX Designer · Creative Studios",
                avatar: "ED",
                color: "from-purple-500 to-fuchsia-500",
                glow: "hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)] hover:border-purple-500/50"
              }
            ].map((story, i) => (
              <div key={i} className={`group relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 flex flex-col ${story.glow}`}>
                {/* Large decorative quotation mark */}
                <div className="absolute top-4 right-6 text-[8rem] font-serif font-black text-gray-100 dark:text-slate-800/50 leading-none select-none pointer-events-none group-hover:scale-110 transition-transform duration-500">"</div>
                
                <div className="relative z-10 flex text-amber-500 mb-6 gap-1">
                  {[...Array(5)].map((_, j) => <Star key={j} size={18} fill="currentColor" />)}
                </div>
                
                <p className="relative z-10 text-gray-600 dark:text-slate-300 text-base leading-relaxed mb-10 font-medium">"{story.text}"</p>
                
                <div className="relative z-10 mt-auto flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-slate-800">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm bg-gradient-to-br ${story.color} shadow-lg`}>
                    {story.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">{story.name}</h4>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400 mt-1">{story.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Bottom ─────────────────────────────────────────────────── */}
      <div className="py-24 px-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex justify-center">
        <div className="relative max-w-5xl w-full bg-gradient-to-br from-blue-600 to-indigo-800 dark:from-blue-900 dark:to-indigo-950 rounded-[3rem] p-10 md:p-16 overflow-hidden shadow-2xl shadow-blue-500/20">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-white mb-8 border border-white/20 shadow-xl">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_4px_rgba(74,222,128,0.4)]"></div>
              Trusted by 15,000+ professionals
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black mb-10 leading-tight text-white tracking-tight">
              Ready to Accelerate <br className="hidden md:block"/> Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-300">Career Growth?</span>
            </h2>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full sm:w-auto">
              <button onClick={() => navigate('/register')} className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-gray-50 focus:ring-4 focus:ring-white/50 font-black py-4 px-10 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg">
                Get Started Free
              </button>
              <button onClick={() => navigate('/jobs')} className="w-full sm:w-auto bg-indigo-700/50 hover:bg-indigo-600/60 backdrop-blur-sm border border-indigo-400/30 text-white font-bold py-4 px-10 rounded-2xl transition-all flex items-center justify-center gap-2 hover:-translate-y-1 shadow-xl hover:shadow-2xl text-lg">
                Explore Jobs <ArrowRight size={20} />
              </button>
            </div>
            
            {/* Faces Overlapping Bottom */}
            <div className="mt-16 flex flex-col items-center">
              <div className="flex -space-x-4 mb-4">
                {['bg-gradient-to-br from-pink-500 to-rose-500', 
                  'bg-gradient-to-br from-amber-400 to-orange-500', 
                  'bg-gradient-to-br from-green-400 to-emerald-600', 
                  'bg-gradient-to-br from-blue-400 to-blue-600', 
                  'bg-gradient-to-br from-purple-400 to-indigo-500'].map((color, i) => (
                  <div key={i} className={`w-12 h-12 rounded-full border-2 border-indigo-600 dark:border-indigo-800 shadow-xl flex items-center justify-center text-white text-sm font-black ${color}`}>
                    {['S','N','A','K','P'][i]}
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-2 border-indigo-600 dark:border-indigo-800 bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-black shadow-xl">
                  +15k
                </div>
              </div>
              <p className="text-indigo-100 dark:text-indigo-200 text-sm font-medium">Join our growing community of industry leaders</p>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
