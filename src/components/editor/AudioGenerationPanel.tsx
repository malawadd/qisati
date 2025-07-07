import { useState } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Editor } from '@tiptap/react';
import { PrimaryButton } from '../atoms/PrimaryButton';
import { GhostButton } from '../atoms/GhostButton';
import { AudioPlayer } from '../AudioPlayer';

interface AudioGenerationPanelProps {
  editor: Editor | null;
  chapterId: Id<"chapters">;
  sessionId: Id<"walletSessions">;
}

export default function AudioGenerationPanel({ editor, chapterId, sessionId }: AudioGenerationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  const chapter = useQuery(api.queries.chapterById, { id: chapterId });
  const characterVoices = useQuery(api.queries.getCharacterVoicesByUser, { sessionId });
  const generateAudio = useAction(api.generateAudio.generateChapterAudio);

  const extractDialogueSegments = () => {
    if (!editor) return [];

    const doc = editor.getJSON();
    const segments: any[] = [];
    let currentIndex = 0;

    const processNode = (node: any) => {
      if (node.type === 'text') {
        const text = node.text || '';
        if (node.marks) {
          const dialogueMark = node.marks.find((mark: any) => mark.type === 'characterDialogue');
          if (dialogueMark && dialogueMark.attrs.characterId) {
            segments.push({
              text: text,
              characterId: dialogueMark.attrs.characterId,
              startIndex: currentIndex,
              endIndex: currentIndex + text.length
            });
          }
        }
        currentIndex += text.length;
      } else if (node.content) {
        node.content.forEach(processNode);
      }
    };

    if (doc.content) {
      doc.content.forEach(processNode);
    }

    return segments;
  };

  const handleGenerateAudio = async () => {
    if (!editor || !characterVoices) return;

    const dialogueSegments = extractDialogueSegments();
    
    if (dialogueSegments.length === 0) {
      alert('No dialogue segments found. Please mark some text as character dialogue first.');
      return;
    }

    const remainingGenerations = 10 - (chapter?.audioGenerationCount || 0);
    if (remainingGenerations <= 0) {
      alert('Audio generation limit reached for this chapter (10 generations max).');
      return;
    }

    if (dialogueSegments.length > remainingGenerations) {
      const proceed = confirm(
        `You have ${dialogueSegments.length} dialogue segments but only ${remainingGenerations} generations remaining. Only the first ${remainingGenerations} segments will be processed. Continue?`
      );
      if (!proceed) return;
    }

    setIsGenerating(true);
    setGenerationResult(null);

    try {
      const result = await generateAudio({
        sessionId,
        chapterId,
        dialogueSegments: dialogueSegments.slice(0, remainingGenerations)
      });

      setGenerationResult(result);
    } catch (error) {
      console.error('Audio generation failed:', error);
      alert(`Audio generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const dialogueSegments = extractDialogueSegments();
  const remainingGenerations = 10 - (chapter?.audioGenerationCount || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-black">Audio Generation</h3>
        <div className="text-sm text-gray-600">
          {remainingGenerations}/10 generations remaining
        </div>
      </div>

      {/* Current Status */}
      <div className="neo bg-gray-50 p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-bold text-black">Dialogue Segments</div>
            <div className="text-gray-600">{dialogueSegments.length} found</div>
          </div>
          <div>
            <div className="font-bold text-black">Audio Segments</div>
            <div className="text-gray-600">{chapter?.audioSegments?.length || 0} generated</div>
          </div>
        </div>
      </div>

      {/* Dialogue Preview */}
      {dialogueSegments.length > 0 && (
        <div className="neo bg-white p-4">
          <h4 className="font-bold text-black mb-3">Dialogue Segments to Generate:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {dialogueSegments.slice(0, remainingGenerations).map((segment, index) => {
              const character = characterVoices?.find(cv => cv._id === segment.characterId);
              return (
                <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                  <div className="w-6 h-6 neo bg-primary text-white flex items-center justify-center text-xs font-bold">
                    {character?.name.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-xs text-black">
                      {character?.name || 'Unknown Character'}
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-2">
                      "{segment.text}"
                      {character?.instructions && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {character.instructions.split('\n')[0]}...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {dialogueSegments.length > remainingGenerations && (
            <div className="text-xs text-red-600 mt-2">
              {dialogueSegments.length - remainingGenerations} segments will be skipped due to generation limit
            </div>
          )}
        </div>
      )}

      {/* Generation Result */}
      {generationResult && (
        <div className="neo bg-green-50 p-4">
          <h4 className="font-bold text-green-800 mb-2">Generation Complete!</h4>
          <div className="text-sm text-green-700">
            <div>Generated: {generationResult.generatedCount} audio segments</div>
            <div>Remaining generations: {generationResult.remainingGenerations}</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <PrimaryButton
           onClick={handleGenerateAudio}
           disabled={isGenerating || dialogueSegments.length === 0 || remainingGenerations <= 0}
           className="flex-1"
        >
          {isGenerating ? 'Generating Audio...' : 'Generate Audio'}
        </PrimaryButton>
        
        {chapter?.audioSegments && chapter.audioSegments.length > 0 ? (
          <GhostButton
            onClick={() => setShowAudioPlayer(true)}
          >
            Preview Audio
          </GhostButton>
        ) : (
          <GhostButton
            disabled
            className="opacity-50 cursor-not-allowed"
          >
            Preview Audio
          </GhostButton>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p>• Mark dialogue text using the "🎭 Dialogue" button in the toolbar</p>
        <p>• Create character voices in the Settings tab</p>
        <p>• Each chapter has a limit of 10 audio generations</p>
      </div>

      {/* Audio Player Modal */}
      {showAudioPlayer && chapter?.audioSegments && chapter.audioSegments.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="neo bg-white p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">Audio Preview</h3>
              <GhostButton
                onClick={() => setShowAudioPlayer(false)}
                className="text-sm px-3 py-1"
              >
                ✕ Close
              </GhostButton>
            </div>
            
            <AudioPlayer
              segments={chapter.audioSegments}
              characterVoices={characterVoices || []}
              onSegmentChange={(index) => {
                console.log('Playing segment:', index);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}