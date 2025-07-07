import NavBar from '../components/NavBar';
import { PrimaryButton } from '../components/atoms/PrimaryButton';
import { GhostButton } from '../components/atoms/GhostButton';
import { AudioPlayer } from '../components/AudioPlayer';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';


export function Chapter() {
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const path = window.location.pathname;
  const pathParts = path.split('/');
  const chapterId = pathParts[pathParts.length - 1];
  const seriesSlug = pathParts[2]; // /work/{slug}/chap/{id}
  
  const chapter = useQuery(api.queries.chapterById, 
    chapterId ? { id: chapterId as any } : "skip"
  );
  
  const navigation = useQuery(api.queries.getChapterNavigation,
    chapter ? { seriesId: chapter.series, currentIndex: chapter.index } : "skip"
  );
  
  const collectChapter = useMutation(api.mutations.collectChapter);

  // Get character voices for audio playback
  const characterVoices = useQuery(api.queries.getCharacterVoicesByUser, 
    { sessionId: "dummy" as any } // We'll need to handle this properly for guest users
  );

  if (!chapter) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen grid-bg flex items-center justify-center">
          <div className="neo bg-white p-8">
            <div className="text-black font-bold">Loading chapter...</div>
          </div>
        </div>
      </>
    );
  }

  const handleCollect = async () => {
    if (chapter) {
      try {
        await collectChapter({ chapterId: chapter._id });
      } catch (error) {
        console.error("Failed to collect chapter:", error);
      }
    }
  };

  const handlePrevious = () => {
    if (navigation?.previous) {
      window.location.href = `/work/${seriesSlug}/chap/${navigation.previous._id}`;
    }
  };

  const handleNext = () => {
    if (navigation?.next) {
      window.location.href = `/work/${seriesSlug}/chap/${navigation.next._id}`;
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen grid-bg">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="neo bg-white p-12">
                <div className="prose max-w-none">
                  {chapter.content.split('\n\n').map((paragraph, index) => (
                    <div key={index} className="group relative mb-4">
                      <p className="text-black leading-relaxed font-medium " >
                        {paragraph.startsWith('#') ? (
                          <span className="font-bold text-xl"></span>
                        ) : (
                          <div
  className="prose max-w-none"
  dangerouslySetInnerHTML={{ __html: chapter.content }}
/>
                        )}
                      </p>
                      <button className="absolute -left-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-lg">
                        💬
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="neo bg-white p-6 sticky top-8">
                <h3 className="font-bold text-lg text-black mb-4">{chapter.title}</h3>
                
                {/* Audio Player Section */}
                {chapter.audioSegments && chapter.audioSegments.length > 0 && (
                  <div className="mb-4 p-4 neo bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎧</span>
                      <span className="font-bold text-black">Audio Available</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Listen to this chapter with character voices
                    </p>
                    <GhostButton
                      onClick={() => setShowAudioPlayer(true)}
                      className="w-full"
                    >
                      🎵 Listen to Story
                    </GhostButton>
                  </div>
                )}
                
                <div className="mb-4">
                  <div className="text-2xl font-bold text-black mb-2">{chapter.price}</div>
                  <div className="text-sm text-black">
                    {chapter.supply.current}/{chapter.supply.total} collected
                  </div>
                </div>
                
                {chapter.owned ? (
                  <PrimaryButton className="w-full bg-neo-green">
                    Share
                  </PrimaryButton>
                ) : (
                  <PrimaryButton className="w-full" onClick={handleCollect}>
                    Collect
                  </PrimaryButton>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-12">
            <button 
              onClick={handlePrevious}
              className={`neo bg-white px-6 py-3 font-bold text-black hover:scale-105 transition-transform ${
                !navigation?.previous ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!navigation?.previous}
            >
              ← {navigation?.previous ? navigation.previous.title : 'Previous'}
            </button>
            <button 
              onClick={handleNext}
              className={`neo bg-white px-6 py-3 font-bold text-black hover:scale-105 transition-transform ${
                !navigation?.next ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!navigation?.next}
            >
              {navigation?.next ? navigation.next.title : 'Next'} →
            </button>
          </div>
        </div>

        {/* Audio Player Modal */}
        {showAudioPlayer && chapter.audioSegments && chapter.audioSegments.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="neo bg-white p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-black">{chapter.title}</h3>
                  <p className="text-gray-600">Audio Story Experience</p>
                </div>
                <GhostButton
                  onClick={() => setShowAudioPlayer(false)}
                  className="text-sm px-4 py-2"
                >
                  ✕ Close
                </GhostButton>
              </div>
              
              <AudioPlayer
                segments={chapter.audioSegments}
                characterVoices={characterVoices || []}
                onSegmentChange={(index) => {
                  console.log('Now playing segment:', index);
                }}
                className="mb-6"
              />
              
              {/* Story Text with Highlighting */}
              <div className="neo bg-gray-50 p-6">
                <h4 className="font-bold text-black mb-4">Story Text</h4>
                <div className="prose max-w-none text-black">
                  <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
