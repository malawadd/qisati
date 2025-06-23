import { GhostButton } from './atoms/GhostButton';
import { ProgressBar } from './atoms/ProgressBar';

interface LiveChapterCardProps {
  _id: string;
  title: string;
  supply: number;
  remaining: number;
  priceEth: number;
}

export function LiveChapterCard({ _id, title, supply, remaining, priceEth }: LiveChapterCardProps) {
  const sold = supply - remaining;
  const progress = (sold / supply) * 100;

  return (
    <div className="neo bg-white p-4 hover:-translate-y-1 transition-transform duration-150" 
         style={{ width: '320px', height: '120px' }}>
      <h4 className="font-bold text-lg text-black mb-2 line-clamp-1">{title}</h4>
      <div className="text-sm text-black mb-2">
        {sold}/{supply} sold • {priceEth} ETH each
      </div>
      <ProgressBar progress={progress} className="mb-3" />
      <div className="flex gap-2">
        <GhostButton className="text-xs px-3 py-1">Airdrop</GhostButton>
        <GhostButton className="text-xs px-3 py-1">Close Sale</GhostButton>
      </div>
    </div>
  );
}
