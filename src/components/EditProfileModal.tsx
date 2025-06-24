/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState, useEffect } from 'react';
import { useMutation, useAction, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { PrimaryButton } from './atoms/PrimaryButton';
import { GhostButton } from './atoms/GhostButton';

interface EditProfileModalProps {
  user: any;
  onClose: () => void;
  sessionId: string;
}

interface Social {
  platform: string;
  url: string;
  displayText?: string;
}

export function EditProfileModal({ user, onClose, sessionId }: EditProfileModalProps) {

  const [handle, setHandle] = useState(user.handle || '');
  const [about, setAbout] = useState(user.about || '');
  const [socials, setSocials] = useState<Social[]>(
    user.socials || [{ platform: '', url: '', displayText: '' }]
  );
  const [handleError, setHandleError] = useState('');
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);

  const updateProfile = useMutation(api.profiles.updateProfile);
  const uploadImage = useAction(api.profiles.uploadImage);
  const checkHandle = useQuery(
    api.profiles.checkHandleAvailable, 
    handle && handle !== user.handle ? { sessionId, handle } : "skip"
  );

  // Check handle availability when it changes
  useEffect(() => {
    if (handle && handle !== user.handle) {
      setIsCheckingHandle(true);
      // The query will automatically update when handle changes
    }
  }, [handle, user.handle]);

  // Update error state when check result changes
  useEffect(() => {
    if (checkHandle) {
      setIsCheckingHandle(false);
      if (!checkHandle.available) {
        setHandleError(checkHandle.error || 'Handle not available');
      } else {
        setHandleError('');
      }
    }
  }, [checkHandle]);

  const addSocialRow = () => {
    setSocials([...socials, { platform: '', url: '', displayText: '' }]);
  };

  const updateSocial = (index: number, field: keyof Social, value: string) => {
    const updated = [...socials];
    updated[index] = { ...updated[index], [field]: value };
    setSocials(updated);
  };

  const removeSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      // Don't save if handle has an error
      if (handleError) {
        return;
      }

      const validSocials = socials.filter(s => s.platform && s.url);
      const updates: any = { sessionId, about, socials: validSocials };
      
      // Only include handle if it changed
      if (handle !== user.handle) {
        updates.handle = handle;
      }

      await updateProfile(updates);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      if (error instanceof Error) {
        setHandleError(error.message);
      }
    }
  };

  const isHandleValid = handle.length >= 3 && handle.length <= 20 && /^[a-zA-Z0-9_]+$/.test(handle);
  const canSave = isHandleValid && !handleError && !isCheckingHandle;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="neo bg-white p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-black mb-6">Edit Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-black mb-2">Handle (@username)</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black font-bold">@</div>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase())}
                className={`neo bg-white w-full pl-8 pr-3 py-2 text-black font-medium ${
                  handleError ? 'border-red-500' : ''
                }`}
                placeholder="your_handle"
                maxLength={20}
              />
            </div>
            {isCheckingHandle && (
              <div className="text-sm text-gray-600 mt-1">Checking availability...</div>
            )}
            {handleError && (
              <div className="text-sm text-red-600 mt-1">{handleError}</div>
            )}
            {handle && !handleError && !isCheckingHandle && handle !== user.handle && (
              <div className="text-sm text-green-600 mt-1">✓ Handle is available</div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              3-20 characters, letters, numbers, and underscores only
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">About</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="neo bg-white w-full p-3 text-black font-medium resize-none"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">Social Links</label>
            {socials.map((social, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Platform"
                  value={social.platform}
                  onChange={(e) => updateSocial(index, 'platform', e.target.value)}
                  className="neo bg-white px-3 py-2 text-black font-medium flex-1"
                />
                <input
                  type="url"
                  placeholder="URL"
                  value={social.url}
                  onChange={(e) => updateSocial(index, 'url', e.target.value)}
                  className="neo bg-white px-3 py-2 text-black font-medium flex-2"
                />
                <button
                  onClick={() => removeSocial(index)}
                  className="neo bg-red-100 px-3 py-2 text-black font-bold hover:bg-red-200"
                >
                  ×
                </button>
              </div>
            ))}
            <GhostButton onClick={addSocialRow} className="text-sm">
              + Add Social Link
            </GhostButton>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <PrimaryButton onClick={handleSave} disabled={!canSave}>
            Save
          </PrimaryButton>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
        </div>
      </div>
    </div>
  );
}
