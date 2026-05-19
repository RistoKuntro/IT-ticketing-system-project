export const Badge = ({ children, color }: { children: React.ReactNode, color: string }) => {
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold bg-${color}-500 text-white`}>
      {children}
    </span>
  );
};
