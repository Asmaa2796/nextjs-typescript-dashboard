"use client"

import { FolderOpen } from "lucide-react"
import { Category } from "@/lib/types/category.types"

export function CategoriesIndex({
  categories,
}: {
  categories: Category[]
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card dark:bg-[#09161f] p-6 shadow-sm">
      {/* Decorative background */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/10" />
      <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl dark:bg-violet-400/10" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-md text-muted-foreground">Current categories</h2>
            <p className="text-sm text-muted-foreground">
              {categories.length} available
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FolderOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-all hover:scale-105 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/50"
            >
              {category.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}