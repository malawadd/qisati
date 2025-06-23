interface GhostButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function GhostButton({ children, onClick, className = '' }: GhostButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`neo bg-white text-black font-bold px-6 py-3 hover:scale-105 transition-transform duration-150 ${className}`}
    >
      {children}
    </button>
  );
}
