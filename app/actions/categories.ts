"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

// get categories
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories_with_post_count")
    .select("*")
    .order("name")

  if (error) throw error

  return data
}

// reassign post to another category
export async function reassignAndKeyDeleteCategory(
  categoryIdToDelete: number,
  newCategoryId: number,
) {
  let replacementCategoryName: string | null = null;

  if (newCategoryId > 0) {
    const { data: replacementCategory, error: replacementCategoryError } = await supabase
      .from("categories")
      .select("name")
      .eq("id", newCategoryId)
      .single();

    if (replacementCategoryError) {
      console.error(replacementCategoryError);
      throw new Error("Failed to resolve replacement category");
    }

    replacementCategoryName = replacementCategory?.name ?? null;

    const { error: updateError } = await supabase
      .from("posts")
      .update({
        category_id: newCategoryId,
        category_name: replacementCategoryName,
      })
      .eq("category_id", categoryIdToDelete);

    if (updateError) {
      console.error(updateError);
      throw new Error("Failed to move posts");
    }
  }

  const { error: deleteError } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryIdToDelete);

  if (deleteError) {
    console.error(deleteError);
    throw new Error("Failed to delete category");
  }

  revalidatePath("/posts");
  revalidatePath("/categories");
}