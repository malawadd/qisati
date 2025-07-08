import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Editor } from '@tiptap/react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface DialogueToolbarProps {
  editor: Editor | null;
  sessionId: Id<'walletSessions'>;
}

export default function DialogueToolbar({
  editor,
  sessionId,
}: DialogueToolbarProps) {
  /* ───────────────────── state ───────────────────── */
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 }); // initial position
  const menuRef = useRef<HTMLDivElement>(null);

  /* load characters once per session */
  const characterVoices = useQuery(api.queries.getCharacterVoicesByUser, {
    sessionId,
  });

  /* ───────────────────── outside-click handler ───────────────────── */
  useEffect(() => {
    if (!showMenu) return;

    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [showMenu]);

  /* ───────────────────── clamp inside viewport ───────────────────── */
  useLayoutEffect(() => {
    if (!showMenu || !menuRef.current) return;

    const PAD = 8; // distance from edge
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let { x, y } = menuPos;

    if (rect.right > vw - PAD) x = vw - rect.width - PAD;
    if (rect.left < PAD) x = PAD;
    if (rect.bottom > vh - PAD) y = vh - rect.height - PAD;
    if (rect.top < PAD) y = PAD;

    if (x !== menuPos.x || y !== menuPos.y) {
      setMenuPos({ x, y });
    }
  }, [showMenu, menuPos]);

  /* ───────────────────── button handlers ───────────────────── */
  const openMenuForSelection = () => {
    if (!editor) return;

    const { selection } = editor.state;
    if (selection.empty) {
      alert('Please select some text first');
      return;
    }
    const { from } = selection;
    const coords = editor.view.coordsAtPos(from);
    setMenuPos({ x: coords.left, y: coords.bottom + 10 });
    setShowMenu(true);
  };

  const applyCharacter = (id: string) => {
    if (!editor) return;
    editor.chain().focus().setCharacterDialogue(id).run();
    setShowMenu(false);
  };

  const removeCharacter = () => {
    if (!editor) return;
    editor.chain().focus().unsetCharacterDialogue().run();
    setShowMenu(false);
  };

  /* ───────────────────── render ───────────────────── */
  if (!characterVoices || characterVoices.length === 0) {
    return (
      <div className="text-xs text-gray-500 px-2">
        Create character voices in&nbsp;Settings to tag dialogue
      </div>
    );
  }

  return (
    <>
      {/* toolbar button */}
      <button
        onClick={openMenuForSelection}
        className="neo bg-white text-black px-3 py-1 text-sm font-bold hover:bg-gray-100 transition-colors"
        title="Mark as Character Dialogue"
      >
        🎭 Dialogue
      </button>

      {/* floating menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 neo bg-white p-2 max-w-xs"
          style={{ left: menuPos.x, top: menuPos.y }}
        >
          <div className="text-xs text-gray-600 mb-2 px-2">Select Character:</div>

          {characterVoices.map((c) => (
            <button
              key={c._id}
              onClick={() => applyCharacter(c._id)}
              className="w-full text-left p-2 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <span className="w-6 h-6 neo bg-primary text-white flex items-center justify-center text-xs font-bold">
                {c.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <div className="font-bold text-sm">{c.name}</div>
                <div className="text-xs opacity-70">{c.openaiVoiceId}</div>
              </div>
            </button>
          ))}

          <hr className="my-2 border-gray-200" />

          <button
            onClick={removeCharacter}
            className="w-full text-left p-2 hover:bg-red-50 transition-colors text-red-600 text-sm"
          >
            Remove Dialogue Mark
          </button>
        </div>
      )}
    </>
  );
}
