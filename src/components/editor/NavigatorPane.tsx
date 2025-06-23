import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { PrimaryButton } from '../atoms/PrimaryButton';
import { Id } from '../../../convex/_generated/dataModel';

interface NavigatorPaneProps {
  seriesId: Id<"series">;
  currentChapterId: Id<"chapters">;
  onChapterSelect: (chapterId: Id<"chapters">) => void;
}

export default function NavigatorPane({ seriesId, currentChapterId, onChapterSelect }: NavigatorPaneProps) {
  const series = useQuery(api.queries.seriesById, { id: seriesId });
  const chapters = useQuery(api.queries.chaptersForSeries, { seriesId });
  const updateTitle = useMutation(api.seriesMutations.updateSeriesTitle);
  const updateChapterTitle = useMutation(api.seriesMutations.updateChapterTitle);
  const createChapter = useMutation(api.seriesMutations.createDraftChapter);
  
  const [titleInput, setTitleInput] = useState(series?.title || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Id<"chapters"> | null>(null);
  const [chapterTitleInput, setChapterTitleInput] = useState('');

  // Update local state when series data loads
  useState(() => {
    if (series?.title) {
      setTitleInput(series.title);
    }
  });

  const hasLiveChapters = chapters?.some(c => c.status === 'live') || false;

  const handleTitleBlur = async () => {
    if (!series || titleInput === series.title) return;
    
    setIsUpdating(true);
    try {
      await updateTitle({ seriesId, title: titleInput });
    } catch (error) {
      console.error('Failed to update title:', error);
      setTitleInput(series.title); // Revert on error
      alert('Failed to update series title. Series is locked after first publish.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddChapter = async () => {
    try {
      const newChapterId = await createChapter({ seriesId });
      onChapterSelect(newChapterId);
    } catch (error) {
      console.error('Failed to create chapter:', error);
      alert('Failed to create new chapter. Please try again.');
    }
  };

  const handleChapterTitleEdit = (chapter: any) => {
    setEditingChapter(chapter._id);
    setChapterTitleInput(chapter.title || '');
  };

  const handleChapterTitleSave = async () => {
    if (!editingChapter || !chapterTitleInput.trim()) return;
    
    try {
      await updateChapterTitle({ 
        chapterId: editingChapter, 
        title: chapterTitleInput.trim() 
      });
      setEditingChapter(null);
      setChapterTitleInput('');
    } catch (error) {
      console.error('Failed to update chapter title:', error);
      alert('Failed to update chapter title. Please try again.');
    }
  };

  const handleChapterTitleCancel = () => {
    setEditingChapter(null);
    setChapterTitleInput('');
  };

  if (!series || !chapters) {
    return (
      <div className="w-64 neo bg-white p-4">
        <div className="text-black font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-64 neo bg-white p-4 overflow-y-auto">
      {/* Editable Series Title */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-black mb-2">
          SERIES TITLE
        </label>
        <input
          type="text"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          onBlur={handleTitleBlur}
          disabled={hasLiveChapters || isUpdating}
          className={`neo bg-white w-full px-3 py-2 text-black font-medium text-sm focus:border-[#A589E8] ${
            hasLiveChapters ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          placeholder="Enter series title..."
        />
        {hasLiveChapters && (
          <div className="text-xs text-gray-500 mt-1">
            Series locked after first publish
          </div>
        )}
      </div>

      {/* Chapter List */}
      <div className="mb-4">
        <div className="text-xs font-bold text-black mb-2">CHAPTERS</div>
        <div className="space-y-1">
          {chapters.map((chapter) => (
            <ChapterRow
              key={chapter._id}
              chapter={chapter}
              isActive={chapter._id === currentChapterId}
              isEditing={editingChapter === chapter._id}
              titleInput={chapterTitleInput}
              onTitleInputChange={setChapterTitleInput}
              onSelect={() => onChapterSelect(chapter._id)}
              onEdit={() => handleChapterTitleEdit(chapter)}
              onSave={handleChapterTitleSave}
              onCancel={handleChapterTitleCancel}
            />
          ))}
        </div>
      </div>

      {/* Add Chapter Button */}
      <PrimaryButton
        onClick={handleAddChapter}
        className="w-full text-sm"
      >
        + Add Chapter
      </PrimaryButton>
    </div>
  );
}

interface ChapterRowProps {
  chapter: any;
  isActive: boolean;
  isEditing: boolean;
  titleInput: string;
  onTitleInputChange: (value: string) => void;
  onSelect: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

function ChapterRow({ 
  chapter, 
  isActive, 
  isEditing, 
  titleInput, 
  onTitleInputChange, 
  onSelect, 
  onEdit, 
  onSave, 
  onCancel 
}: ChapterRowProps) {
  return (
    <div
      className={`neo w-full px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-[#A589E8] text-white'
          : 'bg-white text-black hover:bg-gray-100'
      }`}
    >
      {isEditing ? (
        <div className="flex items-center gap-2">
          <span className="text-xs">{chapter.index}.</span>
          <input
            type="text"
            value={titleInput}
            onChange={(e) => onTitleInputChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') onSave();
              if (e.key === 'Escape') onCancel();
            }}
            onBlur={onSave}
            className="flex-1 bg-transparent border-b border-current text-xs focus:outline-none"
            autoFocus
          />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button
            onClick={onSelect}
            className="flex-1 text-left"
          >
            {chapter.index}. {chapter.title || 'Untitled'}
          </button>
          <div className="flex items-center gap-1">
            {chapter.status === 'live' && (
              <span className="text-xs">✔︎</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-xs opacity-50 hover:opacity-100"
              title="Edit title"
            >
              ✏
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
