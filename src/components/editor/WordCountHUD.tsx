import { Editor } from '@tiptap/react';

interface WordCountHUDProps {
  editor: Editor | null;
}

export default function WordCountHUD({ editor }: WordCountHUDProps) {
  if (!editor) return null;

  const words = editor.storage.characterCount?.words() || 0;
  const characters = editor.storage.characterCount?.characters() || 0;

  return (
    <div className="fixed bottom-4 right-4 neo bg-white p-2 text-sm font-bold text-black z-40">
      <div className="flex gap-4">
        <span>{words.toLocaleString()} words</span>
        <span>{characters.toLocaleString()} chars</span>
      </div>
    </div>
  );
}
