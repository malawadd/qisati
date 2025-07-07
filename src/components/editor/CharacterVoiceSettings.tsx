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

export default function CharacterVoiceSettings({ sessionId }: CharacterVoiceSettingsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<Id<"characterVoices"> | null>(null);
  const [formData, setFormData] = useState({
    name: '',
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
        instructions: formData.instructions.trim(),
        description: formData.description.trim() || undefined,
        characterId: editingId || undefined
      });

      // Reset form
      setFormData({ name: '', instructions: '', description: '' });
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
      instructions: character.instructions,
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
    setFormData({ name: '', instructions: '', description: '' });
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
                Instruction Template (Optional)
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="neo bg-white w-full px-3 py-2 text-black font-medium"
              >
                <option value="">Select a template...</option>
                {instructionTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-500 mt-1">
                Choose a template to auto-fill instructions, or write your own below
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Voice Instructions
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="neo bg-white w-full px-3 py-2 text-black font-medium resize-none"
                rows={8}
                placeholder="Enter detailed voice instructions for the AI model..."
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                Describe voice affect, tone, pacing, emotion, pronunciation, and delivery style
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
                    Custom Voice
                  </span>
                </div>
                {character.description && (
                  <p className="text-sm text-gray-600">{character.description}</p>
                )}
                <div className="text-xs text-gray-500 mt-2 max-h-20 overflow-y-auto">
                  <div className="font-medium mb-1">Instructions:</div>
                  <div className="whitespace-pre-wrap">{character.instructions}</div>
                </div>
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