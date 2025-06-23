import { useState } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { PrimaryButton } from './atoms/PrimaryButton';
import { GhostButton } from './atoms/GhostButton';

interface EditProfileModalProps {
  user: any;
  onClose: () => void;
}

interface Social {
  platform: string;
  url: string;
  displayText?: string;
}

export function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const [about, setAbout] = useState(user.about || '');
  const [socials, setSocials] = useState<Social[]>(
    user.socials || [{ platform: '', url: '', displayText: '' }]
  );
  const [isUploading, setIsUploading] = useState(false);

  const updateProfile = useMutation(api.profiles.updateProfile);
  const uploadImage = useAction(api.profiles.uploadImage);

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
      const validSocials = socials.filter(s => s.platform && s.url);
      await updateProfile({ about, socials: validSocials });
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="neo bg-white p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-black mb-6">Edit Profile</h2>
        
        <div className="space-y-4">
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
          <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
        </div>
      </div>
    </div>
  );
}
