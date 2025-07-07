import NavBar from '../components/NavBar';
import { PrimaryButton } from '../components/atoms/PrimaryButton';
import { SimpleAudioPlayer } from '../components/SimpleAudioPlayer';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import ReactMarkdown from 'react-markdown';

export function Chapter() {
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

  // Extract unique character IDs from audio segments
  const characterIds = chapter?.audioSegments 
    ? [...new Set(chapter.audioSegments
        .map(segment => segment.characterId)
        .filter(Boolean))] as any[]
    : [];

  // Get character voices for audio playback (public query, no auth needed)
  const characterVoices = useQuery(
    api.queries.getCharacterVoicesByIds,
    characterIds.length > 0 ? { characterIds } : "skip"
  );

  // Helper function to clean HTML content and remove editor annotations
  const cleanContent = (htmlContent: string) => {
    // Remove character dialogue annotations and other editor-specific markup
    return htmlContent
      .replace(/<span[^>]*data-character-id[^>]*>(.*?)<\/span>/g, '$1')
      .replace(/class="character-dialogue[^"]*"/g, '')
      .replace(/data-character-id="[^"]*"/g, '');
  };

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

  const hasAudio = chapter.audioSegments && chapter.audioSegments.length > 0;

  return (
    <>
      <NavBar />
      <div className="min-h-screen grid-bg" style={{ paddingBottom: hasAudio ? '120px' : '0' }}>
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="neo bg-white p-12">
                <div className="prose max-w-none">
                  {/* Clean content rendering without annotations */}
                  <div
                    className="prose max-w-none text-black"
                    dangerouslySetInnerHTML={{ 
                      __html: cleanContent(chapter.content || chapter.bodyMd || '') 
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="neo bg-white p-6 sticky top-8">
                <h3 className="font-bold text-lg text-black mb-4">{chapter.title}</h3>
                
                {/* Simple audio indicator - no controls here */}
                {hasAudio && (
                  <div className="mb-4 p-3 neo bg-blue-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">🎧</span>
                      <span className="font-medium text-black text-sm">Audio Available</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Audio player will appear at the bottom of the page
                    </p>
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

        {/* Simple Audio Player - Fixed at bottom */}
        {hasAudio && (
          <SimpleAudioPlayer
            segments={chapter.audioSegments}
            characterVoices={characterVoices || []}
            chapterTitle={chapter.title}
          />
        )}
      </div>
    </>
  );
}