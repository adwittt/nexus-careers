import { Linkedin, Twitter, Github, Heart, Mail, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Footer() {
  const auth = useAuth()
  const user = auth?.user
  const getDashboardPath = auth?.getDashboardPath
  
  const platformLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse Jobs', path: '/jobs' },
    ...(user ? [
      { name: 'Dashboard', path: getDashboardPath ? getDashboardPath() : '/' },
      { name: 'Profile', path: '/profile' }
    ] : [
      { name: 'Register', path: '/register' },
      { name: 'Login', path: '/login' }
    ])
  ]

  return (
    <footer className="relative bg-slate-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 pt-20 pb-10 overflow-hidden transition-colors">
      
      {/* Background glow effect for dark mode */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-2 mb-6 group w-fit">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Nexus<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Careers</span>
              </span>
            </Link>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-8 leading-relaxed pr-4">
              Pioneering the future of recruitment. We connect ambitious professionals with world-class opportunities globally. 
              Your next defining chapter starts right here.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Linkedin, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Github, href: '#' }
              ].map((social, i) => (
                <a key={i} href={social.href} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white hover:border-blue-600 transition-all shadow-sm hover:shadow-blue-500/25">
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-6">Platform</h3>
            <ul className="space-y-4">
              {platformLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-6">Support</h3>
            <ul className="space-y-4">
              {['Help Center', 'Privacy Policy', 'Terms & Conditions', 'Cookie Policy'].map(link => (
                <li key={link}>
                  <a href="#" className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-6">Get In Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-900 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Mail size={16} />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Email us</span>
                  <a href="mailto:adwitkumar86@gmail.com" className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">adwitkumar86@gmail.com</a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-900 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Phone size={16} />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Call us</span>
                  <a href="tel:+917480950216" className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">+91 7480950216</a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-900 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <MapPin size={16} />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Visit us</span>
                  <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Lovely Professional University, Punjab</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
            © {new Date().getFullYear()} NexusCareers. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400 flex items-center gap-1.5 bg-gray-50 dark:bg-slate-900 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-800">
              Built with <Heart size={14} className="text-red-500 fill-current animate-pulse" /> for job seekers & recruiters
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
