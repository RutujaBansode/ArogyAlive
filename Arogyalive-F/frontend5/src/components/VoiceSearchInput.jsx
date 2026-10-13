import { useEffect, useState } from 'react';
import { Mic, Search } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const VOICE_LANGUAGES = [
  { code: 'en-IN', label: 'English' },
  { code: 'hi-IN', label: 'हिंदी' },
  { code: 'mr-IN', label: 'मराठी' },
];

/**
 * Reusable multilingual text + voice search input.
 * Accepts free text in any language and supports Web Speech API
 * voice input with a selectable recognition language.
 */
export default function VoiceSearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'What health problem do you have?',
  showLanguagePicker = true,
  size = 'lg',
}) {
  const [voiceLang, setVoiceLang] = useState('en-IN');
  const { isListening, transcript, isSupported, error, startListening } = useSpeechRecognition({ lang: voiceLang });

  useEffect(() => {
    if (transcript) {
      onChange(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  function handleMicClick() {
    if (!isSupported) return;
    startListening();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') onSearch();
  }

  const inputPadding = size === 'lg' ? '16px 18px' : '11px 14px';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {showLanguagePicker && (
          <select
            className="al-select"
            style={{ width: 'auto', maxWidth: 110, flexShrink: 0, padding: '10px 8px' }}
            value={voiceLang}
            onChange={(e) => setVoiceLang(e.target.value)}
            aria-label="Voice input language"
          >
            {VOICE_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        )}
        <input
          type="text"
          className="al-input"
          style={{ padding: inputPadding, border: 'none', background: 'transparent' }}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Health concern search"
        />
        <button
          type="button"
          className={`al-mic-btn${isListening ? ' listening' : ''}`}
          onClick={handleMicClick}
          disabled={!isSupported}
          title={isSupported ? 'Speak your health concern' : 'Voice input not supported in this browser'}
          aria-label="Speak your health concern"
        >
          <Mic size={20} />
        </button>
        <button type="button" className="al-btn al-btn-primary" onClick={onSearch} aria-label="Search">
          <Search size={18} />
          <span className="d-none d-sm-inline">Search</span>
        </button>
      </div>
      {!isSupported && (
        <p className="al-muted" style={{ fontSize: '0.8rem', marginTop: 8 }}>
          Voice input isn't supported in this browser — please type your health concern instead.
        </p>
      )}
      {error && (
        <p className="al-muted" style={{ fontSize: '0.8rem', marginTop: 8, color: 'var(--al-danger)' }}>
          Couldn't hear you clearly. Please try again or type your query.
        </p>
      )}
    </div>
  );
}
