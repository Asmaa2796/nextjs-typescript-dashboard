"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { deletePost } from "@/app/actions/posts";
import {
  AlertDialogAction, AlertDialogTrigger,
  AlertDialogContent, AlertDialog,
  AlertDialogHeader, AlertDialogDescription, AlertDialogCancel, AlertDialogTitle, AlertDialogFooter
} from "@/components/ui/alert-dialog";
export type Post = {
  id: string;
  title: string | null;
  main_image: string | null;
  sub_images: [] | null;
  content: string | null;
  sub_content: string | null;
  active: boolean | null;
  created_at: string;
};

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function DeletePostCell({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Tooltip>
      <TooltipTrigger>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-red-100 border-red-400 text-red-700 cursor-pointer">
            <Trash2 className="h-4 w-4" />
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Post</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                disabled={isLoading}
                onClick={async (e) => {
                  e.preventDefault();
                  setIsLoading(true);
                  try {
                    const formData = new FormData();
                    formData.append("id", postId);
                    await deletePost(formData);
                    setOpen(false);
                    toast.success("Post deleted successfully");
                  } catch {
                    toast.error("Failed to delete post");
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TooltipTrigger>

      <TooltipContent>
        <p>Delete Post</p>
      </TooltipContent>
    </Tooltip>
  );
}
export const columns: ColumnDef<Post>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        className="cursor-pointer"
        variant="ghost"
        onClick={() =>
          column.toggleSorting(
            column.getIsSorted() === "asc"
          )
        }
      >
        Title
        <ArrowUpDown className="ml-2 h-4 w-4 text-orange-600" />
      </Button>
    ),
  },
  {
    accessorKey: "main_image",
    header: "Image",
    cell: ({ row }) => (
      <div className="post-image">
        <img
          src={row.original.main_image ?? ""}
          alt="Main Image"
          className="rounded-md object-cover"
        />
      </div>
    ),
  },
  {
    id: "gallery",
    header: "Gallery",
    cell: ({ row }) => {
      const images =
        row.original.sub_images ?? [];

      return (
        <Badge variant="outline">
          {images.length} Images
        </Badge>
      );
    },
  },
  {
    accessorKey: "content",
    header: "Content",
    cell: ({ row }) => {
      const raw = row.original.content ?? "";
      let text = raw;
      try {
        const parsed = JSON.parse(raw);
        text = parsed.blocks?.map((b: any) => b.text).join(" ") ?? raw;
      } catch { }
      return <div className="max-w-30 truncate">{text}</div>;
    },
  },
  {
    accessorKey: "sub_content",
    header: "Sub Content",
    cell: ({ row }) => {
      const raw = row.original.sub_content ?? "";
      let text = raw;
      try {
        const parsed = JSON.parse(raw);
        text = parsed.blocks?.map((b: any) => b.text).join(" ") ?? raw;
      } catch { }
      return <div className="max-w-30 truncate">{text}</div>;
    },
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={row.original.active === true ? "border-green-600 bg-green-100 text-green-700" : "border-amber-600 bg-amber-100 text-amber-600"}>
        {row.original.active
          ? "Active"
          : "Inactive"}
      </Badge>
    ),
  },

  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) =>
      new Date(row.original.created_at)
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-"),
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const post = row.original;

      return (
        <TooltipProvider>
          <div className="flex items-center gap-2 justify-center">

            <Tooltip>
              <TooltipTrigger className="cursor-pointer inline-flex items-center justify-center h-8 w-8 rounded-md border border-border hover:bg-muted">
                <span className="text-center">
                  <Link href={`/posts/show/${post.id}`}>
                    <Eye className="h-4 w-4 text-indigo-400" />
                  </Link>
                </span>
              </TooltipTrigger>

              <TooltipContent>
                <p>Show Post</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger className="cursor-pointer inline-flex items-center justify-center h-8 w-8 rounded-md border border-border hover:bg-muted">
                <span className="text-center">
                  <Link href={`/posts/edit/${post.id}`}>
                    <Pencil className="h-4 w-4 text-green-400" />
                  </Link>
                </span>
              </TooltipTrigger>

              <TooltipContent>
                <p>Edit Post</p>
              </TooltipContent>
            </Tooltip>

            <DeletePostCell postId={post.id} />

          </div>
        </TooltipProvider>
      );
    },
  },
];