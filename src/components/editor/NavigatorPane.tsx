import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { PrimaryButton } from '../atoms/PrimaryButton';
import { Id } from '../../../convex/_generated/dataModel';
// import { PlusIcon } from 'lucide-react';

interface NavigatorPaneProps {
  seriesId: Id<"series">;
  currentChapterId: Id<"chapters">;
  onChapterSelect: (chapterId: Id<"chapters">) => void;
  sessionId: string; // <-- Add sessionId!
}

export default function NavigatorPane({ seriesId, currentChapterId, onChapterSelect, sessionId }: NavigatorPaneProps) {
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
  useEffect(() => {
    if (series?.title) {
      setTitleInput(series.title);
    }
  }, [series?.title]);

  const hasLiveChapters = chapters?.some(c => c.status === 'live') || false;

  const handleTitleBlur = async () => {
    if (!series || titleInput === series.title) return;
    if (!sessionId) {
      alert("You must be logged in to edit series.");
      return;
    }
    setIsUpdating(true);
    try {
      await updateTitle({ sessionId, seriesId, title: titleInput }); // <-- Pass sessionId
    } catch (error) {
      console.error('Failed to update title:', error);
      setTitleInput(series.title); // Revert on error
      alert('Failed to update series title. Series is locked after first publish.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddChapter = async () => {
    if (!sessionId) {
      alert("You must be logged in to add chapters.");
      return;
    }
    try {
      const newChapterId = await createChapter({ sessionId, seriesId }); // <-- Pass sessionId
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
    console.log("sessionId:", sessionId);
    if (!editingChapter || !chapterTitleInput.trim()) return;
    if (!sessionId) {
      alert("You must be logged in to edit chapters.");
      return;
    }
    try {
      await updateChapterTitle({ 
        sessionId,
        chapterId: editingChapter, 
        title: chapterTitleInput.trim() 
      }); // <-- Pass sessionId
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
    <div className="w-80 shrink-0 p-4 border-r-4 border-black bg-white">
      <div className="flex flex-col h-full">
        <h2 className="font-bold mb-4 text-lg">Chapters</h2>
        
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
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

        <button
          onClick={handleAddChapter}
          className={`
            mt-4 px-4 py-3
            neo
            bg-white
            border-4 border-black
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            rounded-sm
            font-bold
            text-black
            hover:bg-gray-50
            active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
            active:translate-x-[2px]
            active:translate-y-[2px]
            focus:outline-none
            focus:ring-2
            focus:ring-primary
            focus:ring-offset-2
            focus:ring-offset-white
            transition-all
            flex items-center justify-center gap-2
          `}
        >
          {/* <PlusIcon className="w-5 h-5" /> */}
          Add Chapter
        </button>
      </div>
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
