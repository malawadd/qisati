interface AvatarProps {
  src?: string;
  alt: string;
  size?: number;
}

export function Avatar({ src, alt, size = 40 }: AvatarProps) {
  return (
    <div 
      className="neo bg-gray-200 rounded-full overflow-hidden flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src || undefined} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="text-black font-bold text-sm">
          {alt.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
