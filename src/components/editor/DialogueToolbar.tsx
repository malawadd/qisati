import { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface DialogueToolbarProps {
  editor: Editor | null;
  sessionId: Id<"walletSessions">;
}

export default function DialogueToolbar({ editor, sessionId }: DialogueToolbarProps) {
  const [showCharacterMenu, setShowCharacterMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const characterVoices = useQuery(api.queries.getCharacterVoicesByUser, { sessionId });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCharacterMenu(false);
      }
    };

    if (showCharacterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCharacterMenu]);

  const handleDialogueButtonClick = () => {
    if (!editor) return;

    const { selection } = editor.state;
    if (selection.empty) {
      alert('Please select some text first');
      return;
    }

    // Get the position of the selection to show the character menu
    const { from } = selection;
    const coords = editor.view.coordsAtPos(from);
    setMenuPosition({ x: coords.left, y: coords.bottom + 10 });
    setShowCharacterMenu(true);
  };

  const handleCharacterSelect = (characterId: string, characterName: string) => {
    if (!editor) return;

    // Apply the character dialogue mark to the selected text
    editor.chain().focus().setCharacterDialogue(characterId).run();
    setShowCharacterMenu(false);
  };

  const handleRemoveDialogue = () => {
    if (!editor) return;
    editor.chain().focus().unsetCharacterDialogue().run();
    setShowCharacterMenu(false);
  };

  if (!characterVoices || characterVoices.length === 0) {
    return (
      <div className="text-xs text-gray-500 px-2">
        Create character voices in Settings to tag dialogue
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleDialogueButtonClick}
        className="neo bg-white text-black px-3 py-1 text-sm font-bold hover:bg-gray-100 transition-colors"
        title="Mark as Character Dialogue"
      >
        🎭 Dialogue
      </button>

      {showCharacterMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 neo bg-white p-2 max-w-xs"
          style={{ left: menuPosition.x, top: menuPosition.y }}
        >
          <div className="text-xs text-gray-600 mb-2 px-2">Select Character:</div>
          {characterVoices.map((character) => (
            <button
              key={character._id}
              onClick={() => handleCharacterSelect(character._id, character.name)}
              className="w-full text-left p-2 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <span className="w-6 h-6 neo bg-primary text-white flex items-center justify-center text-xs font-bold">
                {character.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <div className="font-bold text-sm">{character.name}</div>
                <div className="text-xs opacity-70">{character.openaiVoiceId}</div>
              </div>
            </button>
          ))}
          <hr className="my-2 border-gray-200" />
          <button
            onClick={handleRemoveDialogue}
            className="w-full text-left p-2 hover:bg-red-50 transition-colors text-red-600 text-sm"
          >
            Remove Dialogue Mark
          </button>
        </div>
      )}
    </>
  );
}