"use client";

import { useState } from "react";
import {
  formatBytes,
  useFileUpload,
  type FileMetadata,
  type FileWithPreview,
} from "@/hooks/use-file-upload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CircleAlertIcon, ImageIcon, UploadIcon, XIcon, ZoomInIcon } from "lucide-react";

interface GalleryUploadProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  className?: string;
  onFilesChange?: (files: FileWithPreview[]) => void;
}

export function Pattern({
  maxFiles = 10,
  maxSize = 20 * 1024 * 1024,
  accept = "image/*",
  multiple = true,
  className,
  onFilesChange,
}: GalleryUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  const [
    { files, isDragging, errors },
    {
      removeFile,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({ maxFiles, maxSize, accept, multiple, initialFiles: [], onFilesChange });

  return (
    <div className={cn("w-full", className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          "relative cursor-pointer rounded-lg border border-dashed border-muted-foreground/25 bg-background p-8 text-center transition-colors dark:border-input/60 dark:bg-input/30",
          isDragging
            ? "border-primary bg-primary/5 dark:bg-primary/10"
            : "hover:border-muted-foreground/50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input {...getInputProps()} className="sr-only" />
        <div className="flex flex-col items-center gap-3">
          <div className={cn("flex h-14 w-14 items-center justify-center rounded-full", isDragging ? "bg-primary/10" : "bg-muted")}>
            <ImageIcon className={cn("h-6 w-6", isDragging ? "text-primary" : "text-muted-foreground")} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Drag & drop or click to upload</p>
            <p className="text-muted-foreground text-xs">
              JPG, PNG, WEBP up to {formatBytes(maxSize)} each (max {maxFiles} files)
            </p>
          </div>
          <Button
            type="button"
            className="cursor-pointer border border-border bg-background text-foreground hover:bg-accent dark:border-input/60 dark:bg-input/30 dark:text-foreground dark:hover:bg-input/50"
            size="sm"
            onClick={(e) => { e.stopPropagation(); openFileDialog(); }}
          >
            <UploadIcon className="h-4 w-4 mr-1" />
            Select images
          </Button>
        </div>
      </div>

      {/* Stats */}
      {files.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Gallery ({files.length}/{maxFiles})</span>
            <Badge variant="outline" className="text-xs">
              {formatBytes(files.reduce((acc, f) => acc + f.file.size, 0))} total
            </Badge>
          </div>
          <Button
            type="button"
            className="cursor-pointer border-red-400/40 bg-background text-red-600 hover:bg-red-50 dark:bg-input/30 dark:text-red-300 dark:hover:bg-input/50"
            onClick={clearFiles}
            variant="outline"
            size="sm"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Grid */}
      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {files.map((fileItem) => (
            <div key={fileItem.id} className="group/item relative aspect-square">
              {fileItem.preview ? (
                <>
                  {loadingImages[fileItem.id] !== false && (
                    <div className="bg-muted/50 rounded-lg absolute inset-0 flex items-center justify-center border">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    </div>
                  )}
                  <img
                    src={fileItem.preview}
                    alt={fileItem.file.name}
                    onLoad={() => setLoadingImages((prev) => ({ ...prev, [fileItem.id]: false }))}
                    className={cn(
                      "rounded-lg h-full w-full border object-cover transition-all group-hover/item:brightness-75",
                      loadingImages[fileItem.id] !== false ? "opacity-0" : "opacity-100"
                    )}
                  />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg border border-border bg-background dark:bg-input/30">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover/item:opacity-100">
                {fileItem.preview && (
                  <Button
                    type="button"
                    onClick={() => setSelectedImage(fileItem.preview!)}
                    variant="secondary"
                    size="icon"
                    className="size-7 cursor-pointer border border-border bg-background/90 text-foreground shadow-sm hover:bg-accent dark:border-input/60 dark:bg-input/30 dark:text-foreground dark:hover:bg-input/50"
                  >
                    <ZoomInIcon className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => removeFile(fileItem.id)}
                  variant="secondary"
                  size="icon"
                  className="size-7 cursor-pointer"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* File info */}
              <div className="rounded-b-lg absolute right-0 bottom-0 left-0 bg-black/70 p-2 text-white opacity-0 transition-opacity group-hover/item:opacity-100">
                <p className="truncate text-xs font-medium">{fileItem.file.name}</p>
                <p className="text-xs text-gray-300">{formatBytes(fileItem.file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mt-4">
          <CircleAlertIcon className="h-4 w-4" />
          <AlertTitle>Upload error</AlertTitle>
          <AlertDescription>
            {errors.map((e, i) => <p key={i}>{e}</p>)}
          </AlertDescription>
        </Alert>
      )}

      {/* Preview dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-2xl border-none bg-transparent shadow-none p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Preview"
              className="rounded-lg w-full h-auto object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}