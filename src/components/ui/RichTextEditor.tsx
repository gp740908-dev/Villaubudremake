import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    Code,
    Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

const RichTextEditor = ({ content, onChange, placeholder = 'Start writing...', className }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-[#778873] underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg my-4',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[300px] px-4 py-3',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const ToolbarButton = ({
        onClick,
        isActive = false,
        disabled = false,
        children
    }: {
        onClick: () => void;
        isActive?: boolean;
        disabled?: boolean;
        children: React.ReactNode;
    }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'p-2 rounded hover:bg-[#F1F3E0] transition-colors',
                isActive && 'bg-[#F1F3E0] text-[#778873]',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
        >
            {children}
        </button>
    );

    return (
        <div className={cn('border rounded-lg bg-white overflow-hidden', className)}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-[#FAFAF5]">
                {/* Text Formatting */}
                <div className="flex items-center gap-1 pr-2 border-r">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                    >
                        <Bold size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                    >
                        <Italic size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                    >
                        <Strikethrough size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        isActive={editor.isActive('code')}
                    >
                        <Code size={16} />
                    </ToolbarButton>
                </div>

                {/* Headings */}
                <div className="flex items-center gap-1 px-2 border-r">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                    >
                        <Heading1 size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                    >
                        <Heading2 size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                    >
                        <Heading3 size={16} />
                    </ToolbarButton>
                </div>

                {/* Lists */}
                <div className="flex items-center gap-1 px-2 border-r">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                    >
                        <List size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                    >
                        <ListOrdered size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                    >
                        <Quote size={16} />
                    </ToolbarButton>
                </div>

                {/* Media */}
                <div className="flex items-center gap-1 px-2 border-r">
                    <ToolbarButton onClick={addLink} isActive={editor.isActive('link')}>
                        <LinkIcon size={16} />
                    </ToolbarButton>
                    <ToolbarButton onClick={addImage}>
                        <ImageIcon size={16} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                        <Minus size={16} />
                    </ToolbarButton>
                </div>

                {/* History */}
                <div className="flex items-center gap-1 pl-2">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                    >
                        <Undo size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                    >
                        <Redo size={16} />
                    </ToolbarButton>
                </div>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />

            {/* Character Count */}
            <div className="px-4 py-2 border-t text-xs text-[#6b7c67] bg-[#FAFAF5]">
                {editor.storage.characterCount?.characters?.() || editor.getText().length} characters
            </div>
        </div>
    );
};

export default RichTextEditor;
