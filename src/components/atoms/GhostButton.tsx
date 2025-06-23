interface GhostButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function GhostButton({ children, onClick, className = '', type = 'button' }: GhostButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`neo bg-white text-black font-bold px-6 py-3 hover:scale-105 transition-transform duration-150 ${className}`}
    >
      {children}
    </button>
  );
}
