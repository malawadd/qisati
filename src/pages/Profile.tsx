/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import NavBar from '../components/NavBar';
import { PrimaryButton } from '../components/atoms/PrimaryButton';
import { GhostButton } from '../components/atoms/GhostButton';
import { StoryCard } from '../components/StoryCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { useWalletAuth } from '../providers/WalletAuthProvider';

export function Profile() {
  const { user, isGuest, signOut, sessionId } = useWalletAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const path = window.location.pathname;
  const handle = path.slice(2); // Remove "/@" prefix
  
  // All hooks must be called before any conditional returns
  const profile = useQuery(api.profiles.profileByHandle, { handle });
  const currentUser = useQuery(api.auth.loggedInUser);
  const currentAppUser = useQuery(api.users.getCurrentAppUser, sessionId ? { sessionId } : "skip");
  const isFollowing = useQuery(api.profiles.isFollowing, sessionId && handle ? { sessionId, targetHandle: handle } : "skip");

  const followUser = useMutation(api.profiles.followUser);
  const uploadImage = useAction(api.profiles.uploadImage);
  const updateProfile = useMutation(api.profiles.updateProfile);
  const createAppUser = useMutation(api.users.createAppUserIfNeeded);
 

  const isOwnProfile = currentAppUser?.handle === profile?.handle;

  // Auto-create app user if viewing own profile but no app user exists
  useEffect(() => {
    if (sessionId && !currentAppUser && isOwnProfile) {
      createAppUser({ sessionId }).catch(console.error);
    }
  }, [sessionId, currentAppUser, isOwnProfile, createAppUser]);

  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const imageUrl = await uploadImage({ base64 });
        if (!sessionId) {
          // Handle error, show message, or return early
          console.error('No session, cannot withdraw.');
          return;
        }
        if (type === 'avatar') {
          await updateProfile({ sessionId, avatarUrl: imageUrl });
        } else {
          await updateProfile({ sessionId, bannerUrl: imageUrl });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const handleFollow = async () => {
    if (!sessionId) {
      // Handle error, show message, or return early
      console.error('No session, cannot withdraw.');
      return;
    }
    try {
      await followUser({ sessionId, targetHandle: handle });
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    }
  };

  // Conditional return after all hooks
  if (!profile) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen grid-bg flex items-center justify-center">
          <div className="neo bg-white p-8">
            <div className="text-black font-bold">
              {profile === null ? 'Profile not found' : 'Loading...'}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen grid-bg">
        {/* Banner */}
        <div className="relative">
          <div 
            className="neo h-48 bg-cover bg-center cursor-pointer"
            style={{ 
              backgroundImage: `url(${profile.bannerUrl || 'https://picsum.photos/1200/300'})` 
            }}
            onClick={() => {
              if (isOwnProfile) {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleImageUpload(file, 'banner');
                };
                input.click();
              }
            }}
          />
          
          {/* Avatar */}
          <div className="absolute -bottom-16 left-8">
            <div 
              className="neo w-32 h-32 rounded-full bg-cover bg-center cursor-pointer"
              style={{ backgroundImage: `url(${profile.avatarUrl})` }}
              onClick={() => {
                if (isOwnProfile) {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleImageUpload(file, 'avatar');
                  };
                  input.click();
                }
              }}
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 px-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-black">@{profile.handle}</h1>
              <div className="text-black mt-2">
                {profile.followerCount} followers • {profile.followingCount} following
              </div>
            </div>
            
            <div className="flex gap-3">
              {isOwnProfile ? (
                <PrimaryButton onClick={() => setShowEditModal(true)}>
                  Edit Profile
                </PrimaryButton>
              ) : (
                <GhostButton onClick={handleFollow}>
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </GhostButton>
              )}
            </div>
          </div>

          {/* About */}
          {profile.about && (
            <div className="neo bg-white p-6 mb-6">
              <div className="prose max-w-none text-black">
                {profile.about.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Socials */}
          {profile.socials && profile.socials.length > 0 && (
            <div className="neo bg-white p-6 mb-6">
              <h3 className="font-bold text-black mb-4">Links</h3>
              <div className="flex flex-wrap gap-3">
                {profile.socials.map((social: any, index: number) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neo bg-blue-100 px-4 py-2 text-black font-bold hover:bg-blue-200 transition-colors"
                  >
                    {social.displayText || social.platform}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Works */}
          <div>
            <h2 className="text-2xl font-bold text-black mb-6">Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {profile.series.map((series: any) => (
                <StoryCard
                  key={series._id}
                  id={series._id}
                  title={series.title}
                  author={{ name: profile.handle, avatar: profile.avatarUrl }}
                  cover={series.coverUrl}
                  price="0.002 ETH"
                  supply={{ current: 100, total: 500 }}
                  onClick={() => window.location.href = `/work/${series.slug}`}
                />
              ))}
            </div>
            
            {profile.series.length === 0 && (
              <div className="neo bg-white p-8 text-center">
                <div className="text-black font-bold">No works published yet</div>
              </div>
            )}
          </div>
        </div>

        {showEditModal && (
          <EditProfileModal
            user={profile}
            onClose={() => setShowEditModal(false)}
            sessionId={sessionId}
          />
        )}
      </div>
    </>
  );
}
