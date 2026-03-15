// Transliteration using the free Google Input Tools API
// Falls back gracefully if unavailable

const TRANSLITERATE_LANGS = ['ta', 'hi', 'ml', 'te', 'kn']

// Google Transliterate API endpoint (free, no auth needed)
const GOOGLE_TRANSLITERATE_URL = 'https://inputtools.google.com/request'

/**
 * Transliterate native script text to Latin/Roman script.
 * Only applies for non-English languages.
 * Returns null for English or if transliteration fails.
 */
export async function transliterate(text, langCode) {
  if (!text || !text.trim() || !TRANSLITERATE_LANGS.includes(langCode)) {
    return null
  }

  // Map our lang codes to Google's itc codes
  const itcMap = {
    ta: 'ta-t-i0-und',
    hi: 'hi-t-i0-und',
    ml: 'ml-t-i0-und',
    te: 'te-t-i0-und',
    kn: 'kn-t-i0-und',
  }

  const itc = itcMap[langCode]
  if (!itc) return null

  try {
    const params = new URLSearchParams({
      text: text,
      itc: itc,
      num: 1,
      cp: 0,
      cs: 1,
      ie: 'utf-8',
      oe: 'utf-8',
      app: 'demopage',
    })

    const res = await fetch(`${GOOGLE_TRANSLITERATE_URL}?${params}`, {
      method: 'GET',
    })

    if (!res.ok) return null
    const data = await res.json()

    // Response format: [status, [[word, [transliterations]], ...]]
    if (data && data[0] === 'SUCCESS' && data[1]) {
      const parts = data[1]
      const romanized = parts.map(p => (p[1] && p[1][0]) ? p[1][0] : p[0]).join(' ')
      return romanized || null
    }
    return null
  } catch {
    // Silently fail — transliteration is an enhancement, not required
    return null
  }
}

/**
 * Simple client-side romanization fallback for when the API is unavailable.
 * Uses basic character maps for each language.
 */
export function simpleRomanize(text, langCode) {
  if (!text || langCode === 'en') return null
  // Return a styled indicator that the text is in native script
  const langNames = { ta: 'Tamil', hi: 'Hindi', ml: 'Malayalam', te: 'Telugu', kn: 'Kannada' }
  return `[${langNames[langCode] || 'Native'} script]`
}
