import { Mic, MicOff, Loader } from 'lucide-react'

export default function VoiceButton({ isListening, isSupported, onStart, onStop, size = 'md' }) {
  const sizes = {
    sm: { btn: 'w-10 h-10', icon: 16 },
    md: { btn: 'w-14 h-14', icon: 22 },
    lg: { btn: 'w-20 h-20', icon: 30 },
  }
  const s = sizes[size]

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          disabled
          className={`${s.btn} bg-slate-200 text-slate-400 rounded-full flex items-center justify-center cursor-not-allowed`}
          title="Voice not supported in this browser"
        >
          <MicOff size={s.icon} />
        </button>
        <span className="text-xs text-slate-400">Use Chrome for voice</span>
      </div>
    )
  }

  return (
    <button
      onClick={isListening ? onStop : onStart}
      className={`relative ${s.btn} rounded-full flex items-center justify-center transition-all duration-300 ${
        isListening
          ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200'
          : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-200 hover:scale-105'
      }`}
      title={isListening ? 'Stop recording' : 'Start voice input'}
    >
      {/* Ripple effect when listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" style={{ animationDelay: '0.3s' }} />
        </>
      )}
      {isListening ? <MicOff size={s.icon} /> : <Mic size={s.icon} />}
    </button>
  )
}
