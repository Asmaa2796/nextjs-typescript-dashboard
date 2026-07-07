"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

// get categories
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*");

  if (error) throw new Error(error.message);
  return data;
}

// reassign post to another category
export async function reassignAndKeyDeleteCategory(
  categoryIdToDelete: number,
  newCategoryId: number,
) {
  if (newCategoryId > 0) {
    const { error: updateError } = await supabase
      .from("posts")
      .update({ category_id: newCategoryId })
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
}