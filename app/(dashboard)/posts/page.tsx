import { supabase } from "@/lib/supabase";
import { columns } from "@/components/shared/posts/columns";
import { DataTable } from "@/components/shared/posts/data-table";

export default async function PostsPage() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: true });
    ;
    
  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">
        Posts
      </h1>

      <DataTable
        columns={columns}
        data={posts ?? []}
      />
    </div>
  );
}