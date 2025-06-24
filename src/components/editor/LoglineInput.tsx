import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';


interface LoglineInputProps {
  logline: string;
  seriesId: Id<"series">;
  sessionId: Id<"walletSessions">;
}

export default function LoglineInput({ logline, seriesId, sessionId }: LoglineInputProps) {
  const [value, setValue] = useState(logline);
  const updateMeta = useMutation(api.seriesMutations.updateSeriesMeta);

  const handleBlur = () => {
    

    void (async () => {
      try {
        await updateMeta({
          sessionId,
          seriesId,
          logline: value
        });
      } catch (error) {
        console.error('Failed to update logline:', error);
        setValue(logline); // Reset on error
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
        placeholder="Enter series logline..."
      />
      
    </div>
  );
}
