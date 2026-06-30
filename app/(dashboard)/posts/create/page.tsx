"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CircleUserRoundIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/shared/posts/rich-text-editor";
import { Pattern as GalleryUpload } from "@/components/shared/posts/gallery-upload";
import { useFileUpload } from "@/hooks/use-file-upload";
import { createPost } from "@/app/actions/posts";

const MAX_SIZE = 20 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  sub_content: z.string().min(1, "Sub content is required"),
  active: z.boolean(),
  main_image: z
    .instanceof(File, { message: "Main image is required" })
    .refine((f) => f.size <= MAX_SIZE, "Max file size is 20MB")
    .refine((f) => ACCEPTED.includes(f.type), "Only jpg, png, webp allowed"),
  sub_images: z
    .array(z.instanceof(File))
    .min(1, "At least one gallery image is required")
    .refine(
      (files) => files.every((f) => f.size <= MAX_SIZE),
      "Each file must be under 20MB"
    )
    .refine(
      (files) => files.every((f) => ACCEPTED.includes(f.type)),
      "Only jpg, png, webp allowed"
    ),
});

type FormValues = z.infer<typeof schema>;

function MainImagePicker({
  onChange,
  error,
}: {
  onChange: (file: File | null) => void;
  error?: string;
}) {
  const [{ files }, { removeFile, openFileDialog, getInputProps }] =
    useFileUpload({
      accept: "image/*",
      onFilesChange: (files) =>
        onChange(files[0]?.file instanceof File ? files[0].file : null),
    });

  const previewUrl = files[0]?.preview || null;
  const fileName = files[0]?.file.name || null;

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="inline-flex items-center gap-2">
        <div className="border-input rounded-md relative flex size-16 shrink-0 items-center justify-center overflow-hidden border bg-white">
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
            {fileName ? "Change image" : "Upload image"}
          </Button>
          <input {...getInputProps()} className="sr-only" />
        </div>
      </div>

      {fileName ? (
        <div className="flex gap-2 text-xs">
          <p className="text-muted-foreground truncate">{fileName}</p>
          <button
            type="button"
            onClick={() => {
              removeFile(files[0]?.id);
              onChange(null);
            }}
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

export default function CreatePostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { active: false },
  });

  const onSubmit = async (data: FormValues) => {
    // console.log("submitted", data); 
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      formData.append("sub_content", data.sub_content);
      formData.append("active", String(data.active));
      formData.append("main_image", data.main_image);
      data.sub_images.forEach((file) => formData.append("sub_images", file));

      await createPost(formData);
      toast.success("Post created successfully");
      router.push("/posts");
    } catch (err) {
      toast.error("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-2">
      <h1 className="text-2xl font-bold mb-8 text-slate-800">Create Post</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Title */}
        <div className="space-y-1">
          <Label className="my-2" htmlFor="title">Title<sup className="text-red-600">*</sup></Label>
          <Input id="title" {...register("title")} placeholder="Post title" className="bg-white h-10" />
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
            onChange={(file) =>
              setValue("main_image", file as File, { shouldValidate: true })
            }
            error={errors.main_image?.message}
          />
        </div>

        {/* Sub Images / Gallery */}
        <div className="space-y-1">
          <Label className="my-2">Gallery Images<sup className="text-red-600">*</sup></Label>
          <GalleryUpload
            maxFiles={10}
            maxSize={MAX_SIZE}
            onFilesChange={(files) => {
              const rawFiles = files
                .map((f) => f.file)
                .filter((f): f is File => f instanceof File);
              setValue("sub_images", rawFiles, { shouldValidate: true });
            }}
          />
          {errors.sub_images && (
            <p className="text-destructive text-xs">
              {errors.sub_images.message as string}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading} className={`min-w-32 cursor-pointer ${isLoading ? "bg-green-600 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
            {isLoading ? "Creating..." : "Create Post"}
          </Button>
        </div>

      </form>
    </div>
  );
}
