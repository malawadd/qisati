interface ChapterCardProps {
  index: number;
  title: string;
  wordCount: number;
  status: 'draft' | 'live' | 'coming';
  price: string;
  supply: {
    current: number;
    total: number;
  };
  onClick?: () => void;
}

export function ChapterCard({ index, title, wordCount, status, price, supply, onClick }: ChapterCardProps) {
  const statusColors = {
    draft: 'bg-gray-400',
    live: 'bg-neo-green',
    coming: 'bg-yellow-400'
  };

  return (
    <div 
      className="neo bg-white p-6 cursor-pointer hover:-translate-y-1 transition-transform duration-150"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="neo bg-black text-white px-3 py-1 text-sm font-bold">
          {String(index).padStart(2, '0')}
        </div>
        <div className={`neo ${statusColors[status]} text-black px-3 py-1 text-xs font-bold`}>
          {status.toUpperCase()}
        </div>
      </div>
      
      <h4 className="font-bold text-lg text-black mb-2 line-clamp-2">
        {title}
      </h4>
      
      <div className="text-sm text-black mb-4">
        {wordCount.toLocaleString()} words
      </div>
      
      <div className="flex items-center justify-between">
        <span className="neo bg-primary text-white px-3 py-1 text-sm font-bold">
          {price}
        </span>
        <span className="neo bg-gray-200 text-black px-3 py-1 text-xs font-bold">
          {supply.current}/{supply.total}
        </span>
      </div>
    </div>
  );
}
