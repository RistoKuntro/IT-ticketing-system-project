const colorMap = {
  open: 'yellow',
  in_progress: 'indigo',
  closed: 'green',
  cancelled: 'gray',
  low: 'green',
  medium: 'yellow',
  high: 'red',
  admin: 'purple',
  user: 'blue',
} as const;

export const Badge = ({ label }: { label: string, variant: 'status' | 'priority' | 'role' }) => {
  const color = colorMap[label as keyof typeof colorMap] ?? 'gray';
  const backgroundClass = `bg-${color}-500`;

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${backgroundClass} text-white`}>
      {label}
    </span>
  );
};
