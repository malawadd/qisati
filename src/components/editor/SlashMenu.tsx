import { Editor } from '@tiptap/react';
import { useState, useEffect, useRef } from 'react';

interface SlashMenuProps {
  editor: Editor | null;
  onImageUpload: (file: File) => void;
}

interface MenuItem {
  title: string;
  description: string;
  icon: string;
  command: () => void;
}

export default function SlashMenu({ editor, onImageUpload }: SlashMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/gif';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && file.size <= 5 * 1024 * 1024) {
        onImageUpload(file);
      }
    };
    input.click();
    setIsOpen(false);
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Heading 1',
      description: 'Big section heading',
      icon: 'H1',
      command: () => {
        editor?.chain().focus().toggleHeading({ level: 1 }).run();
        setIsOpen(false);
      }
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: 'H2',
      command: () => {
        editor?.chain().focus().toggleHeading({ level: 2 }).run();
        setIsOpen(false);
      }
    },
    {
      title: 'Heading 3',
      description: 'Small section heading',
      icon: 'H3',
      command: () => {
        editor?.chain().focus().toggleHeading({ level: 3 }).run();
        setIsOpen(false);
      }
    },
    {
      title: 'Quote',
      description: 'Capture a quote',
      icon: '"',
      command: () => {
        editor?.chain().focus().toggleBlockquote().run();
        setIsOpen(false);
      }
    },
    {
      title: 'Code Block',
      description: 'Capture a code snippet',
      icon: '<>',
      command: () => {
        editor?.chain().focus().toggleCodeBlock().run();
        setIsOpen(false);
      }
    },
    {
      title: 'Horizontal Rule',
      description: 'Add a divider line',
      icon: '─',
      command: () => {
        editor?.chain().focus().setHorizontalRule().run();
        setIsOpen(false);
      }
    },
    {
      title: 'Image',
      description: 'Upload an image',
      icon: '🖼',
      command: handleImageUpload
    },
    {
      title: 'Table',
      description: 'Insert a 3x3 table',
      icon: '⊞',
      command: () => {
        editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        setIsOpen(false);
      }
    },
    {
      title: 'To-do List',
      description: 'Track tasks with checkboxes',
      icon: '☑',
      command: () => {
        editor?.chain().focus().toggleTaskList().run();
        setIsOpen(false);
      }
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list',
      icon: '•',
      command: () => {
        editor?.chain().focus().toggleBulletList().run();
        setIsOpen(false);
      }
    }
  ];

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { selection } = editor.state;
      const { $from } = selection;
      const text = $from.nodeBefore?.textContent || '';
      
      if (text.endsWith('/')) {
        const coords = editor.view.coordsAtPos($from.pos);
        setPosition({ x: coords.left, y: coords.bottom + 10 });
        setIsOpen(true);
        setSelectedIndex(0);
      } else {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % menuItems.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        menuItems[selectedIndex].command();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
      }
    };

    editor.on('update', handleUpdate);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      editor.off('update', handleUpdate);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, isOpen, selectedIndex, menuItems]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 neo bg-white p-2 max-w-xs"
      style={{ left: position.x, top: position.y }}
    >
      <div className="text-xs text-gray-600 mb-2 px-2">Type to filter commands</div>
      {menuItems.map((item, index) => (
        <button
          key={item.title}
          onClick={item.command}
          className={`w-full text-left p-2 hover:bg-gray-100 transition-colors flex items-center gap-3 ${
            index === selectedIndex ? 'bg-primary text-white' : ''
          }`}
        >
          <span className="w-8 h-8 neo bg-white flex items-center justify-center text-sm font-bold">
            {item.icon}
          </span>
          <div>
            <div className="font-bold text-sm">{item.title}</div>
            <div className="text-xs opacity-70">{item.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
