import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { LANGUAGES } from '../utils/languages'

export default function LanguageSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = LANGUAGES.find(l => l.code === value) || LANGUAGES[0]

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:border-teal-400 hover:text-teal-700 transition-all shadow-sm"
      >
        <Globe size={15} className="text-teal-500" />
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="hidden sm:block">{selected.nativeName}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 min-w-[180px] overflow-hidden animate-fade-in">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { onChange(lang.code); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                lang.code === value
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg leading-none">{lang.flag}</span>
              <div>
                <div className="font-medium">{lang.nativeName}</div>
                {lang.nativeName !== lang.name && (
                  <div className="text-xs text-slate-400">{lang.name}</div>
                )}
              </div>
              {lang.code === value && (
                <span className="ml-auto text-teal-500">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
