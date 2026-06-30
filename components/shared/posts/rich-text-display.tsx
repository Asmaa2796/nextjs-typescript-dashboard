"use client";

import draftToHtml from "draftjs-to-html";

interface RichTextDisplayProps {
  content: string;
}

export function RichTextDisplay({ content }: RichTextDisplayProps) {
  if (!content) return null;

  let html = "";

  try {
    const raw = JSON.parse(content);
    if (raw?.blocks) {
      html = draftToHtml(raw);
    } else {
      throw new Error("not draft content");
    }
  } catch {
    html = content
      .split("\n")
      .filter(Boolean)
      .map((line) => `<p>${line}</p>`)
      .join("");

    if (!html) html = `<p>${content}</p>`;
  }

  return (
    <div
      className="text-sm leading-relaxed text-gray-700 prose max-w-none
        [&_strong]:font-bold
        [&_em]:italic
        [&_u]:underline
        [&_s]:line-through
        [&_ul]:list-disc [&_ul]:ml-5
        [&_ol]:list-decimal [&_ol]:ml-5
        [&_li]:my-1
        [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2
        [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2
        [&_p]:mb-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
