"use client";

import { useState, useCallback, useRef } from "react";

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface FileWithPreview {
  id: string;
  file: File | FileMetadata;
  preview: string | null;
}

interface UseFileUploadOptions {
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  initialFiles?: FileMetadata[];
  onFilesChange?: (files: FileWithPreview[]) => void;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    accept,
    maxFiles = 1,
    maxSize = 5 * 1024 * 1024,
    multiple = false,
    initialFiles = [],
    onFilesChange,
  } = options;

  const initial: FileWithPreview[] = initialFiles.map(function(f) {
    return { id: f.id, file: f, preview: f.url };
  });

  const [files, setFiles] = useState<FileWithPreview[]>(initial);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(incoming: File[]): { valid: File[]; errs: string[] } {
    const errs: string[] = [];
    const valid: File[] = [];

    for (let i = 0; i < incoming.length; i++) {
      const file = incoming[i];
      if (file.size > maxSize) {
        errs.push('"' + file.name + '" exceeds the max size of ' + formatBytes(maxSize) + '.');
        continue;
      }
      if (accept) {
        const accepted = accept.split(",").map(function(a) { return a.trim(); });
        const matchesMime = accepted.some(function(a) {
          if (a.endsWith("/*")) {
            return file.type.startsWith(a.replace("/*", "/"));
          }
          return file.type === a;
        });
        if (!matchesMime) {
          errs.push('"' + file.name + '" is not an accepted file type.');
          continue;
        }
      }
      valid.push(file);
    }

    return { valid, errs };
  }

  const addFiles = useCallback(
    function(incoming: File[]) {
      const result = validate(incoming);
      setErrors(result.errs);
      if (result.valid.length === 0) return;

      setFiles(function(prev) {
        const slots = maxFiles - prev.length;
        if (slots <= 0) {
          setErrors(["Max " + maxFiles + " file(s) allowed."]);
          return prev;
        }
        const toAdd: FileWithPreview[] = result.valid.slice(0, slots).map(function(file) {
          return {
            id: String(Date.now()) + "-" + String(Math.random()),
            file: file,
            preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
          };
        });
        const next = multiple ? prev.concat(toAdd) : toAdd;
        if (onFilesChange) onFilesChange(next);
        return next;
      });
    },
    [maxFiles, maxSize, accept, multiple, onFilesChange]
  );

  const removeFile = useCallback(
    function(id: string) {
      setFiles(function(prev) {
        const next = prev.filter(function(f) { return f.id !== id; });
        if (onFilesChange) onFilesChange(next);
        return next;
      });
    },
    [onFilesChange]
  );

  const clearFiles = useCallback(
    function() {
      setFiles([]);
      if (onFilesChange) onFilesChange([]);
    },
    [onFilesChange]
  );

  const handleDragEnter = useCallback(function(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(function(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(function(e: React.DragEvent) {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    function(e: React.DragEvent) {
      e.preventDefault();
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer.files);
      addFiles(dropped);
    },
    [addFiles]
  );

  const openFileDialog = useCallback(function() {
    if (inputRef.current) inputRef.current.click();
  }, []);

  const getInputProps = useCallback(
    function() {
      return {
        ref: inputRef,
        type: "file" as const,
        accept: accept,
        multiple: multiple,
        onChange: function(e: React.ChangeEvent<HTMLInputElement>) {
          const selected = Array.from(e.target.files ?? []);
          addFiles(selected);
          e.target.value = "";
        },
      };
    },
    [accept, multiple, addFiles]
  );

  return [
    { files, isDragging, errors },
    {
      addFiles,
      removeFile,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] as const;
}
