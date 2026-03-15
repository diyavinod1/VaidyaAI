// All supported languages with Web Speech API locale codes,
// BCP-47 TTS voices, display names, flags and UI strings.

export const LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    speechLang: 'en-IN',
    ttsLang: 'en-IN',
    placeholder: 'Type your symptoms here...',
    listening: 'Listening... speak now',
    greeting: "Hello! I'm VaidyaAI, your health assistant.\n\nPlease tell me: What symptoms are you experiencing today?",
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    speechLang: 'ta-IN',
    ttsLang: 'ta-IN',
    placeholder: 'உங்கள் அறிகுறிகளை இங்கே தட்டச்சு செய்யுங்கள்...',
    listening: 'கேட்கிறேன்... இப்போது பேசுங்கள்',
    greeting: "வணக்கம்! நான் VaidyaAI, உங்கள் உடல்நல உதவியாளர்.\n\nதயவுசெய்து சொல்லுங்கள்: இன்று உங்களுக்கு என்ன அறிகுறிகள் உள்ளன?",
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    speechLang: 'hi-IN',
    ttsLang: 'hi-IN',
    placeholder: 'अपने लक्षण यहाँ लिखें...',
    listening: 'सुन रहा हूँ... अभी बोलें',
    greeting: "नमस्ते! मैं VaidyaAI हूँ, आपका स्वास्थ्य सहायक।\n\nकृपया बताएं: आज आपको क्या लक्षण हो रहे हैं?",
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    speechLang: 'ml-IN',
    ttsLang: 'ml-IN',
    placeholder: 'നിങ്ങളുടെ ലക്ഷണങ്ങൾ ഇവിടെ ടൈപ്പ് ചെയ്യുക...',
    listening: 'ശ്രദ്ധിക്കുന്നു... ഇപ്പോൾ സംസാരിക്കൂ',
    greeting: "നമസ്കാരം! ഞാൻ VaidyaAI ആണ്, നിങ്ങളുടെ ആരോഗ്യ സഹായി.\n\nദയവായി പറയൂ: ഇന്ന് നിങ്ങൾക്ക് എന്ത് ലക്ഷണങ്ങളാണ് ഉള്ളത്?",
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    speechLang: 'te-IN',
    ttsLang: 'te-IN',
    placeholder: 'మీ లక్షణాలను ఇక్కడ టైప్ చేయండి...',
    listening: 'వినడం జరుగుతోంది... ఇప్పుడు మాట్లాడండి',
    greeting: "నమస్కారం! నేను VaidyaAI, మీ ఆరోగ్య సహాయకుడు.\n\nదయచేసి చెప్పండి: నేడు మీకు ఏ లక్షణాలు ఉన్నాయి?",
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    speechLang: 'kn-IN',
    ttsLang: 'kn-IN',
    placeholder: 'ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...',
    listening: 'ಆಲಿಸುತ್ತಿದ್ದೇನೆ... ಈಗ ಮಾತನಾಡಿ',
    greeting: "ನಮಸ್ಕಾರ! ನಾನು VaidyaAI, ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಹಾಯಕ.\n\nದಯವಿಟ್ಟು ಹೇಳಿ: ಇಂದು ನಿಮಗೆ ಯಾವ ರೋಗಲಕ್ಷಣಗಳಿವೆ?",
  },
]

export const LANG_MAP = Object.fromEntries(LANGUAGES.map(l => [l.code, l]))

export function getLang(code) {
  return LANG_MAP[code] || LANG_MAP['en']
}
