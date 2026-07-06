import CreatePostForm from "./create-post-form";
import { supabase } from "@/lib/supabase"; 

export default async function Page() {
  
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from("categories").select("id, name"),
    supabase.from("tags").select("id, name")
  ]);

  return (
    <CreatePostForm 
      categories={categories || []} 
      tags={tags || []} 
    />
  );
}