"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// create post
export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const sub_content = formData.get("sub_content") as string;
  const active = formData.get("active") === "true";
  const mainImageFile = formData.get("main_image") as File;
  const subImageFiles = formData.getAll("sub_images") as File[];

  // Upload main image
  let main_image = "";
  if (mainImageFile && mainImageFile.size > 0) {
    const ext = mainImageFile.name.split(".").pop();
    const path = `main/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("project-images")
      .upload(path, mainImageFile);
    if (error) throw new Error("Failed to upload main image: " + error.message);
    const { data: urlData } = supabase.storage
      .from("project-images")
      .getPublicUrl(path);
    main_image = urlData.publicUrl;
  }

  // Upload sub images
  const sub_images: string[] = [];
  for (const file of subImageFiles) {
    if (file.size === 0) continue;
    const ext = file.name.split(".").pop();
    const path = `gallery/${Date.now()}-${Math.random()}.${ext}`;
    const { error } = await supabase.storage
      .from("project-images")
      .upload(path, file);
    if (error) throw new Error("Failed to upload sub image: " + error.message);
    const { data: urlData } = supabase.storage
      .from("project-images")
      .getPublicUrl(path);
    sub_images.push(urlData.publicUrl);
  }

  const { error } = await supabase.from("posts").insert({
    title,
    content,
    sub_content,
    active,
    main_image,
    sub_images,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/posts");
}

// update post
export async function updatePost(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const sub_content = formData.get("sub_content") as string;
  const active = formData.get("active") === "true";
  const mainImageFile = formData.get("main_image") as File | null;
  const subImageFiles = formData.getAll("sub_images") as File[];
  const existingMainImage = formData.get("existing_main_image") as string;
  const existingSubImages = formData.getAll("existing_sub_images") as string[];

  let main_image = existingMainImage;
  if (mainImageFile && mainImageFile.size > 0) {
    const ext = mainImageFile.name.split(".").pop();
    const path = `main/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("project-images")
      .upload(path, mainImageFile);
    if (error) throw new Error("Failed to upload main image: " + error.message);
    const { data: urlData } = supabase.storage
      .from("project-images")
      .getPublicUrl(path);
    main_image = urlData.publicUrl;
  }

  const sub_images: string[] = [...existingSubImages];
  for (const file of subImageFiles) {
    if (file.size === 0) continue;
    const ext = file.name.split(".").pop();
    const path = `gallery/${Date.now()}-${Math.random()}.${ext}`;
    const { error } = await supabase.storage
      .from("project-images")
      .upload(path, file);
    if (error) throw new Error("Failed to upload sub image: " + error.message);
    const { data: urlData } = supabase.storage
      .from("project-images")
      .getPublicUrl(path);
    sub_images.push(urlData.publicUrl);
  }

  const { error } = await supabase
    .from("posts")
    .update({ title, content, sub_content, active, main_image, sub_images })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/posts");
  revalidatePath(`/posts/${id}`);
}

// delete post
export async function deletePost(formData: FormData) {
  const id = formData.get("id") as string;
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/posts");
}