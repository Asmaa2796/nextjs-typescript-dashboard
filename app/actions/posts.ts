"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit-log";

// create post
export async function createPost(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const sub_content = formData.get("sub_content") as string;
  const active = formData.get("active") === "true";
  const mainImageFile = formData.get("main_image") as File;
  const subImageFiles = formData.getAll("sub_images") as File[];
  const categoryId = formData.get("category_id");
  const categoryName = formData.get("category_name") as string | null;
  const tagIds = formData.getAll("tag_ids");

  // Upload main image
  let main_image = "";
  if (mainImageFile && mainImageFile.size > 0) {
    const ext = mainImageFile.name.split(".").pop();
    const path = `main/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("project-images")
      .upload(path, mainImageFile);

    if (error) {
      throw new Error("Failed to upload main image: " + error.message);
    }

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

    if (error) {
      throw new Error("Failed to upload sub image: " + error.message);
    }

    const { data: urlData } = supabase.storage
      .from("project-images")
      .getPublicUrl(path);

    sub_images.push(urlData.publicUrl);
  }

  const insertPayload: Record<string, unknown> = {
    title,
    content,
    sub_content,
    active,
    main_image,
    sub_images,
    category_id:
      categoryId && categoryId !== "" ? Number(categoryId) : null,
  };

  if (categoryName && categoryName !== "") {
    insertPayload.category_name = categoryName;
  }

  let { data: newPost, error } = await supabase
    .from("posts")
    .insert(insertPayload)
    .select()
    .single();

  if (
    error?.message?.includes("does not exist") &&
    insertPayload.category_name
  ) {
    const fallbackPayload = { ...insertPayload };
    delete fallbackPayload.category_name;

    ({ data: newPost, error } = await supabase
      .from("posts")
      .insert(fallbackPayload)
      .select()
      .single());
  }

  if (error || !newPost) {
    console.error(error);
    throw new Error(error?.message || "Failed to create post");
  }

  if (tagIds.length > 0) {
    const rows = tagIds
      .filter((id) => id !== "")
      .map((id) => ({
        post_id: newPost.id,
        tag_id: Number(id),
      }));

    if (rows.length > 0) {
      const { error: tagsError } = await supabase
        .from("post_tags")
        .insert(rows);

      if (tagsError) {
        console.error(tagsError);
      }
    }
  }

  await logAudit({
    action: "post.created",
    entityType: "post",
    entityId: newPost.id,
    metadata: {
      title: newPost.title,
      category_id: insertPayload.category_id,
      active,
    },
  });

  revalidatePath("/posts");

  return {
    success: true,
    post_id: newPost.id,
  };
}

// update post
export async function updatePost(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const sub_content = formData.get("sub_content") as string;
  const active = formData.get("active") === "true";
  const mainImageFile = formData.get("main_image") as File | null;
  const subImageFiles = formData.getAll("sub_images") as File[];
  const existingMainImage = formData.get(
    "existing_main_image"
  ) as string;
  const existingSubImages = formData.getAll(
    "existing_sub_images"
  ) as string[];
  const categoryId = formData.get("category_id");
  const tagIds = formData.getAll("tag_ids");

  const { data: previousPost } = await supabase
    .from("posts")
    .select("title, active, category_id")
    .eq("id", id)
    .single();

  let main_image = existingMainImage;

  if (mainImageFile && mainImageFile.size > 0) {
    const ext = mainImageFile.name.split(".").pop();
    const path = `main/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("project-images")
      .upload(path, mainImageFile);

    if (error) {
      throw new Error("Failed to upload main image: " + error.message);
    }

    const { data: urlData } = supabase.storage
      .from("project-images")
      .getPublicUrl(path);

    main_image = urlData.publicUrl;
  }

  const sub_images = [...existingSubImages];

  for (const file of subImageFiles) {
    if (file.size === 0) continue;

    const ext = file.name.split(".").pop();
    const path = `gallery/${Date.now()}-${Math.random()}.${ext}`;

    const { error } = await supabase.storage
      .from("project-images")
      .upload(path, file);

    if (error) {
      throw new Error("Failed to upload sub image: " + error.message);
    }

    const { data: urlData } = supabase.storage
      .from("project-images")
      .getPublicUrl(path);

    sub_images.push(urlData.publicUrl);
  }

  const updatePayload: Record<string, unknown> = {
    title,
    content,
    sub_content,
    active,
    main_image,
    sub_images,
  };

  if (categoryId && categoryId !== "") {
    updatePayload.category_id = Number(categoryId);
  }

  const { error } = await supabase
    .from("posts")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("post_tags").delete().eq("post_id", id);

  if (tagIds.length > 0) {
    const rows = tagIds
      .filter((id) => id !== "")
      .map((id) => ({
        post_id: id,
        tag_id: Number(id),
      }));

    if (rows.length > 0) {
      const { error: tagsError } = await supabase
        .from("post_tags")
        .insert(rows);

      if (tagsError) {
        console.error(tagsError);
      }
    }
  }

  await logAudit({
    action: "post.updated",
    entityType: "post",
    entityId: id,
    metadata: {
      before: previousPost ?? null,
      after: {
        title,
        active,
        category_id:
          updatePayload.category_id ??
          previousPost?.category_id ??
          null,
      },
    },
  });

  revalidatePath("/posts");
  revalidatePath(`/posts/${id}`);
}

// delete post
export async function deletePost(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;

  const { data: postToDelete } = await supabase
    .from("posts")
    .select("title")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await logAudit({
    action: "post.deleted",
    entityType: "post",
    entityId: id,
    metadata: {
      title: postToDelete?.title ?? null,
    },
  });

  revalidatePath("/posts");
}