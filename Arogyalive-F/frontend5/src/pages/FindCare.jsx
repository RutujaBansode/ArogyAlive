import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Stethoscope, ArrowRight, CheckCircle2, Sparkles, Building2, Brain } from 'lucide-react';
import VoiceSearchInput from '../components/VoiceSearchInput';
import FilterPanel from '../components/FilterPanel';
import HospitalCard from '../components/HospitalCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { categoryToSpecialization, resolveSpecializationFromQuery, resolveSymptomMatches } from '../data/mockData';
import { searchHospitals } from '../services/hospitalService';

const categories = [
  'Heart & Chest', 'Respiratory', 'Neurology', 'Orthopedics', 'Eye', 'Dental',
  'ENT', 'Dermatology', "Women's Health", 'Pediatrics', 'General Medicine', 'Other',
];

const defaultFilters = {
  specialization: 'All',
  maxDistance: 15,
  doctorAvailable: false,
  bedsAvailable: false,
  icuAvailable: false,
  emergencyAvailable: false,
  opdAvailable: false,
  hospitalType: 'All',
};

export default function FindCare() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [category, setCategory] = useState(null);
  const [symptomMatch, setSymptomMatch] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState('all');
  const [specialization, setSpecialization] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [hospitals, setHospitals] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const initialQuery = searchParams.get('query');
    if (initialQuery) {
      handleSearchExecution(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchExecution(searchTerm) {
    if (!searchTerm.trim()) return;
    const match = resolveSymptomMatches(searchTerm);
    if (match) {
      setSymptomMatch(match);
      setSelectedOptionId('all');
      // If symptom has multiple options, search for all matching specializations together
      const specs = match.options.map((o) => o.specialization);
      setSpecialization(specs);
      setFilters((f) => ({ ...f, specialization: specs }));
    } else {
      setSymptomMatch(null);
      const spec = resolveSpecializationFromQuery(searchTerm);
      setSpecialization(spec);
      setFilters((f) => ({ ...f, specialization: spec }));
    }
  }

  useEffect(() => {
    if (!specialization) return;
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialization, filters]);

  function runSearch() {
    setStatus('loading');
    const effectiveSpec = filters.specialization !== 'All' ? filters.specialization : specialization;
    searchHospitals({ ...filters, specialization: effectiveSpec })
      .then((res) => {
        setHospitals(res);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }

  function handleTextSearch() {
    if (!query.trim()) return;
    handleSearchExecution(query);
  }

  function handleCategoryClick(cat) {
    setCategory(cat);
    setSymptomMatch(null);
    const spec = categoryToSpecialization[cat] || 'General Medicine';
    setSpecialization(spec);
    setFilters((f) => ({ ...f, specialization: spec }));
  }

  function handleOptionSelect(optionId) {
    setSelectedOptionId(optionId);
    if (!symptomMatch) return;

    if (optionId === 'all') {
      const specs = symptomMatch.options.map((o) => o.specialization);
      setSpecialization(specs);
      setFilters((f) => ({ ...f, specialization: specs }));
    } else {
      const selected = symptomMatch.options.find((o) => o.id === optionId);
      if (selected) {
        setSpecialization(selected.specialization);
        setFilters((f) => ({ ...f, specialization: selected.specialization }));
      }
    }
  }

  function handleReset() {
    setFilters({ ...defaultFilters, specialization: filters.specialization });
  }

  function handleStartOver() {
    setSpecialization(null);
    setCategory(null);
    setSymptomMatch(null);
    setSelectedOptionId('all');
    setQuery('');
    setFilters(defaultFilters);
    setStatus('idle');
  }

  return (
    <div className="al-container" style={{ paddingTop: 32 }}>
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <h1 style={{ marginBottom: 8 }}>Arogya Care</h1>
        <p className="al-muted">Tell us your concern and we'll match you to the right care options and hospitals in Solapur.</p>
      </div>

      <div className="al-card" style={{ maxWidth: 760, margin: '0 auto 28px' }}>
        <VoiceSearchInput
          value={query}
          onChange={setQuery}
          onSearch={handleTextSearch}
          placeholder="Describe your health concern (e.g. Headache, Fever, Cough, Chest pain)..."
        />
      </div>

      {!specialization && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ textAlign: 'center', marginBottom: 18, fontSize: '1.05rem' }}>Or choose a health concern category</h3>
          <div className="al-grid al-grid-4">
            {categories.map((cat) => (
              <button
                key={cat}
                className="al-card al-card-hover"
                style={{ border: category === cat ? '2px solid var(--al-primary)' : undefined, cursor: 'pointer', textAlign: 'left' }}
                onClick={() => handleCategoryClick(cat)}
              >
                <Stethoscope size={18} color="var(--al-primary)" style={{ marginBottom: 8 }} />
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{cat}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {specialization && (
        <>
          {/* Multiple options for Symptom Matches (e.g. Headache -> General Hospital + Neurology) */}
          {symptomMatch ? (
            <div className="al-card" style={{ marginBottom: 24, border: '1.5px solid var(--al-primary)' }}>
              <div className="al-flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--al-primary)', fontWeight: 700, marginBottom: 4 }}>
                    <Sparkles size={18} />
                    <span>Search Result: {symptomMatch.queryLabel}</span>
                  </div>
                  <p className="al-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                    A normal headache does not necessarily require neurology. We have matched both <strong>General Hospital</strong> and <strong>Neurology</strong> options for your review:
                  </p>
                </div>
                <button className="al-btn al-btn-secondary al-btn-sm" onClick={handleStartOver}>
                  Start Over
                </button>
              </div>

              {/* Option Selector Cards */}
              <div className="al-grid al-grid-3" style={{ gap: 12, marginBottom: 12 }}>
                <button
                  type="button"
                  className={`al-card al-card-hover ${selectedOptionId === 'all' ? 'al-card-accent' : ''}`}
                  style={{
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: 14,
                    border: selectedOptionId === 'all' ? '2px solid var(--al-primary)' : '1px solid var(--al-border)',
                    background: selectedOptionId === 'all' ? 'var(--al-primary-light)' : 'var(--al-surface)',
                  }}
                  onClick={() => handleOptionSelect('all')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: '0.95rem' }}>All Matching Care</strong>
                    {selectedOptionId === 'all' && <CheckCircle2 size={16} color="var(--al-primary)" />}
                  </div>
                  <p className="al-muted" style={{ fontSize: '0.82rem', margin: 0 }}>
                    Show both General Hospital and Neurology facilities in Solapur
                  </p>
                </button>

                {symptomMatch.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`al-card al-card-hover ${selectedOptionId === opt.id ? 'al-card-accent' : ''}`}
                    style={{
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: 14,
                      border: selectedOptionId === opt.id ? '2px solid var(--al-primary)' : '1px solid var(--al-border)',
                      background: selectedOptionId === opt.id ? 'var(--al-primary-light)' : 'var(--al-surface)',
                    }}
                    onClick={() => handleOptionSelect(opt.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {opt.specialization === 'Neurology' ? <Brain size={16} color="var(--al-primary)" /> : <Building2 size={16} color="var(--al-primary)" />}
                        <strong style={{ fontSize: '0.95rem' }}>{opt.title}</strong>
                      </div>
                      {selectedOptionId === opt.id && <CheckCircle2 size={16} color="var(--al-primary)" />}
                    </div>
                    <p className="al-muted" style={{ fontSize: '0.82rem', margin: 0 }}>
                      {opt.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="al-card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, background: 'var(--al-surface-hover)' }}>
              <Stethoscope size={20} color="var(--al-primary)" />
              <span>Recommended specialization:</span>
              <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ArrowRight size={16} /> {Array.isArray(specialization) ? specialization.join(' + ') : specialization}
              </strong>
              <button
                className="al-btn al-btn-secondary al-btn-sm"
                style={{ marginLeft: 'auto' }}
                onClick={handleStartOver}
              >
                Start Over
              </button>
            </div>
          )}

          <div className="al-grid" style={{ gridTemplateColumns: '280px 1fr', alignItems: 'start' }}>
            <FilterPanel filters={filters} onChange={setFilters} onReset={handleReset} />

            <div>
              {status === 'loading' && <LoadingSpinner label="Finding nearby suitable hospitals in Solapur..." />}
              {status === 'error' && <ErrorState onRetry={runSearch} />}
              {status === 'success' && hospitals.length === 0 && (
                <EmptyState
                  title="No hospitals match your filters"
                  message="Try widening your distance range or clearing a few filters."
                  action={<button className="al-btn al-btn-outline" onClick={handleReset}>Reset Filters</button>}
                />
              )}
              {status === 'success' && hospitals.length > 0 && (
                <div className="al-stack">
                  {hospitals.map((h) => (
                    <HospitalCard
                      key={h.id}
                      hospital={h}
                      matchedDepartment={
                        Array.isArray(specialization)
                          ? h.departments.find((d) => specialization.includes(d)) || specialization[0]
                          : specialization
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
