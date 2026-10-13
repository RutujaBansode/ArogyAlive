import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircleHeart, X, Search, Mic } from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const exampleQueries = [
  'I need a cardiologist near me',
  'I need an orthopedic doctor',
  'Find a hospital with ICU beds',
  'Where can I get emergency care?',
];

export default function VoiceAssistant() {
  const { isOpen, toggleAssistant, closeAssistant } = useAssistant();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { isListening, transcript, isSupported, startListening } = useSpeechRecognition({ lang: 'en-IN' });

  if (transcript && transcript !== query) {
    setQuery(transcript);
  }

  function handleSearch(q) {
    const text = q ?? query;
    if (!text.trim()) return;
    closeAssistant();
    setQuery('');
    navigate(`/find-care?query=${encodeURIComponent(text)}`);
  }

  return (
    <>
      <button
        className="al-assistant-fab"
        onClick={toggleAssistant}
        aria-label="Open Arogya Live health assistant"
      >
        {isOpen ? <X size={24} /> : <MessageCircleHeart size={26} />}
      </button>

      {isOpen && (
        <div className="al-assistant-panel" role="dialog" aria-label="Arogya Live Assistant">
          <div className="al-flex-between" style={{ marginBottom: 12 }}>
            <strong>Arogya Live Assistant</strong>
            <button className="al-icon-btn" onClick={closeAssistant} aria-label="Close assistant" style={{ width: 30, height: 30 }}>
              <X size={15} />
            </button>
          </div>
          <p className="al-muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
            Tell me your health concern in your own words — English, Hindi or Marathi.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              className="al-input"
              placeholder="e.g. I need a cardiologist near me"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              className={`al-mic-btn${isListening ? ' listening' : ''}`}
              onClick={startListening}
              disabled={!isSupported}
              title="Speak your health concern"
              aria-label="Speak your health concern"
            >
              <Mic size={18} />
            </button>
          </div>

          <button className="al-btn al-btn-primary al-btn-block" onClick={() => handleSearch()} style={{ marginBottom: 14 }}>
            <Search size={16} /> Search
          </button>

          <div>
            <p className="al-label" style={{ marginBottom: 8 }}>Try asking</p>
            <div className="al-stack-sm">
              {exampleQueries.map((q) => (
                <button
                  key={q}
                  className="al-btn al-btn-secondary al-btn-sm al-btn-block"
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => handleSearch(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
