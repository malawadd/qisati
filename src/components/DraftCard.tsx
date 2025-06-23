import { GhostButton } from './atoms/GhostButton';

interface DraftCardProps {
  _id: string;
  title: string;
  _creationTime: number;
  wordCount: number;
}

export function DraftCard({ _id, title, _creationTime, wordCount }: DraftCardProps) {
  const lastEdited = new Date(_creationTime).toLocaleDateString();

  return (
    <div className="neo bg-white p-4 hover:-translate-y-1 transition-transform duration-150" 
         style={{ width: '320px', height: '120px' }}>
      <h4 className="font-bold text-lg text-black mb-2 line-clamp-1">{title}</h4>
      <div className="text-sm text-black mb-3">
        Last edited: {lastEdited} • {wordCount.toLocaleString()} words
      </div>
      <div className="flex gap-2">
        <GhostButton className="text-xs px-3 py-1">Edit</GhostButton>
        <GhostButton className="text-xs px-3 py-1">Mint</GhostButton>
      </div>
    </div>
  );
}
