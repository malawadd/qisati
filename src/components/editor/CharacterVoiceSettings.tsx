import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { PrimaryButton } from '../atoms/PrimaryButton';
import { GhostButton } from '../atoms/GhostButton';
import { instructionTemplates, getTemplateById } from '../../data/instructionTemplates';

interface CharacterVoiceSettingsProps {
  sessionId: Id<"walletSessions">;
}

const OPENAI_VOICES = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice' },
  { id: 'ash', name: 'Ash', description: 'Warm, expressive voice' },
  { id: 'ballad', name: 'Ballad', description: 'Melodic, storytelling voice' },
  { id: 'coral', name: 'Coral', description: 'Bright, energetic voice' },
  { id: 'echo', name: 'Echo', description: 'Male, clear and direct' },
  { id: 'fable', name: 'Fable', description: 'British accent, storytelling' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative male' },
  { id: 'nova', name: 'Nova', description: 'Young, energetic female' },
  { id: 'sage', name: 'Sage', description: 'Wise, thoughtful voice' },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft, gentle female' },
  { id: 'verse', name: 'Verse', description: 'Poetic, expressive voice' },
] as const;

export default function CharacterVoiceSettings({ sessionId }: CharacterVoiceSettingsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<Id<"characterVoices"> | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    openaiVoiceId: 'alloy' as const,
    instructions: '',
    description: ''
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

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
        instructions: formData.instructions.trim() || undefined,
        description: formData.description.trim() || undefined,
        characterId: editingId || undefined
      });

      // Reset form
      setFormData({ name: '', openaiVoiceId: 'alloy', instructions: '', description: '' });
      setIsCreating(false);
      setEditingId(null);
      setSelectedTemplate('');
    } catch (error) {
      console.error('Failed to save character voice:', error);
      alert('Failed to save character voice. Please try again.');
    }
  };

  const handleEdit = (character: any) => {
    setFormData({
      name: character.name,
      openaiVoiceId: character.openaiVoiceId,
      instructions: character.instructions || '',
      description: character.description || ''
    });
    setEditingId(character._id);
    setIsCreating(true);
    setSelectedTemplate('');
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
    setFormData({ name: '', openaiVoiceId: 'alloy', instructions: '', description: '' });
    setIsCreating(false);
    setEditingId(null);
    setSelectedTemplate('');
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        setFormData(prev => ({
          ...prev,
          instructions: template.template
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        instructions: ''
      }));
    }
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
                Base Voice
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
              <div className="text-xs text-gray-500 mt-1">
                Choose the base OpenAI voice for this character
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Instruction Template (Optional)
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="neo bg-white w-full px-3 py-2 text-black font-medium"
              >
                <option value="">No template - use base voice only</option>
                {instructionTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-500 mt-1">
                Choose a template to customize the voice behavior, or leave empty for default
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Custom Voice Instructions (Optional)
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="neo bg-white w-full px-3 py-2 text-black font-medium resize-none"
                rows={8}
                placeholder="Enter detailed voice instructions to customize how the AI speaks this character's dialogue..."
              />
              <div className="text-xs text-gray-500 mt-1">
                Describe voice affect, tone, pacing, emotion, pronunciation, and delivery style. Leave empty to use the base voice without modifications.
              </div>
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
                    {OPENAI_VOICES.find(v => v.id === character.openaiVoiceId)?.name || character.openaiVoiceId}
                  </span>
                  {character.instructions && (
                    <span className="neo bg-blue-100 text-black px-2 py-1 text-xs font-bold">
                      Custom Instructions
                    </span>
                  )}
                </div>
                {character.description && (
                  <p className="text-sm text-gray-600 mb-2">{character.description}</p>
                )}
                <p className="text-xs text-gray-500 mb-2">
                  Base Voice: {OPENAI_VOICES.find(v => v.id === character.openaiVoiceId)?.description}
                </p>
                {character.instructions && (
                  <div className="text-xs text-gray-500 max-h-20 overflow-y-auto">
                    <div className="font-medium mb-1">Custom Instructions:</div>
                    <div className="whitespace-pre-wrap bg-gray-50 p-2 rounded">
                      {character.instructions}
                    </div>
                  </div>
                )}
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