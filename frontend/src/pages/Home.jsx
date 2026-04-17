import { Link } from 'react-router-dom'
import {
  Mic, Shield, MapPin, FileText, Stethoscope,
  ChevronRight, Globe, Heart, Clock, Star,
  ArrowRight, CheckCircle2
} from 'lucide-react'

const features = [
  {
    icon: Mic,
    color: 'bg-teal-50 text-teal-600',
    title: 'Voice First',
    desc: 'Speak symptoms in your OWN LANGUAGE. No typing required. Perfect for rural patients.',
  },
  {
    icon: Shield,
    color: 'bg-red-50 text-red-500',
    title: 'Emergency Detection',
    desc: 'AI instantly detects life-threatening symptoms and alerts you with emergency guidance.',
  },
  {
    icon: Stethoscope,
    color: 'bg-blue-50 text-blue-600',
    title: 'Smart Triage',
    desc: 'AI asks intelligent follow-up questions and recommends the right specialist for your condition.',
  },
  {
    icon: MapPin,
    color: 'bg-emerald-50 text-emerald-600',
    title: 'Nearby Hospitals',
    desc: 'Find verified hospitals, clinics and specialists near you using live map data.',
  },
  {
    icon: FileText,
    color: 'bg-purple-50 text-purple-600',
    title: 'Doctor Summary',
    desc: 'Generate a printable medical summary card to hand directly to your doctor.',
  },
  {
    icon: Globe,
    color: 'bg-orange-50 text-orange-500',
    title: 'Multilingual AI',
    desc: 'Fully conversational in both multiple languages for maximum accessibility.',
  },
]

const specialists = [
  'Cardiologist', 'Neurologist', 'Dermatologist',
  'Orthopedic', 'ENT Specialist', 'Pediatrician',
  'General Physician', 'Gastroenterologist',
]

const steps = [
  { num: '01', title: 'Speak Your Symptoms', desc: 'Use voice or text in your language' },
  { num: '02', title: 'AI Asks Follow-ups', desc: 'Intelligent questions to understand your condition' },
  { num: '03', title: 'Get Specialist Match', desc: 'AI recommends the right doctor for you' },
  { num: '04', title: 'Find & Visit Hospital', desc: 'Navigate to the nearest appropriate clinic' },
]

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500 rounded-full opacity-10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500 rounded-full opacity-10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600 rounded-full opacity-5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-teal-700/50 border border-teal-500/30 rounded-full px-4 py-1.5 text-sm text-teal-200 mb-8">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              Healthcare AI - AI that understands your health
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Your Health,{' '}
              <span className="text-teal-400">Your Language</span>
            </h1>

            <p className="text-xl md:text-2xl text-teal-100 mb-4 font-body">
              Speak symptoms in <strong>your language</strong>.<br />
              AI listens, asks follow-ups, recommends the right specialist.
            </p>

            <p className="text-lg text-slate-300 font-mono mb-10">
              Your Personal Health Assistant
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/checker"
                className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-semibold text-lg px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5"
              >
                <Mic size={22} />
                Start Symptom Check
                <ArrowRight size={18} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-lg px-8 py-4 rounded-2xl transition-all duration-200 backdrop-blur-sm"
              >
                Learn How It Works
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-teal-200 text-sm">
              {[
                { icon: Shield, text: 'Privacy First – No data stored' },
                { icon: Clock, text: 'Available 24/7' },
                { icon: Star, text: 'Free to use' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon size={15} className="text-teal-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 55 800 0 480 30C240 52 80 25 0 20L0 60Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl font-bold text-slate-800 mb-4">
            Built for Rural India
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Bridging the healthcare access gap with AI that understands local languages and realities.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="card hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
              <h3 className="font-display font-semibold text-xl text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-slate-800 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-500">Four simple steps to get the right care</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-3/4 w-1/2 h-0.5 bg-teal-100 z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-mono font-bold text-xl shadow-lg">
                    {step.num}
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialists */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-slate-800 mb-3">
            Specialists We Route To
          </h2>
          <p className="text-slate-500">AI matches your symptoms to the right expert</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {specialists.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-100 px-4 py-2 rounded-full text-sm font-medium"
            >
              <CheckCircle2 size={14} />
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-600 py-16">
        <div className="max-w-3xl mx-auto text-center px-4">
          <Heart size={40} className="text-white/30 mx-auto mb-4" />
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Don't Wait. Get Guidance Now.
          </h2>
          <p className="text-teal-100 text-lg mb-8">
            Free, anonymous, available in multiple languages. No appointment needed.
          </p>
          <Link
            to="/checker"
            className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold text-lg px-8 py-4 rounded-2xl hover:bg-teal-50 transition-all shadow-lg"
          >
            <Mic size={22} />
            Begin Symptom Check
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p className="mb-1">
          <strong className="text-white">VaidyaAI</strong> – Multilingual AI Health Assistant
        </p>
        <p className="mt-2 text-xs text-slate-600">
          ⚠ This is a triage assistant only. Not a substitute for professional medical advice.
        </p>
      </footer>
    </div>
  )
}
