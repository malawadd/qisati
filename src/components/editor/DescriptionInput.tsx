import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface DescriptionInputProps {
  description: string;
  seriesId: Id<"series">;
  sessionId: string;
}

export default function DescriptionInput({ description, seriesId, sessionId }: DescriptionInputProps) {
  const [value, setValue] = useState(description);
  const updateMeta = useMutation(api.seriesMutations.updateSeriesMeta);

  const handleBlur = async () => {
    if (value === description) return;
    
    try {
      await updateMeta({
        sessionId,
        seriesId,
        description: value
      });
    } catch (error) {
      console.error('Failed to update description:', error);
      setValue(description); // Reset on error
    }
  };

  return (
    <textarea
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={handleBlur}
      rows={4}
      className={`
        w-full px-4 py-2
        neo
        bg-white
        border-4 border-black
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        rounded-sm
        text-black
        placeholder:text-gray-400
        focus:outline-none
        focus:ring-2
        focus:ring-primary
        focus:ring-offset-2
        focus:ring-offset-white
        transition-shadow
        resize-y
        min-h-[120px]
      `}
      placeholder="Enter series description..."
    />
  );
}