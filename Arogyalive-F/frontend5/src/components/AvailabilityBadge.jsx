import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

const statusConfig = {
  Available: { cls: 'al-badge-available', Icon: CheckCircle2 },
  Limited: { cls: 'al-badge-limited', Icon: AlertCircle },
  Full: { cls: 'al-badge-full', Icon: XCircle },
};

export default function AvailabilityBadge({ status, label }) {
  const config = statusConfig[status] || { cls: 'al-badge-neutral', Icon: AlertCircle };
  const { cls, Icon } = config;
  return (
    <span className={`al-badge ${cls}`}>
      <Icon size={13} />
      {label || status}
    </span>
  );
}
