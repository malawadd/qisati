interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function PrimaryButton({ children, onClick, className = '', disabled, type = 'button' }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`neo bg-primary text-white font-bold px-6 py-3 hover:scale-105 transition-transform duration-150 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
