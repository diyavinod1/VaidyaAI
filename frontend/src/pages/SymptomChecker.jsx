import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, ChevronRight, RotateCcw, Languages } from 'lucide-react'
import { useVoice } from '../hooks/useVoice'
import { useTTS } from '../hooks/useTTS'
import VoiceButton from '../components/VoiceButton'
import TypingIndicator from '../components/TypingIndicator'
import EmergencyAlert from '../components/EmergencyAlert'
import LanguageSelector from '../components/LanguageSelector'
import SpeakerButton from '../components/SpeakerButton'
import { symptomChat } from '../api'
import { getLang } from '../utils/languages'
import { transliterate } from '../utils/transliterate'

function buildInitialMessage(langCode) {
  const lang = getLang(langCode)
  return { role: 'assistant', content: lang.greeting, langCode }
}

export default function SymptomChecker({ conversationData, setConversationData }) {
  const navigate = useNavigate()
  const [langCode, setLangCode] = useState('en')
  const lang = getLang(langCode)

  const [messages, setMessages] = useState(
    conversationData.messages.length > 0
      ? conversationData.messages
      : [buildInitialMessage('en')]
  )
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysisData, setAnalysisData] = useState(conversationData.analysis)
  const [isEmergency, setIsEmergency] = useState(false)
  const [emergencyMessage, setEmergencyMessage] = useState('')
  const [turnCount, setTurnCount] = useState(0)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  const { speak, stop, speaking, loading: ttsLoading, activeMsgId } = useTTS()

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(() => { scrollToBottom() }, [messages, isLoading])

  // When language changes: update greeting and reset chat
  const handleLanguageChange = (newCode) => {
    setLangCode(newCode)
    setMessages([buildInitialMessage(newCode)])
    setAnalysisData(null)
    setIsEmergency(false)
    setTurnCount(0)
    setConversationData({ messages: [], analysis: null })
    stop()
  }

  const handleVoiceResult = useCallback(async (text) => {
    setInput(text)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const { isListening, transcript, error: voiceError, isSupported: voiceSupported, startListening, stopListening } =
    useVoice({ onResult: handleVoiceResult, langCode })

  const sendMessage = async (text = input) => {
    if (!text.trim() || isLoading) return

    // Build user message — attempt transliteration for non-English
    let translit = null
    if (langCode !== 'en') {
      translit = await transliterate(text.trim(), langCode)
    }

    const userMessage = {
      role: 'user',
      content: text.trim(),
      transliteration: translit,
      langCode,
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }))

    try {
      const response = await symptomChat(apiMessages, langCode)
      const aiMessage = {
        role: 'assistant',
        content: response.response,
        langCode,
      }
      const finalMessages = [...updatedMessages, aiMessage]
      setMessages(finalMessages)
      setTurnCount(prev => prev + 1)

      if (response.analysis_data?.is_emergency) {
        setIsEmergency(true)
        setEmergencyMessage(response.analysis_data.emergency_message || '')
      }

      if (response.is_analysis && response.analysis_data) {
        setAnalysisData(response.analysis_data)
        setConversationData({ messages: finalMessages, analysis: response.analysis_data })
      } else {
        setConversationData({ messages: finalMessages, analysis: analysisData })
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠ Connection error. Please check your internet and try again.',
        langCode,
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const resetChat = () => {
    setMessages([buildInitialMessage(langCode)])
    setAnalysisData(null)
    setIsEmergency(false)
    setTurnCount(0)
    setConversationData({ messages: [], analysis: null })
    stop()
  }

  // Strip the JSON analysis block from the visible chat text.
  // The JSON is parsed separately by the backend; it should never show in the bubble.
  const stripJsonBlock = (content) => {
    if (!content) return ''
    // Remove ```json ... ``` blocks
    let clean = content.replace(/```json[\s\S]*?```/gi, '')
    // Remove any leftover code fences
    clean = clean.replace(/```[\s\S]*?```/g, '')
    return clean.trim()
  }

  const renderContent = (content) => {
    const clean = stripJsonBlock(content)
    return clean.split('\n').map((line, i) => {
      const html = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
      return <p key={i} className={line === '' ? 'h-1' : ''} dangerouslySetInnerHTML={{ __html: html }} />
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">AI Symptom Check</h1>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Languages size={13} />
            Speak in your language · AI responds in the same language
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector value={langCode} onChange={handleLanguageChange} />
          <button
            onClick={resetChat}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            title="Start over"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Emergency Alert */}
      {isEmergency && (
        <div className="mb-4">
          <EmergencyAlert message={emergencyMessage} onFindHospitals={() => navigate('/hospitals')} />
        </div>
      )}

      {/* Chat window */}
      <div
        className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden"
        style={{ minHeight: '500px', maxHeight: '65vh' }}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* AI avatar */}
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1 self-end">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
              )}

              <div className="flex flex-col max-w-xs md:max-w-md">
                {/* User bubble */}
                {msg.role === 'user' ? (
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="chat-bubble-user">
                      <div className="space-y-0.5 text-sm leading-relaxed">
                        {renderContent(msg.content)}
                      </div>
                    </div>
                    {/* Transliteration below user bubble */}
                    {msg.transliteration && (
                      <div className="text-xs text-slate-400 italic px-2 text-right">
                        ({msg.transliteration})
                      </div>
                    )}
                  </div>
                ) : (
                  /* AI bubble */
                  <div className="flex flex-col items-start gap-0.5">
                    <div className="chat-bubble-ai">
                      <div className="space-y-0.5 text-sm leading-relaxed">
                        {renderContent(msg.content)}
                      </div>
                    </div>
                    {/* TTS button below AI bubble */}
                    <SpeakerButton
                      text={msg.content}
                      ttsLang={getLang(msg.langCode || langCode).ttsLang}
                      msgId={i}
                      onSpeak={speak}
                      onStop={stop}
                      speaking={speaking}
                      loading={ttsLoading}
                      activeMsgId={activeMsgId}
                    />
                  </div>
                )}
              </div>

              {/* User avatar */}
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mb-1 self-end">
                  <span className="text-slate-600 text-xs font-bold">You</span>
                </div>
              )}
            </div>
          ))}

          {isLoading && <TypingIndicator />}

          {/* Live transcript preview */}
          {isListening && transcript && (
            <div className="flex justify-end">
              <div className="chat-bubble-user opacity-60 italic text-sm max-w-xs md:max-w-md">
                {transcript}...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-slate-100 p-4">
          {voiceError && <p className="text-xs text-red-500 mb-2">{voiceError}</p>}

          {isListening && (
            <div className="flex items-center gap-2 text-red-500 text-xs mb-2 animate-pulse">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              {lang.listening}
            </div>
          )}

          <div className="flex items-end gap-3">
            <VoiceButton
              isListening={isListening}
              isSupported={voiceSupported}
              onStart={() => startListening(langCode)}
              onStop={stopListening}
              size="md"
            />
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={lang.placeholder}
                rows={2}
                className="w-full px-4 py-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 resize-none outline-none"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>

          {/* Language badge */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-400">
              Press Enter to send · Shift+Enter for new line · Click mic to use voice
            </p>
            <span className="text-xs text-teal-600 font-medium flex items-center gap-1">
              <span>{lang.flag}</span> {lang.nativeName}
            </span>
          </div>
        </div>
      </div>

      {/* Analysis complete action bar */}
      {analysisData && (
        <div className="mt-4 bg-teal-50 border border-teal-200 rounded-2xl p-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            <p className="text-sm font-semibold text-teal-800">AI Analysis Complete</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/results')}
              className="btn-primary text-sm py-2 flex items-center gap-1.5"
            >
              View Full Results <ChevronRight size={16} />
            </button>
            <button onClick={() => navigate('/hospitals')} className="btn-secondary text-sm py-2">
              Find Hospitals
            </button>
            <button onClick={() => navigate('/summary')} className="btn-secondary text-sm py-2">
              Doctor Summary
            </button>
          </div>
        </div>
      )}

      {turnCount > 0 && turnCount < 3 && !analysisData && (
        <p className="text-center text-xs text-slate-400 mt-3">
          Keep describing your symptoms. The AI will analyze after a few exchanges.
        </p>
      )}

      <p className="text-center text-xs text-slate-400 mt-4">
        ⚠ VaidyaAI is a triage assistant only. Always consult a qualified doctor for diagnosis and treatment.
      </p>
    </div>
  )
}
