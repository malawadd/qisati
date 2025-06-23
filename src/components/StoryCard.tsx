import { Avatar } from './atoms/Avatar';
import { ProgressBar } from './atoms/ProgressBar';

interface StoryCardProps {
  id: string;
  title: string;
  author: {
    name: string;
    avatar?: string;
  };
  cover: string;
  price: string;
  supply: {
    current: number;
    total: number;
  };
  onClick?: () => void;
}

export function StoryCard({ title, author, cover, price, supply, onClick }: StoryCardProps) {
  const progress = (supply.current / supply.total) * 100;

  return (
    <div 
      className="neo bg-white p-4 cursor-pointer hover:-translate-y-1 transition-transform duration-150"
      style={{ width: '320px', height: '440px' }}
      onClick={onClick}
    >
      <div className="h-48 bg-gray-200 mb-4 overflow-hidden">
        <img src={cover} alt={title} className="w-full h-full object-cover" />
      </div>
      
      <h3 className="font-bold text-lg text-black mb-2 line-clamp-2 leading-tight">
        {title}
      </h3>
      
      <div className="flex items-center gap-3 mb-4">
        <Avatar src={author.avatar} alt={author.name} />
        <span className="font-medium text-black">{author.name}</span>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <span className="neo bg-primary text-white px-3 py-1 text-sm font-bold">
          {price}
        </span>
        <span className="text-sm font-medium text-black">
          {supply.current}/{supply.total}
        </span>
      </div>
      
      <ProgressBar progress={progress} />
    </div>
  );
}
