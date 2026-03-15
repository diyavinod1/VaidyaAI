import { useState, useRef, useCallback } from 'react'
import { getLang } from '../utils/languages'

export function useVoice({ onResult, langCode = 'en' }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const startListening = useCallback((code) => {
    const activeLang = code || langCode
    const langConfig = getLang(activeLang)

    if (!isSupported) {
      setError('Voice input is not supported. Please use Chrome.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = langConfig.speechLang
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      setTranscript('')
    }

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) final += result[0].transcript
        else interim += result[0].transcript
      }
      const text = final || interim
      setTranscript(text)
      if (final && onResult) onResult(final.trim())
    }

    recognition.onerror = (event) => {
      setError('Voice error: ' + event.error + '. Please try again.')
      setIsListening(false)
    }

    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported, langCode, onResult])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop()
    setIsListening(false)
  }, [])

  return { isListening, transcript, error, isSupported, startListening, stopListening }
}
