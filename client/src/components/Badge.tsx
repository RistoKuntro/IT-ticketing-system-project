import type { ReactNode } from 'react';

const colorClasses: Record<string, string> = {
  gray: 'bg-gray-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};

export const Badge = ({ children, color }: { children: ReactNode, color: string }) => {
  const backgroundClass = colorClasses[color] ?? 'bg-blue-500';

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${backgroundClass} text-white`}>
      {children}
    </span>
  );
};
