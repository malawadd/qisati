import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { PrimaryButton } from './atoms/PrimaryButton';
import { GhostButton } from './atoms/GhostButton';

interface NewChapterModalProps {
  onClose: () => void;
  onChapterCreated: (chapterId: string) => void;
}

export function NewChapterModal({ onClose, onChapterCreated }: NewChapterModalProps) {
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const createChapter = useMutation(api.createChapter.createNewChapter);

  const handleCreate = async () => {
    if (!title.trim()) return;
    
    setIsCreating(true);
    try {
      const result = await createChapter({ title: title.trim() });
      onChapterCreated(result.chapterId);
      onClose();
    } catch (error) {
      console.error('Failed to create chapter:', error);
      alert('Failed to create chapter. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="neo bg-white p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-black mb-4">Start a New Chapter</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-bold text-black mb-2">
            Chapter Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="neo bg-white w-full px-3 py-2 text-black font-medium"
            placeholder="Enter your chapter title..."
            maxLength={100}
            autoFocus
          />
          <div className="text-xs text-gray-500 mt-1">
            This will create a new series with your first chapter
          </div>
        </div>

        <div className="flex gap-3">
          <PrimaryButton 
            onClick={handleCreate} 
            disabled={!title.trim() || isCreating}
            className="flex-1"
          >
            {isCreating ? 'Creating...' : 'Start Writing'}
          </PrimaryButton>
          <GhostButton onClick={onClose}>
            Cancel
          </GhostButton>
        </div>
      </div>
    </div>
  );
}
