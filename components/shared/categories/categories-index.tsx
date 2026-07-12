"use client"

import { useState } from "react"
import {
  FolderOpen,
  Trash2,
  FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { CategoryDeleteModal } from "./category-delete-modal"

interface Category {
  id: number
  name: string
  posts_count?: number
}

export function CategoriesIndex({
  categories,
}: {
  categories: Category[]
}) {
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null)

  return (
    <>
      <div className="rounded-2xl border bg-card dark:bg-[#09161f] p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Manage all categories in one place.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="transition-all hover:shadow-md dark:bg-gray-950"
            >
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <h3 className="font-semibold">
                    {category.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />

                    {category.posts_count ?? 0} Posts
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <CategoryDeleteModal
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        allCategories={categories}
      />
    </>
  )
}