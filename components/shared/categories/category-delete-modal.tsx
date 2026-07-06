"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { reassignAndKeyDeleteCategory } from "@/app/actions/categories"
import { supabase } from "@/lib/supabase";

interface CategoryDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  category: { id: number; name: string } | null
  allCategories: { id: number; name: string }[]
}

export function CategoryDeleteModal({
  isOpen,
  onClose,
  category,
  allCategories,
}: CategoryDeleteModalProps) {
  const [loading, setLoading] = useState(false)
  const [postCount, setPostCount] = useState(0)
  const [checkingRelations, setCheckingRelations] = useState(true)
  const [targetCategoryId, setTargetCategoryId] = useState("")

  useEffect(() => {
    if (isOpen && category) {
      const checkPostRelations = async () => {
        setCheckingRelations(true)

        const { count, error } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id)

        if (!error && count !== null) {
          setPostCount(count)
        }

        setCheckingRelations(false)
      }

      checkPostRelations()
    }
  }, [isOpen, category, supabase])

  const availableCategories = allCategories.filter(
    (c) => c.id !== category?.id
  )

  const handleDelete = async () => {
    if (!category) return

    if (postCount > 0 && !targetCategoryId) {
      toast.error(
        "Please select a replacement category to move the posts first."
      )
      return
    }

    setLoading(true)

    try {
      if (postCount > 0) {
        await reassignAndKeyDeleteCategory(
          category.id,
          Number(targetCategoryId)
        )

        toast.success(
          `Posts were reassigned and category "${category.name}" was deleted successfully.`
        )
      } else {
        await reassignAndKeyDeleteCategory(category.id, 0)

        toast.success(
          `Category "${category.name}" was deleted successfully.`
        )
      }

      onClose()
    } catch (error) {
      toast.error("An error occurred while deleting the category.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Category: {category?.name}
          </DialogTitle>

          <DialogDescription>
            Please review the required actions before deleting this category
            from the database.
          </DialogDescription>
        </DialogHeader>

        {checkingRelations ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : postCount > 0 ? (
          <div className="space-y-4 py-2">
            <Alert variant="destructive">
              <AlertTitle>Important Notice!</AlertTitle>

              <AlertDescription>
                This category is currently assigned to{" "}
                <strong>{postCount}</strong>{" "}
                post{postCount !== 1 ? "s" : ""}. It cannot be deleted directly
                due to database restrictions.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select a replacement category:
              </label>

              <Select
                onValueChange={(value) => setTargetCategoryId(value ?? "")}
                value={targetCategoryId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>

                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id.toString()}
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">
            This category does not contain any posts. Are you sure you want to
            permanently delete it?
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={
              loading ||
              checkingRelations ||
              (postCount > 0 && !targetCategoryId)
            }
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}

            {postCount > 0
              ? "Reassign Posts & Delete"
              : "Confirm Deletion"}
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}