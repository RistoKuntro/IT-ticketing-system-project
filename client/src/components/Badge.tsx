const colorMap = {
  open: 'yellow',
  in_progress: 'indigo',
  closed: 'green',
  archived: 'gray',
  cancelled: 'gray',
  none: 'gray',
  low: 'green',
  medium: 'yellow',
  high: 'red',
  admin: 'purple',
  specialist: 'indigo',
  user: 'blue',
} as const;

export const Badge = ({ label }: { label: string, variant?: 'status' | 'priority' | 'role' }) => {
  const color = colorMap[label as keyof typeof colorMap] ?? 'gray';

  return (
    <span className={`badge badge-${color}`}>
      {label.replace('_', ' ')}
    </span>
  );
};
