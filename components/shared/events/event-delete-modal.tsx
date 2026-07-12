"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Event } from "@/lib/types/event.types"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteEvent } from "@/app/actions/events"

type Props = {
  open: boolean
  event: Event | null
  onClose: () => void
}

export function EventDeleteModal({ open, event, onClose }: Props) {
  const [loading, setLoading] = useState(false)

  if (!event) return null

  const currentEvent = event;
  async function handleDelete() {
    setLoading(true)
    try {
      await deleteEvent(currentEvent.id)
      toast.success("Event deleted successfully")
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm bg-white dark:bg-[#09161f]">

        <DialogHeader>
          <DialogTitle>
            Confirm Deletion
          </DialogTitle>

          <DialogDescription>
            Are you sure you want to delete the event
            <span className="font-medium text-foreground">
              {" "}{currentEvent.name}{" "}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: currentEvent.highlight }}
          />
          <span className="text-sm text-muted-foreground">
            {currentEvent.name}
          </span>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            className="cursor-pointer"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}