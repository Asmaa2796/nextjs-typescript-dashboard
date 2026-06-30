"use client";

import { useEffect, useState } from "react";
import { EditorState, convertToRaw, convertFromRaw, ContentState } from "draft-js";
import dynamic from "next/dynamic";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  { ssr: false }
);

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  error,
}: RichTextEditorProps) {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!value) return;

    try {
      const raw = JSON.parse(value);
      const contentState = convertFromRaw(raw);
      setEditorState(EditorState.createWithContent(contentState));
    } catch {
      const contentState = ContentState.createFromText(value);
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [mounted]);

  const handleChange = (state: EditorState) => {
    setEditorState(state);
    if (onChange) {
      const raw = convertToRaw(state.getCurrentContent());
      onChange(JSON.stringify(raw));
    }
  };

  if (!mounted) return null;

  return (
    <div
      className={`min-h-[200px] rounded-md border bg-white overflow-hidden text-sm ${
        error ? "border-destructive" : "border-input"
      }`}
    >
      <Editor
        editorState={editorState}
        onEditorStateChange={handleChange}
        placeholder={placeholder}
        toolbar={{
          options: ["inline", "list", "history"],
          inline: {
            options: ["bold", "italic", "underline", "strikethrough"],
          },
          list: {
            options: ["unordered", "ordered"],
          },
        }}
        editorClassName="px-3 min-h-[160px] cursor-text"
        toolbarClassName="!border-0 !border-b !border-input !mb-0 !rounded-none"
      />
    </div>
  );
}
