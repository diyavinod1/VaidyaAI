import { Link, useLocation } from 'react-router-dom'
import { Activity, MapPin, FileText, Stethoscope, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { to: '/', label: 'Home', icon: null },
  { to: '/checker', label: 'Symptom Check', icon: Stethoscope },
  { to: '/hospitals', label: 'Hospitals', icon: MapPin },
  { to: '/summary', label: 'My Summary', icon: FileText },
]

export default function Navbar() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-slate-800">VaidyaAI</span>
              <span className="hidden sm:block text-xs text-teal-600 font-body -mt-1">Multilingual Health Assistant</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === to
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                }`}
              >
                {Icon && <Icon size={15} />}
                {label}
              </Link>
            ))}
            <Link
              to="/checker"
              className="ml-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
            >
              Start Check →
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 animate-fade-in">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg mx-1 mb-1 ${
                  location.pathname === to
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {Icon && <Icon size={16} />}
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
