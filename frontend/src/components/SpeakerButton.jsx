import { Volume2, Square, Loader } from 'lucide-react'

/**
 * SpeakerButton — play/stop/loading states for a single AI message.
 * Shows a spinner while the backend TTS API is generating audio.
 */
export default function SpeakerButton({
  text, ttsLang, msgId,
  onSpeak, onStop,
  speaking, loading, activeMsgId,
}) {
  const isThisActive   = activeMsgId === msgId
  const isThisSpeaking = speaking && isThisActive
  const isThisLoading  = loading  && isThisActive

  const handleClick = () => {
    if (isThisSpeaking || isThisLoading) {
      onStop()
    } else {
      onSpeak(text, ttsLang, msgId)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isThisLoading}
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all mt-1 select-none ${
        isThisSpeaking
          ? 'bg-teal-100 text-teal-700 border border-teal-300'
          : isThisLoading
          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-wait'
          : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50 border border-transparent'
      }`}
      title={isThisSpeaking ? 'Stop audio' : isThisLoading ? 'Generating audio…' : 'Play audio'}
    >
      {isThisLoading ? (
        <>
          <Loader size={11} className="animate-spin" />
          <span>Loading…</span>
        </>
      ) : isThisSpeaking ? (
        <>
          <Square size={11} className="fill-current" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 size={11} />
          <span>🔊 Play</span>
        </>
      )}
    </button>
  )
}
