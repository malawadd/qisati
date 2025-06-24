/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

const CATEGORY_OPTIONS = [
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "fantasy", label: "Fantasy" },
  { value: "thriller", label: "Thriller" },
  { value: "romance", label: "Romance" },
  { value: "mystery", label: "Mystery" },
  { value: "literary", label: "Literary" },
] as const;

type CategoryType = typeof CATEGORY_OPTIONS[number]['value'];

interface CategorySelectorProps {
  category?: CategoryType;
  seriesId: Id<"series">;
  sessionId: Id<"walletSessions">;
  disabled?: boolean;
}

export default function CategorySelector({
  category,
  seriesId,
  sessionId,
  disabled,
}: CategorySelectorProps) {
  const [selected, setSelected] = useState<CategoryType>(category ?? "sci-fi");
  const updateMeta = useMutation(api.seriesMutations.updateSeriesMeta);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as CategoryType;
    setSelected(value);

    try {
      await updateMeta({
        sessionId,
        seriesId,
        category: value,
      });
    } catch (error) {
      console.error('Failed to update category:', error);
      setSelected(category ?? "sci-fi"); // revert on error
    }
  };

  return (
    <select
      value={selected}
      onChange={handleChange}
      disabled={disabled}
      className={`
        w-full px-4 py-2
        neo bg-white border-4 border-black
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        rounded-sm font-bold text-black
        placeholder:text-gray-400
        focus:outline-none focus:ring-2 focus:ring-primary
        focus:ring-offset-2 focus:ring-offset-white
        disabled:bg-gray-100 disabled:cursor-not-allowed
        transition-shadow
      `}
    >
      {CATEGORY_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
