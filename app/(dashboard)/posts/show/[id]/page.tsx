// المسار: app/posts/show/[id]/page.tsx

import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import { RichTextDisplay } from "@/components/shared/posts/rich-text-display";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ShowPostPage({ params }: Props) {
  const { id } = await params;

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !post) notFound();

  // Fetch post tags
  const { data: postTags } = await supabase
    .from("post_tags")
    .select("tags(id, name)")
    .eq("post_id", id);

  const tags = postTags?.map((pt: any) => pt.tags).filter(Boolean) || [];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 bg-card text-card-foreground dark:bg-[#09161f] rounded-lg border border-border shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/posts">
          <Button variant="ghost" size="sm" className="gap-2 cursor-pointer">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Posts
          </Button>
        </Link>
        <Link href={`/posts/edit/${post.id}`}>
          <Button size="sm" className="gap-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white">
            <PencilIcon className="h-4 w-4" />
            Edit Post
          </Button>
        </Link>
      </div>

      {/* Main Image */}
      {post.main_image && (
        <div className="mb-6 overflow-hidden rounded-xl">
          <img
            src={post.main_image}
            alt={post.title}
            className="w-full h-72 object-cover"
          />
        </div>
      )}

      {/* Title + Status */}
      <div className="flex items-start gap-3 mb-4">
        <h1 className="text-3xl font-bold flex-1 text-foreground">{post.title}</h1>
        <Badge
          variant="outline"
          className={
            post.active
              ? "border-green-500 text-green-600"
              : "border-muted-foreground text-muted-foreground"
          }
        >
          {post.active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Category and Tags */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {post.category_id && (
          <div>
            <span className="text-muted-foreground text-sm mr-2">Category:</span>
            <Badge variant="secondary" className="text-foreground">{post.category_name || "Uncategorized"}</Badge>
          </div>
        )}
        {tags.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Tags:</span>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: any) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-muted-foreground">Content</h2>
        <div className="prose max-w-none">
          <RichTextDisplay content={post.content} />
        </div>
      </div>

      {/* Sub Content */}
      {post.sub_content && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-muted-foreground">Sub Content</h2>
          <div className="prose max-w-none">
            <RichTextDisplay content={post.sub_content} />
          </div>
        </div>
      )}

      {/* Gallery */}
      {post.sub_images?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
            Gallery ({post.sub_images.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {post.sub_images.map((url: string, i: number) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={url}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}