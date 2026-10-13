import { RotateCcw } from 'lucide-react';
import { departments } from '../data/mockData';

const specializations = ['All', ...departments.map((d) => d.name)];
const hospitalTypes = ['All', 'Multispeciality', 'General', 'Specialty'];

export default function FilterPanel({ filters, onChange, onReset }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="al-card">
      <div className="al-flex-between" style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Filters</h3>
        <button className="al-btn al-btn-secondary al-btn-sm" onClick={onReset}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="al-stack">
        <div>
          <label className="al-label">Specialization</label>
          <select className="al-select" value={filters.specialization} onChange={(e) => update('specialization', e.target.value)}>
            {specializations.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="al-label">Max Distance: {filters.maxDistance} km</label>
          <input
            type="range"
            min="1"
            max="15"
            value={filters.maxDistance}
            onChange={(e) => update('maxDistance', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label className="al-label">Hospital Type</label>
          <select className="al-select" value={filters.hospitalType} onChange={(e) => update('hospitalType', e.target.value)}>
            {hospitalTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="al-stack-sm">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
            <input type="checkbox" checked={filters.doctorAvailable} onChange={(e) => update('doctorAvailable', e.target.checked)} />
            Doctor Availability
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
            <input type="checkbox" checked={filters.bedsAvailable} onChange={(e) => update('bedsAvailable', e.target.checked)} />
            Bed Availability
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
            <input type="checkbox" checked={filters.icuAvailable} onChange={(e) => update('icuAvailable', e.target.checked)} />
            ICU Availability
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
            <input type="checkbox" checked={filters.emergencyAvailable} onChange={(e) => update('emergencyAvailable', e.target.checked)} />
            Emergency Availability
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
            <input type="checkbox" checked={filters.opdAvailable} onChange={(e) => update('opdAvailable', e.target.checked)} />
            OPD Availability
          </label>
        </div>
      </div>
    </div>
  );
}
