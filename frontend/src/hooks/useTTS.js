import { useState, useCallback, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─── Text cleaner (mirrors backend, safety net for frontend display) ─────────
function cleanForTTS(text) {
  if (!text) return ''
  let t = text
  t = t.replace(/```json[\s\S]*?```/gi, '')
  t = t.replace(/```[\s\S]*?```/g, '')
  t = t.replace(/`[^`]*`/g, '')
  t = t.replace(/\*\*(.*?)\*\*/g, '$1')
  t = t.replace(/\*(.*?)\*/g, '$1')
  return t.replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * useTTS — calls the backend /tts endpoint which uses:
 *   1. Google Cloud TTS  (if GOOGLE_TTS_API_KEY is set in backend .env)
 *   2. gTTS fallback     (free, no key needed, pip install gTTS)
 *
 * The backend returns base64-encoded MP3 audio which is played via an
 * HTML Audio element — this guarantees correct pronunciation for all
 * Indian languages (Tamil, Malayalam, Telugu, Kannada, Hindi).
 *
 * NO browser SpeechSynthesis is used for Indian languages.
 */
export function useTTS() {
  const [speaking, setSpeaking]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [activeMsgId, setActiveMsgId] = useState(null)
  const [error, setError]           = useState(null)
  const audioRef                    = useRef(null)

  // Always supported — we generate audio server-side
  const isSupported = true

  // ── Stop current playback ────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    setSpeaking(false)
    setLoading(false)
    setActiveMsgId(null)
  }, [])

  // ── Main speak function ──────────────────────────────────────────────────
  const speak = useCallback(async (rawText, ttsLang, msgId) => {
    if (!rawText) return

    // Stop any currently playing audio first
    stop()

    const text = cleanForTTS(rawText)
    if (!text) return

    // Normalise lang code: "ml-IN" → "ml", "ta-IN" → "ta"
    const langCode = (ttsLang || 'en-IN').toLowerCase().split('-')[0]

    setLoading(true)
    setActiveMsgId(msgId)
    setError(null)

    try {
      // ── Call backend TTS endpoint ───────────────────────────────────────
      const response = await fetch(`${API_BASE}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang_code: langCode }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `TTS request failed: ${response.status}`)
      }

      const data = await response.json()
      const { audio_base64, format } = data

      if (!audio_base64) throw new Error('No audio data received from server')

      // ── Decode base64 → Blob → Object URL → play ───────────────────────
      const byteCharacters = atob(audio_base64)
      const byteNumbers    = new Uint8Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const mimeType  = format === 'wav' ? 'audio/wav' : 'audio/mpeg'
      const blob      = new Blob([byteNumbers], { type: mimeType })
      const objectUrl = URL.createObjectURL(blob)

      const audio = new Audio(objectUrl)
      audioRef.current = audio

      audio.oncanplaythrough = () => {
        setLoading(false)
        setSpeaking(true)
        audio.play().catch(e => {
          console.error('Audio play error:', e)
          setSpeaking(false)
          setActiveMsgId(null)
        })
      }

      audio.onended = () => {
        URL.revokeObjectURL(objectUrl)
        setSpeaking(false)
        setActiveMsgId(null)
        audioRef.current = null
      }

      audio.onerror = (e) => {
        URL.revokeObjectURL(objectUrl)
        console.error('Audio element error:', e)
        setError('Audio playback failed')
        setSpeaking(false)
        setLoading(false)
        setActiveMsgId(null)
        audioRef.current = null
      }

      audio.load()

    } catch (err) {
      console.error('[TTS] Error:', err.message)
      setError(err.message)
      setLoading(false)
      setSpeaking(false)
      setActiveMsgId(null)
    }
  }, [stop])

  return { speak, stop, speaking, loading, activeMsgId, error, isSupported }
}
