"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CircleUserRoundIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/shared/posts/rich-text-editor";
import { Pattern as GalleryUpload } from "@/components/shared/posts/gallery-upload";
import { useFileUpload } from "@/hooks/use-file-upload";
import { updatePost } from "@/app/actions/posts";

interface Post {
  id: string;
  title: string;
  content: string;
  sub_content: string;
  active: boolean;
  main_image: string;
  sub_images: string[];
  category_id?: number | null;
}

const MAX_SIZE = 20 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  sub_content: z.string().min(1, "Sub content is required"),
  active: z.boolean(),
  category_id: z.string().optional(),
  tag_ids: z.array(z.string()).optional(),
  main_image: z
    .instanceof(File)
    .refine((f) => f.size <= MAX_SIZE, "Max file size is 20MB")
    .refine((f) => ACCEPTED.includes(f.type), "Only jpg, png, webp allowed")
    .optional(),
  new_sub_images: z
    .array(z.instanceof(File))
    .refine(
      (files) => files.every((f) => f.size <= MAX_SIZE),
      "Each file must be under 20MB"
    )
    .optional(),
});

type FormValues = z.infer<typeof schema>;

function MainImagePicker({
  onChange,
  error,
  existingUrl,
}: {
  onChange: (file: File | null) => void;
  error?: string;
  existingUrl?: string;
}) {
  const [{ files }, { removeFile, openFileDialog, getInputProps }] =
    useFileUpload({
      accept: "image/*",
      onFilesChange: (files) =>
        onChange(files[0]?.file instanceof File ? files[0].file : null),
    });

  const previewUrl = files[0]?.preview || existingUrl || null;
  const fileName = files[0]?.file.name || null;
  const isExisting = !files[0] && !!existingUrl;

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="inline-flex items-center gap-2">
        <div className="border-input rounded-md relative flex size-16 shrink-0 items-center justify-center overflow-hidden border bg-background">
          {previewUrl ? (
            <Image
              className="size-full object-cover"
              src={previewUrl}
              alt="Preview"
              width={64}
              height={64}
            />
          ) : (
            <CircleUserRoundIcon className="opacity-60" width="24" height="24" />
          )}
        </div>
        <div className="relative">
          <Button type="button" className="cursor-pointer" onClick={openFileDialog} variant="outline">
            {isExisting ? "Change image" : fileName ? "Change image" : "Upload image"}
          </Button>
          <input {...getInputProps()} className="sr-only" />
        </div>
      </div>

      {isExisting ? (
        <p className="text-muted-foreground text-xs">Using existing image (upload new to replace)</p>
      ) : fileName ? (
        <div className="flex gap-2 text-xs">
          <p className="text-muted-foreground truncate">{fileName}</p>
          <button
            type="button"
            onClick={() => { removeFile(files[0]?.id); onChange(null); }}
            className="text-destructive font-medium hover:underline cursor-pointer"
          >
            Remove
          </button>
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">No image selected</p>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

export function EditPostForm({
  post,
  categories = [],
  tags = [],
  selectedTagIds = [],
}: {
  post: Post;
  categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
  selectedTagIds: string[];
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [removedSubImages, setRemovedSubImages] = useState<string[]>([]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      active: post.active,
      category_id: post.category_id?.toString() || "",
      tag_ids: selectedTagIds,
    },
  });

  const selectedTags = watch("tag_ids") || [];
  const toggleTag = (tagId: string) => {
    const current = [...selectedTags];
    const index = current.indexOf(tagId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(tagId);
    }
    setValue("tag_ids", current, { shouldValidate: true });
  };

  const remainingSubImages = post.sub_images.filter(
    (url) => !removedSubImages.includes(url)
  );

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", post.id);
      formData.append("title", data.title);
      formData.append("content", data.content);
      formData.append("sub_content", data.sub_content);
      formData.append("active", String(data.active));

      if (data.category_id) {
        formData.append("category_id", data.category_id);
      }

      data.tag_ids?.forEach((id) => formData.append("tag_ids", id));

      if (data.main_image) {
        formData.append("main_image", data.main_image);
      }
      formData.append("existing_main_image", post.main_image);

      remainingSubImages.forEach((url) =>
        formData.append("existing_sub_images", url)
      );

      data.new_sub_images?.forEach((file) =>
        formData.append("sub_images", file)
      );

      await updatePost(formData);
      toast.success("Post updated successfully");
      router.push("/posts");
    } catch (err) {
      toast.error("Failed to update post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-2">
      <h1 className="text-2xl font-bold mb-8 text-slate-800">Edit Post</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Title */}
        <div className="space-y-1">
          <Label className="my-2" htmlFor="title">
            Title<sup className="text-red-600">*</sup>
          </Label>
          <Input
            id="title"
            {...register("title")}
            defaultValue={post.title}
            placeholder="Post title"
            className="h-10"
          />
          {errors.title && (
            <p className="text-destructive text-xs">{errors.title.message}</p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1">
          <Label className="my-2">Content<sup className="text-red-600">*</sup></Label>
          <Controller
            name="content"
            control={control}
            defaultValue={post.content}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Write post content..."
                error={!!errors.content}
              />
            )}
          />
          {errors.content && (
            <p className="text-destructive text-xs">{errors.content.message}</p>
          )}
        </div>

        {/* Sub Content */}
        <div className="space-y-1">
          <Label className="my-2">Sub Content<sup className="text-red-600">*</sup></Label>
          <Controller
            name="sub_content"
            control={control}
            defaultValue={post.sub_content}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Write sub content..."
                error={!!errors.sub_content}
              />
            )}
          />
          {errors.sub_content && (
            <p className="text-destructive text-xs">{errors.sub_content.message}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-1">
          <Label className="my-2" htmlFor="category_id">
            Category
          </Label>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <select
                id="category_id"
                value={field.value || ""}
                onChange={(event) => field.onChange(event.target.value)}
                className="block w-full px-3 py-2.5 bg-background border border-border text-foreground text-sm rounded-md shadow-sm focus:border-ring focus:ring-2 focus:ring-ring dark:bg-[#0f172a]"
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.category_id && (
            <p className="text-destructive text-xs">{errors.category_id.message}</p>
          )}
        </div>

        {/* Tags / Keywords */}
        <div className="space-y-1">
          <Label className="my-2">Tags / Keywords</Label>
          <div className="flex flex-wrap gap-2 p-3 border border-border rounded-md bg-background text-foreground dark:bg-[#0f172a]">
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag.id.toString());
              return (
                <Badge
                  key={tag.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer text-xs py-1 px-3 select-none"
                  onClick={() => toggleTag(tag.id.toString())}
                >
                  {tag.name} {isSelected && " ✓"}
                </Badge>
              );
            })}
          </div>
          {errors.tag_ids && (
            <p className="text-destructive text-xs">{errors.tag_ids.message}</p>
          )}
        </div>

        {/* Active Toggle */}
        <div className="flex items-start flex-col-reverse gap-3">
          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <Switch
                className="cursor-pointer"
                checked={field.value}
                onCheckedChange={field.onChange}
                id="active"
              />
            )}
          />
          <Label className="my-2" htmlFor="active">Active</Label>
        </div>

        {/* Main Image */}
        <div className="space-y-1">
          <Label className="my-2">Main Image<sup className="text-red-600">*</sup></Label>
          <MainImagePicker
            existingUrl={post.main_image}
            onChange={(file) =>
              setValue("main_image", file ?? undefined, { shouldValidate: true })
            }
            error={errors.main_image?.message}
          />
        </div>

        {/* Existing Sub Images */}
        {remainingSubImages.length > 0 && (
          <div className="space-y-2">
            <Label className="my-2">Current Gallery Images</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {remainingSubImages.map((url) => (
                <div key={url} className="group/item relative aspect-square">
                  <img
                    src={url}
                    alt="Gallery"
                    className="rounded-lg h-full w-full border object-cover transition-all group-hover/item:brightness-75"
                  />
                  {/* زر الحذف */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/item:opacity-100">
                    <Button
                      type="button"
                      onClick={() =>
                        setRemovedSubImages((prev) => [...prev, url])
                      }
                      variant="secondary"
                      size="icon"
                      className="size-7 cursor-pointer bg-red-100 hover:bg-red-200"
                    >
                      <XIcon className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              Hover on an image and click X to remove it
            </p>
          </div>
        )}

        {/* Add New Sub Images */}
        <div className="space-y-1">
          <Label className="my-2">Add More Gallery Images<sup className="text-red-600">*</sup></Label>
          <GalleryUpload
            maxFiles={10}
            maxSize={MAX_SIZE}
            onFilesChange={(files) => {
              const rawFiles = files
                .map((f) => f.file)
                .filter((f): f is File => f instanceof File);
              setValue("new_sub_images", rawFiles, { shouldValidate: true });
            }}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className={`min-w-32 cursor-pointer ${
              isLoading
                ? "bg-green-600 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>

      </form>
    </div>
  );
}
