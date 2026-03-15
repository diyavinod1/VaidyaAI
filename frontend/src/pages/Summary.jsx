import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Printer, Phone, ArrowLeft, Loader,
  CheckCircle2, AlertCircle, Clock, Stethoscope,
  Activity, MessageSquare, Download
} from 'lucide-react'
import { generateSummary } from '../api'

export default function Summary({ messages, analysis }) {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [phone, setPhone] = useState('')
  const printRef = useRef(null)

  const handleGenerate = async () => {
    if (!messages || messages.length < 2) return
    setLoading(true)
    setError(null)
    try {
      const data = await generateSummary(messages, phone || null)
      setSummary(data.patient_summary)
    } catch (err) {
      setError('Failed to generate summary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatTimestamp = (ts) => {
    if (!ts) return new Date().toLocaleString('en-IN')
    try { return new Date(ts).toLocaleString('en-IN') } catch { return ts }
  }

  const severityColor = (level) => {
    const map = {
      'Mild': 'text-green-700 bg-green-50 border-green-200',
      'Moderate': 'text-yellow-700 bg-yellow-50 border-yellow-200',
      'Severe': 'text-red-700 bg-red-50 border-red-200',
    }
    return map[level] || 'text-slate-700 bg-slate-50 border-slate-200'
  }

  if (!messages || messages.length < 2) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="card">
          <FileText size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-slate-700 mb-3">No Conversation Yet</h2>
          <p className="text-slate-500 mb-6">Complete a symptom check first to generate your doctor summary.</p>
          <button onClick={() => navigate('/checker')} className="btn-primary">
            Start Symptom Check
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header - hide on print */}
      <div className="no-print flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Doctor Summary Card</h1>
          <p className="text-sm text-slate-500">Printable medical triage report for your doctor</p>
        </div>
      </div>

      {/* Generate form - hide on print */}
      {!summary && (
        <div className="card mb-6 no-print">
          <h2 className="font-semibold text-slate-800 mb-4">Generate Your Summary</h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-sm text-slate-600 mb-1">Phone (optional – for SMS)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
              </div>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            {loading ? <Loader size={18} className="animate-spin" /> : <FileText size={18} />}
            {loading ? 'Generating...' : 'Generate Doctor Summary'}
          </button>
        </div>
      )}

      {/* Print Card */}
      {summary && (
        <div>
          {/* Action bar - hide on print */}
          <div className="no-print flex gap-3 mb-6">
            <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
              <Printer size={18} /> Print Summary
            </button>
            <button
              onClick={() => setSummary(null)}
              className="btn-secondary text-sm"
            >
              Regenerate
            </button>
          </div>

          {/* Printable card */}
          <div ref={printRef} className="print-card bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
            {/* Card header */}
            <div className="bg-teal-700 text-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Activity size={20} />
                    <span className="font-mono text-sm uppercase tracking-wider">VaidyaAI</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold">Medical Triage Summary</h2>
                  <p className="text-teal-200 text-sm mt-1">AI-assisted symptom assessment – not a diagnosis</p>
                </div>
                <div className="text-right text-teal-200 text-xs">
                  <div className="flex items-center gap-1 justify-end">
                    <Clock size={12} />
                    {formatTimestamp(summary.timestamp)}
                  </div>
                  {summary.language_used && (
                    <p className="mt-1">Language: {summary.language_used}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Chief complaint */}
              <div>
                <h3 className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                  <MessageSquare size={13} /> Chief Complaint
                </h3>
                <p className="text-slate-800 font-semibold text-lg bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                  {summary.chief_complaint || 'As described in conversation'}
                </p>
              </div>

              {/* Symptoms grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    <Activity size={13} /> Reported Symptoms
                  </h3>
                  <ul className="space-y-1.5">
                    {(summary.reported_symptoms || ['See conversation']).map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle2 size={14} className="text-teal-500 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Duration</h3>
                    <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                      {summary.duration || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Severity Level</h3>
                    <span className={`inline-block text-sm font-semibold px-3 py-1.5 rounded-lg border ${severityColor(summary.severity_level)}`}>
                      {summary.severity_level || 'Moderate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Q&A */}
              {summary.ai_follow_up_qa && summary.ai_follow_up_qa.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                    <MessageSquare size={13} /> AI Follow-up Responses
                  </h3>
                  <div className="space-y-2">
                    {summary.ai_follow_up_qa.map((qa, i) => (
                      <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <p className="text-xs text-slate-500 font-medium mb-1">Q: {qa.question}</p>
                        <p className="text-sm text-slate-800">A: {qa.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Red flags */}
              {summary.red_flags_detected && summary.red_flags_detected.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h3 className="flex items-center gap-2 text-xs uppercase tracking-wider text-red-600 font-semibold mb-2">
                    <AlertCircle size={13} /> Red Flags Detected
                  </h3>
                  <ul className="space-y-1">
                    {summary.red_flags_detected.map((flag, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendation */}
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Stethoscope size={20} className="text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-teal-600 font-semibold mb-1">
                      AI Recommendation
                    </h3>
                    <p className="font-bold text-teal-800 text-lg">
                      See a {summary.suggested_specialty || 'General Physician'}
                    </p>
                    {analysis?.severity && (
                      <p className="text-sm text-teal-700 mt-1">
                        Severity Score: <strong>{analysis.severity}/10</strong>
                      </p>
                    )}
                    {summary.ai_advice && (
                      <p className="text-sm text-teal-600 mt-2">{summary.ai_advice}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 pt-4 text-center">
                <p className="text-xs text-slate-400">
                  Generated by <strong>VaidyaAI</strong> – AI-Assisted Medical Triage | TN Impact Hackathon 2025
                </p>
                <p className="text-xs text-red-500 mt-1">
                  ⚠ This is NOT a medical diagnosis. Please consult a licensed physician.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
