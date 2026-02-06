import { useState, useRef } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Type, Palette, Smile, Image as ImageIcon, Link as LinkIcon 
} from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    execCommand('insertText', emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const fonts = [
    'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 
    'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black'
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF',
    '#808080', '#C0C0C0', '#800000', '#808000', '#008000', '#800080', '#008080', '#000080'
  ];

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('bold')}
          title="Tučné"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          title="Kurzíva"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('underline')}
          title="Podtržené"
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyLeft')}
          title="Zarovnat vlevo"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyCenter')}
          title="Zarovnat na střed"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyRight')}
          title="Zarovnat vpravo"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <div className="relative group">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1"
          >
            <Type className="h-4 w-4" />
          </Button>
          <div className="absolute top-full left-0 hidden group-hover:block bg-white border shadow-lg rounded-md p-2 z-10 w-40 max-h-60 overflow-y-auto">
            {fonts.map((font) => (
              <button
                key={font}
                type="button"
                className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
                style={{ fontFamily: font }}
                onClick={() => execCommand('fontName', font)}
              >
                {font}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
          >
            <Palette className="h-4 w-4" />
          </Button>
          {showColorPicker && (
            <div className="absolute top-full left-0 bg-white border shadow-lg rounded-md p-2 z-10 grid grid-cols-5 gap-1 w-40">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-6 h-6 rounded border border-gray-200"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    execCommand('foreColor', color);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-4 w-4" />
          </Button>
          {showEmojiPicker && (
            <div className="absolute top-full right-0 z-20">
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowEmojiPicker(false)} 
              />
              <div className="relative z-20">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        ref={editorRef}
        className="p-4 min-h-[200px] focus:outline-none prose max-w-none"
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: content }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
