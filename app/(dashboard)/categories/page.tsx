import { getCategories } from "@/app/actions/categories";
import { CategoriesIndex } from "@/components/shared/categories/categories-index";

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium text-slate-600">Categories</h1>
      </div>
      <CategoriesIndex categories={categories} />
    </div>
  )
}