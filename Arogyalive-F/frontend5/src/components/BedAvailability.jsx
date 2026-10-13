import { BedDouble, HeartPulse, Siren, Wind, Activity } from 'lucide-react';
import AvailabilityBadge from './AvailabilityBadge';

const bedMeta = {
  general: { label: 'General Bed', emoji: '🛏️', Icon: BedDouble },
  icu: { label: 'ICU Beds', emoji: '❤️‍🩹', Icon: HeartPulse },
  emergency: { label: 'Emergency Beds', emoji: '🚨', Icon: Siren },
  oxygen: { label: 'Oxygen Beds', emoji: '🫧', Icon: Wind },
  ventilator: { label: 'Ventilator Beds', emoji: '🌬️', Icon: Activity },
};

/**
 * Reusable bed availability panel.
 * Under General Hospital -> General Beds: ONLY ONE General Bed option.
 * ICU and Emergency beds are strictly removed from General Hospital.
 */
export default function BedAvailability({ beds, hospital, hospitalType, compact = false }) {
  if (!beds) return null;

  const isGeneral =
    hospitalType === 'General' ||
    hospital?.type === 'General' ||
    hospital?.name?.toLowerCase().includes('general') ||
    beds.isGeneralHospital ||
    ((!beds.icu || beds.icu.total === 0) && (!beds.emergency || beds.emergency.total === 0));

  // For General Hospital, show ONLY ONE General Bed option. Remove ICU, Emergency, etc.
  const entries = Object.entries(bedMeta).filter(([key]) => {
    if (isGeneral) {
      return key === 'general';
    }
    return beds[key] && beds[key].total > 0;
  });

  if (compact) {
    return (
      <div className="al-grid al-grid-2" style={{ gap: 10 }}>
        {entries.map(([key, meta]) => {
          const bed = beds[key] || { available: 0 };
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
              <span aria-hidden="true">{meta.emoji}</span>
              <span className="al-muted">{isGeneral ? 'General Bed (1 option)' : meta.label.replace(' Beds', '')}:</span>
              <strong>{bed.available}</strong>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="al-grid al-grid-2">
      {entries.map(([key, meta]) => {
        const bed = beds[key];
        if (!bed) return null;
        const total = bed.total || 1;
        const pct = Math.round((bed.available / total) * 100);
        return (
          <div key={key} className="al-card al-card-accent" style={{ padding: 16 }}>
            <div className="al-flex-between" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <span className="al-icon-circle" style={{ width: 34, height: 34, borderRadius: 10, margin: 0 }} aria-hidden="true">
                  {meta.emoji}
                </span>
                {isGeneral && key === 'general' ? 'General Bed (1 Option)' : meta.label}
              </div>
              <AvailabilityBadge status={bed.status} />
            </div>
            <div className="al-muted" style={{ fontSize: '0.85rem', marginBottom: 10 }}>
              <strong style={{ color: 'var(--al-text)' }}>{bed.available}</strong> available of {bed.total} total
              <span style={{ marginLeft: 8 }}>({bed.occupied} occupied)</span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: 'var(--al-surface-hover)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  borderRadius: 999,
                  background: bed.status === 'Full' ? 'var(--al-danger)' : bed.status === 'Limited' ? 'var(--al-warning)' : 'var(--al-gradient)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
