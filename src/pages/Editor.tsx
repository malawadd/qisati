import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import History from '@tiptap/extension-history';
import CharacterCount from '@tiptap/extension-character-count';
import Heading from '@tiptap/extension-heading';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import HardBreak from '@tiptap/extension-hard-break';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import { createLowlight } from 'lowlight';

const lowlight = createLowlight();
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import NavBar from '../components/NavBar';
import EditorToolbar from '../components/editor/EditorToolbar';
import SlashMenu from '../components/editor/SlashMenu';
import WordCountHUD from '../components/editor/WordCountHUD';
import NavigatorPane from '../components/editor/NavigatorPane';
import MintSidebar from '../components/MintSidebar';
import { useWalletAuth } from '@/providers/WalletAuthProvider';
import SeriesSettingsPane from '@/components/editor/SeriesSettingsPane';

export default function Editor() {
  const { user, isGuest, signOut, sessionId } = useWalletAuth();
  const path = window.location.pathname;
  const id = path.split('/').pop() || '';
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'chapter' | 'settings'>('chapter');
  
  const chapter = useQuery(api.queries.chapterById, { id: id as any });
  const draft = useQuery(api.queries.draftByChapter, { chapterId: id as any });
  const series = useQuery(api.queries.seriesById, chapter ? { id: chapter.series } : "skip");
  const chapters = useQuery(api.queries.chaptersForSeries, series ? { seriesId: series._id } : "skip");
  const saveDraft = useMutation(api.mutations.saveDraftMd);
  const uploadImage = useAction(api.uploadImage.uploadImage);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (content: string) => {
      if (!id) return;
      
      setIsSaving(true);
      try {
        await saveDraft({ chapter: id as any, md: content, sessionId });
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to save draft:', error);
      } finally {
        setIsSaving(false);
      }
    }, 2000),
    [id, saveDraft]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      History,
      CharacterCount,
      Heading.configure({
        levels: [1, 2, 3, 4],
      }),
      Blockquote,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'neo bg-gray-100 p-4',
        },
      }),
      Underline,
      Strike,
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200',
        },
      }),
      Color,
      TextStyle,
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'neo max-w-full h-auto my-4',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'neo border-collapse border-4 border-black my-4',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border-2 border-black bg-gray-100 p-2 font-bold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border-2 border-black p-2',
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'border-t-4 border-black my-6',
        },
      }),
      HardBreak,
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start writing your epic chapter...',
      }),
    ],
    content: '', // Initialize with empty content, will be set via useEffect
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      console.log('Editor content updated:', content);
      debouncedSave(content);
    },
  });

  // Load content into editor once data is available
  useEffect(() => {
    if (!editor) return;
    
    // Determine the content to load (priority: draft > chapter draftMd > chapter bodyMd)
    const contentToLoad = draft?.bodyMd || chapter?.draftMd || chapter?.bodyMd || '';
    
    // Only update if there's content and the editor is currently empty or different
    if (contentToLoad && editor.getHTML() !== contentToLoad) {
      // Set content without triggering the onUpdate callback to prevent unnecessary saves
      editor.commands.setContent(contentToLoad, false);
    }
  }, [editor, draft?.bodyMd, chapter?.draftMd, chapter?.bodyMd]);

  // Auto-backup every minute
  useEffect(() => {
    const backupDraft = () => {
      if (editor) {
        const content = editor.getHTML();
        console.log('Backup draft (stub)', content.length, 'chars');
      }
    };
    
    const interval = setInterval(backupDraft, 600000);
    return () => clearInterval(interval);
  }, [editor]);

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
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleChapterSelect = (chapterId: Id<"chapters">) => {
    if (series) {
      window.location.href = `/work/${series.slug}/edit/${chapterId}`;
    }
  };

  if (!chapter || !series || !chapters) {
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
        {/* Navigator Pane - Now 1/5 width */}
        <NavigatorPane
          seriesId={series._id}
          chapters={chapters}
          currentChapterId={chapter._id}
          onChapterSelect={handleChapterSelect}
          sessionId={sessionId}
        />
        
        {/* Main Content - Now 3/5 width */}
        <div className="flex-1 p-8">
          <div className="neo bg-white h-full flex flex-col">
            {/* Header with Tabs */}
            <div className="border-b-4 border-black p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="neo bg-gray-100 px-3 py-1 text-sm font-bold text-black hover:bg-gray-200 transition-colors"
                  >
                    ← Dashboard
                  </button>
                  
                  <div className="flex gap-2">
                    <TabButton
                      active={activeTab === 'chapter'}
                      onClick={() => setActiveTab('chapter')}
                      label="Chapter"
                    />
                    <TabButton
                      active={activeTab === 'settings'}
                      onClick={() => setActiveTab('settings')}
                      label="Settings"
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {isSaving ? (
                    <span className="text-primary">Saving...</span>
                  ) : lastSaved ? (
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  ) : (
                    <span>Auto-save enabled</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'chapter' ? (
              <>
                <EditorToolbar editor={editor} onImageUpload={handleImageUpload} />
                <div className="flex-1 p-6 overflow-y-auto relative">
                  <EditorContent 
                    editor={editor} 
                    className="prose prose-lg max-w-none text-black focus:outline-none min-h-full"
                  />
                  <SlashMenu editor={editor} onImageUpload={handleImageUpload} />
                </div>
              </>
            ) : (
              <SeriesSettingsPane 
                series={series}
                chapters={chapters}
                sessionId={sessionId}
              />
            )}
          </div>
        </div>
        
        {/* Mint Sidebar - Now 1/5 width */}
        <MintSidebar chapterId={id} editor={editor} sessionId={sessionId} />
        <WordCountHUD editor={editor} />
      </div>
    </>
  );
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`neo bg-gray-100 px-3 py-1 text-sm font-bold text-black  transition-colors ${
        active ? 'bg-primary text-white' : 'bg-gray-100 text-black hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}
