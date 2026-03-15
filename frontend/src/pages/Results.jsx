import { useNavigate } from 'react-router-dom'
import {
  Stethoscope, AlertTriangle, CheckCircle2, MapPin,
  FileText, Activity, BarChart2, ArrowLeft, RefreshCw
} from 'lucide-react'
import EmergencyAlert from '../components/EmergencyAlert'

const severityColors = {
  low: { bar: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', label: 'Low' },
  medium: { bar: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Moderate' },
  high: { bar: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', label: 'High' },
  critical: { bar: 'bg-red-600', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: 'Critical' },
}

const specialistIcons = {
  'Cardiologist': '🫀',
  'Neurologist': '🧠',
  'Dermatologist': '🔬',
  'Orthopedic Doctor': '🦴',
  'ENT Specialist': '👂',
  'Pediatrician': '👶',
  'General Physician': '🏥',
  'Gastroenterologist': '🫁',
  'Endocrinologist': '⚗️',
  'Ophthalmologist': '👁️',
}

function getSeverityLevel(score) {
  if (score <= 3) return 'low'
  if (score <= 6) return 'medium'
  if (score <= 8) return 'high'
  return 'critical'
}

export default function Results({ analysis, messages }) {
  const navigate = useNavigate()

  if (!analysis) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="card">
          <Activity size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-slate-700 mb-3">No Analysis Yet</h2>
          <p className="text-slate-500 mb-6">
            Please complete the symptom check first to see your results.
          </p>
          <button onClick={() => navigate('/checker')} className="btn-primary">
            Start Symptom Check
          </button>
        </div>
      </div>
    )
  }

  const severityLevel = getSeverityLevel(analysis.severity || 5)
  const colors = severityColors[severityLevel]
  const specialistEmoji = specialistIcons[analysis.specialist] || '🏥'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/checker')}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Analysis Results</h1>
          <p className="text-sm text-slate-500">Based on your reported symptoms</p>
        </div>
      </div>

      {/* Emergency Alert */}
      {analysis.is_emergency && (
        <div className="mb-6">
          <EmergencyAlert
            message={analysis.emergency_message}
            onFindHospitals={() => navigate('/hospitals')}
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Specialist Recommendation */}
        <div className="card border-2 border-teal-100 col-span-full">
          <div className="flex items-start gap-4">
            <div className="text-5xl">{specialistEmoji}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-teal-600 uppercase tracking-wide mb-1">Recommended Specialist</p>
              <h2 className="font-display text-3xl font-bold text-slate-800 mb-2">
                {analysis.specialist || 'General Physician'}
              </h2>
              <p className="text-slate-600 text-sm">{analysis.advice}</p>
            </div>
            <div className="text-right">
              <div className="bg-teal-600 text-white text-2xl font-bold font-mono w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                {analysis.confidence || 75}%
              </div>
              <p className="text-xs text-slate-500 mt-1 text-center">Confidence</p>
            </div>
          </div>
        </div>

        {/* Severity Score */}
        <div className={`card border ${colors.border} ${colors.bg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart2 size={20} className={colors.text} />
              <span className="font-semibold text-slate-700">Severity Score</span>
            </div>
            <span className={`text-2xl font-bold font-mono ${colors.text}`}>
              {analysis.severity || 5}/10
            </span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full ${colors.bar} rounded-full transition-all duration-1000`}
              style={{ width: `${((analysis.severity || 5) / 10) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Mild</span>
            <span className={`font-semibold ${colors.text}`}>{colors.label}</span>
            <span>Critical</span>
          </div>
        </div>

        {/* Symptom Summary */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={20} className="text-slate-500" />
            <span className="font-semibold text-slate-700">Symptom Summary</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {analysis.follow_up_summary || 'Based on your reported symptoms, the AI has made the above recommendations.'}
          </p>
        </div>

        {/* Possible Conditions */}
        <div className="card col-span-full">
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope size={20} className="text-slate-500" />
            <span className="font-semibold text-slate-700">Possible Condition Categories</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(analysis.conditions || ['Requires evaluation']).map((condition, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium"
              >
                <CheckCircle2 size={14} className="text-teal-500" />
                {condition}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            ⚠ These are possible symptom categories, not diagnoses. Only a doctor can diagnose your condition.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mt-8">
        <button
          onClick={() => navigate('/hospitals')}
          className="btn-primary flex items-center gap-2"
        >
          <MapPin size={18} />
          Find Nearby Hospitals
        </button>
        <button
          onClick={() => navigate('/summary')}
          className="btn-secondary flex items-center gap-2"
        >
          <FileText size={18} />
          Generate Doctor Summary
        </button>
        <button
          onClick={() => navigate('/checker')}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Start New Check
        </button>
      </div>
    </div>
  )
}
