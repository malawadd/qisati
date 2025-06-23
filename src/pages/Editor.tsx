import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import NavBar from '../components/NavBar';
import EditorToolbar from '../components/EditorToolbar';
import MintSidebar from '../components/MintSidebar';

export default function Editor() {
  // Extract chapter ID from URL path like /work/slug/edit/chapterId
  const path = window.location.pathname;
  const id = path.split('/').pop() || '';
  const [isSaving, setIsSaving] = useState(false);
  
  const chapter = useQuery(api.queries.chapterById, { id: id as any });
  const draft = useQuery(api.queries.draftByChapter, { chapterId: id as any });
  const saveDraft = useMutation(api.mutations.saveDraftMd);
  const uploadImage = useAction(api.uploadImage.uploadImage);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'neo max-w-full h-auto',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your chapter...',
      }),
    ],
    content: draft?.bodyMd || chapter?.draftMd || chapter?.bodyMd || '',
    onUpdate: async ({ editor }) => {
      if (!id) return;
      
      setIsSaving(true);
      try {
        const content = editor.getHTML();
        await saveDraft({ chapter: id as any, md: content });
      } catch (error) {
        console.error('Failed to save draft:', error);
      } finally {
        setIsSaving(false);
      }
    },
  });

  // Auto-backup every minute
  useEffect(() => {
    const backupDraft = () => {
      // TODO: Implement encrypted backup to external storage
      console.log('Backup draft (stub)');
    };
    
    const interval = setInterval(backupDraft, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const url = await uploadImage({ base64 });
        editor?.chain().focus().setImage({ src: url }).run();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  if (!chapter) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen grid-bg flex items-center justify-center">
          <div className="neo bg-white p-8">
            <div className="text-black font-bold">Loading editor...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="grid-bg min-h-screen flex">
        <div className="flex-1 p-8">
          <div className="neo bg-white h-full flex flex-col">
            <div className="border-b-4 border-black p-4">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-bold text-black">{chapter.title}</h1>
                {isSaving && (
                  <div className="text-sm text-gray-600">Saving...</div>
                )}
              </div>
              <EditorToolbar editor={editor} onImageUpload={handleImageUpload} />
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <EditorContent 
                editor={editor} 
                className="prose max-w-none text-black focus:outline-none"
              />
            </div>
          </div>
        </div>
        <MintSidebar chapterId={id} editor={editor} />
      </div>
    </>
  );
}
