import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { LockIcon } from 'lucide-react';

interface TitleInputProps {
  title: string;
  seriesId: Id<"series">;
  sessionId: Id<"walletSessions">;
  disabled?: boolean;
}

export default function TitleInput({ title, seriesId, sessionId, disabled }: TitleInputProps) {
  const [value, setValue] = useState(title);
  const updateMeta = useMutation(api.seriesMutations.updateSeriesMeta);

  const handleBlur = () => {
    if (value === title || disabled) return;
    
    // Move async operation inside
    void (async () => {
      try {
        await updateMeta({
          sessionId,
          seriesId,
          title: value
        });
      } catch (error) {
        console.error('Failed to update title:', error);
        setValue(title); // Reset on error
      }
    })();
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
        className={`
          w-full px-4 py-2 
          neo 
          bg-white
          border-4 border-black 
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
          rounded-sm
          font-bold
          text-black
          placeholder:text-gray-400
          focus:outline-none
          focus:ring-2
          focus:ring-primary
          focus:ring-offset-2
          focus:ring-offset-white
          disabled:bg-gray-100
          disabled:cursor-not-allowed
          transition-shadow
        `}
        placeholder="Enter series title..."
      />
      {disabled && (
        <LockIcon 
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        />
      )}
    </div>
  );
}