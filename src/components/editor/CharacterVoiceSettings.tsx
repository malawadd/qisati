import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { PrimaryButton } from '../atoms/PrimaryButton';
import { GhostButton } from '../atoms/GhostButton';

interface CharacterVoiceSettingsProps {
  sessionId: Id<"walletSessions">;
}

const OPENAI_VOICES = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice' },
  { id: 'echo', name: 'Echo', description: 'Male, clear and direct' },
  { id: 'fable', name: 'Fable', description: 'British accent, storytelling' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative male' },
  { id: 'nova', name: 'Nova', description: 'Young, energetic female' },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft, gentle female' },
] as const;

export default function CharacterVoiceSettings({ sessionId }: CharacterVoiceSettingsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<Id<"characterVoices"> | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    openaiVoiceId: 'alloy' as const,
    description: ''
  });

  const characterVoices = useQuery(api.queries.getCharacterVoicesByUser, { sessionId });
  const saveCharacterVoice = useMutation(api.mutations.saveCharacterVoice);
  const deleteCharacterVoice = useMutation(api.mutations.deleteCharacterVoice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await saveCharacterVoice({
        sessionId,
        name: formData.name.trim(),
        openaiVoiceId: formData.openaiVoiceId,
        description: formData.description.trim() || undefined,
        characterId: editingId || undefined
      });

      // Reset form
      setFormData({ name: '', openaiVoiceId: 'alloy', description: '' });
      setIsCreating(false);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to save character voice:', error);
      alert('Failed to save character voice. Please try again.');
    }
  };

  const handleEdit = (character: any) => {
    setFormData({
      name: character.name,
      openaiVoiceId: character.openaiVoiceId,
      description: character.description || ''
    });
    setEditingId(character._id);
    setIsCreating(true);
  };

  const handleDelete = async (characterId: Id<"characterVoices">) => {
    if (!confirm('Are you sure you want to delete this character voice?')) return;

    try {
      await deleteCharacterVoice({ sessionId, characterId });
    } catch (error) {
      console.error('Failed to delete character voice:', error);
      alert('Failed to delete character voice. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', openaiVoiceId: 'alloy', description: '' });
    setIsCreating(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-black">Character Voices</h3>
        {!isCreating && (
          <PrimaryButton onClick={() => setIsCreating(true)}>
            + Add Character
          </PrimaryButton>
        )}
      </div>

      {/* Character Creation/Edit Form */}
      {isCreating && (
        <div className="neo bg-gray-50 p-4">
          <h4 className="font-bold text-black mb-4">
            {editingId ? 'Edit Character' : 'Create New Character'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Character Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="neo bg-white w-full px-3 py-2 text-black font-medium"
                placeholder="e.g., Sarah, Detective Morgan, Narrator"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Voice
              </label>
              <select
                value={formData.openaiVoiceId}
                onChange={(e) => setFormData({ ...formData, openaiVoiceId: e.target.value as any })}
                className="neo bg-white w-full px-3 py-2 text-black font-medium"
              >
                {OPENAI_VOICES.map(voice => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} - {voice.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="neo bg-white w-full px-3 py-2 text-black font-medium resize-none"
                rows={2}
                placeholder="Notes about this character's voice or personality"
              />
            </div>

            <div className="flex gap-3">
              <PrimaryButton type="submit">
                {editingId ? 'Update' : 'Create'} Character
              </PrimaryButton>
              <GhostButton type="button" onClick={handleCancel}>
                Cancel
              </GhostButton>
            </div>
          </form>
        </div>
      )}

      {/* Character List */}
      <div className="space-y-3">
        {characterVoices?.map((character) => (
          <div key={character._id} className="neo bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-black">{character.name}</h4>
                  <span className="neo bg-primary text-white px-2 py-1 text-xs font-bold">
                    {OPENAI_VOICES.find(v => v.id === character.openaiVoiceId)?.name}
                  </span>
                </div>
                {character.description && (
                  <p className="text-sm text-gray-600">{character.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Voice: {OPENAI_VOICES.find(v => v.id === character.openaiVoiceId)?.description}
                </p>
              </div>
              <div className="flex gap-2">
                <GhostButton
                  onClick={() => handleEdit(character)}
                  className="text-xs px-3 py-1"
                >
                  Edit
                </GhostButton>
                <GhostButton
                  onClick={() => handleDelete(character._id)}
                  className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200"
                >
                  Delete
                </GhostButton>
              </div>
            </div>
          </div>
        ))}

        {characterVoices?.length === 0 && !isCreating && (
          <div className="neo bg-gray-100 p-8 text-center">
            <p className="text-black font-medium mb-4">No character voices created yet</p>
            <p className="text-sm text-gray-600 mb-4">
              Create character voices to generate audio for dialogue in your stories
            </p>
            <PrimaryButton onClick={() => setIsCreating(true)}>
              Create Your First Character
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}