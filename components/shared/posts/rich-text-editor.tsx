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
      className={`min-h-[200px] overflow-hidden rounded-md border bg-background text-sm text-foreground ${
        error ? "border-destructive" : "border-input"
      } dark:border-input dark:bg-input/30 dark:text-foreground`}
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
        wrapperClassName="min-h-[200px] bg-background text-foreground dark:bg-input/30 dark:text-foreground"
        editorClassName="px-3 min-h-[160px] cursor-text bg-background text-foreground dark:bg-input/30 dark:text-foreground [&_.public-DraftEditor-content]:min-h-[160px] [&_.public-DraftEditor-content]:bg-background [&_.public-DraftEditor-content]:text-foreground dark:[&_.public-DraftEditor-content]:bg-input/30 dark:[&_.public-DraftEditor-content]:text-foreground [&_.public-DraftEditorPlaceholder]:text-muted-foreground"
        toolbarClassName="!border-0 !border-b !border-input !mb-0 !rounded-none !bg-background !text-foreground dark:!bg-input/30 dark:!text-foreground"
      />
    </div>
  );
}
