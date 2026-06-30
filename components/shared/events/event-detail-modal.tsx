"use client"

import { Event } from "@/lib/types/event.types"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, MapPin, Phone, Mail, Clock, Calendar } from "lucide-react"

type Props = {
    open: boolean
    event: Event | null
    onClose: () => void
    onEdit: () => void
    onDelete: () => void
}

export function EventDetailModal({
    open, event, onClose, onEdit, onDelete
}: Props) {
    if (!event) return null

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const formatTime = (t: string) => {
        const [h, m] = t.split(":").map(Number)
        const suffix = h >= 12 ? "P.M" : "A.M"
        const hour = h % 12 || 12
        return `${hour}:${String(m).padStart(2, "0")} ${suffix}`
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">

                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-1 h-8 rounded-full shrink-0"
                            style={{ background: event.highlight }}
                        />
                        <DialogTitle>
                            {event.name}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-3 mt-2 text-sm">

                    <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                            <p>{formatDate(event.date_from)}</p>
                            {event.date_from !== event.date_to && (
                                <p className="text-muted-foreground">
                                    To {formatDate(event.date_to)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                        <p>
                            {formatTime(event.time_from)} — {formatTime(event.time_to)}
                        </p>
                    </div>

                    {event.location && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                            <p>{event.location}</p>
                        </div>
                    )}

                    {event.phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                            <p>{event.phone}</p>
                        </div>
                    )}

                    {event.email && (
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                            <p>{event.email}</p>
                        </div>
                    )}

                </div>

                <div className="flex justify-between mt-4 pt-4
                        border-t border-border">
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive cursor-pointer"
                            onClick={onDelete}
                        >
                            <Trash2 className="w-4 h-4 ml-1" /> Delete
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="cursor-pointer" onClick={onClose}>
                            Close
                        </Button>
                        <Button size="sm" onClick={onEdit} className="cursor-pointer">
                            <Pencil className="w-4 h-4 ml-1" /> Edit
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}