import { AlertTriangle, Phone, Navigation } from 'lucide-react'

export default function EmergencyAlert({ message, onFindHospitals }) {
  return (
    <div className="emergency-banner animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertTriangle size={40} className="text-yellow-300 animate-bounce" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-display font-bold mb-2">
            ⚠ POSSIBLE MEDICAL EMERGENCY
          </h2>
          <p className="text-red-100 text-lg mb-4">
            {message || 'Your symptoms may indicate a serious condition. Seek immediate medical care.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:108"
              className="inline-flex items-center justify-center gap-2 bg-white text-red-600 font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-all"
            >
              <Phone size={18} />
              Call 108 – Ambulance
            </a>
            <button
              onClick={onFindHospitals}
              className="inline-flex items-center justify-center gap-2 bg-red-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-800 border border-red-500 transition-all"
            >
              <Navigation size={18} />
              Find Emergency Hospitals
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
