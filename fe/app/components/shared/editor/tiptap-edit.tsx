"use client";
import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Underline } from "@tiptap/extension-underline";
import { OrderedList } from "@tiptap/extension-ordered-list";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import {
  Bold,
  Code,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo,
  Underline as UnderlineIcon,
  Undo,
  Image as ImageIcon,
} from "lucide-react";
import "./tiptap.css";

interface TiptapEditProps {
  value?: string;
  onChange?: (html: string) => void;
}

const TiptapEdit = ({ value = "", onChange }: TiptapEditProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Underline,
      OrderedList,
      BulletList,
      ListItem,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleBold = () => editor?.chain().focus().toggleBold().run();
  const handleItalic = () => editor?.chain().focus().toggleItalic().run();
  const handleUnderline = () =>
    editor?.chain()?.focus()?.toggleUnderline()?.run();
  const handleH1 = () =>
    editor?.chain().focus().toggleHeading({ level: 1 }).run();
  const handleH2 = () =>
    editor?.chain().focus().toggleHeading({ level: 2 }).run();
  const handleH3 = () =>
    editor?.chain().focus().toggleHeading({ level: 3 }).run();
  const handleList = () => editor?.chain().focus().toggleBulletList().run();
  const handleOrderedList = () =>
    editor?.chain().focus().toggleOrderedList().run();
  const handleLink = () => {
    const url = prompt("Nhập liên kết (URL):");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };
  const handleImage = () => {
    const url = prompt("Nhập liên kết hình ảnh (URL):");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };
  const handleCodeBlock = () => editor?.chain().focus().toggleCodeBlock().run();
  const handleUndo = () => editor?.chain().focus().undo().run();
  const handleRedo = () => editor?.chain().focus().redo().run();

  return (
    <div className="editor-container">
      <div className="toolbar flex gap-5 flex-wrap">
        <button type="button" onClick={handleBold}>
          <Bold
            className="text-lg font-semibold hover:text-primary dark:hover:text-primary"
            size={16}
          />
        </button>
        <button type="button" onClick={handleItalic}>
          <Italic
            className="text-lg font-semibold hover:text-primary dark:hover:text-primary"
            size={16}
          />
        </button>
        <button type="button" onClick={handleUnderline}>
          <UnderlineIcon
            className="text-lg font-semibold hover:text-primary dark:hover:text-primary"
            size={16}
          />
        </button>
        <button type="button" onClick={handleH1}>
          <span className="text-sm font-medium hover:text-primary dark:hover:text-primary">
            H1
          </span>
        </button>
        <button type="button" onClick={handleH2}>
          <span className="text-sm font-medium hover:text-primary dark:hover:text-primary">
            H2
          </span>
        </button>
        <button type="button" onClick={handleH3}>
          <span className="text-sm font-medium hover:text-primary dark:hover:text-primary">
            H3
          </span>
        </button>
        <button type="button" onClick={handleList}>
          <List
            className="text-lg font-semibold hover:text-primary dark:hover:text-primary"
            size={16}
          />
        </button>
        <button type="button" onClick={handleOrderedList}>
          <ListOrdered
            className="text-lg font-semibold hover:text-primary dark:hover:text-primary"
            size={16}
          />
        </button>
        <button type="button" onClick={handleLink}>
          <Link2
            className="text-lg font-semibold hover:text-primary dark:hover:text-primary"
            size={16}
          />
        </button>
        <button type="button" onClick={handleImage}>
          <ImageIcon
            className="text-lg font-semibold hover:text-primary dark:hover:text-primary"
            size={16}
          />
        </button>
        <button type="button" onClick={handleCodeBlock}>
          <Code
            className="text-lg font-semibold hover:text-primary dark:hover:text-primary"
            size={16}
          />
        </button>
        <button type="button" onClick={handleUndo}>
          <Undo
            className="text-lg font-semibold hover:text-primary dark:hover:text-primary"
            size={16}
          />
        </button>
        <button type="button" onClick={handleRedo}>
          <Redo
            className="text-lg font-semibold hover:text-primary dark:hover:text-primary"
            size={16}
          />
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEdit;
