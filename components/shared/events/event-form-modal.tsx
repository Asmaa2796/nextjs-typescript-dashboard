"use client"
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createEvent, updateEvent } from "@/app/actions/events";
import { toast } from "sonner";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HIGHLIGHT_COLORS, Event } from "@/lib/types/event.types";
import { eventSchema, EventFormValues } from "@/lib/validations/event.schema";

type props = {
    open: boolean;
    event?: Event | null;
    onclose: () => void;
}

export default function EventFormModal({ open, event, onclose }: props) {
    const isEditMode = !!event;
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            name: "",
            date_from: "",
            date_to: "",
            time_from: "",
            time_to: "",
            location: "",
            email: "",
            phone: "",
            highlight: HIGHLIGHT_COLORS[0].value,
        }
    });
    const selectedColor = watch("highlight");

    useEffect(() => {
        if (event) {
            reset({
                name: event.name,
                date_from: event.date_from,
                date_to: event.date_to,
                time_from: event.time_from,
                time_to: event.time_to,
                location: event.location ?? "",
                email: event.email ?? "",
                phone: event.phone ?? "",
                highlight: event.highlight,
            });
        }
        else {
            reset()
        }
    }, [event, reset]);

    async function onSubmit(data: EventFormValues) {
        try {
            const fd = new FormData();
            if (isEditMode) {
                fd.append("id", event!.id);
            }
            Object.entries(data).forEach(([k, v]) =>
                fd.append(k, v ?? "")
            )
            isEditMode ? await updateEvent(fd) : await createEvent(fd);
            toast.success(`Event ${isEditMode ? "updated" : "created"} successfully`);
            reset();
            clearErrors();
            onclose();

        }
        catch (error: any) {
            toast.error((error as Error).message || "An error occurred");
        }
    }
    // handle close to reset form and close modal
    function handleClose() {
        reset();
        clearErrors();
        onclose();
    }
    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] p-0 flex flex-col overflow-hidden dark:bg-[#09161f]">
                <DialogHeader className="px-5 py-4 border-b shrink-0">
                    <DialogTitle>
                        {isEditMode ? "Edit Event" : "Add New Event"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20
    scrollbar-track-transparent px-5 py-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Event Name */}
                            <div>
                                <label className="text-sm font-medium">Event Name</label>
                                <input
                                    {...register("name")}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-input/30 dark:text-foreground dark:placeholder:text-muted-foreground"
                                    placeholder="Example: Team Meeting"
                                />
                                {errors.name && (
                                    <p className="text-destructive text-xs mt-1">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>
                            {/* Location */}
                            <div>
                                <label className="text-sm font-medium">
                                    Location
                                </label>
                                <input
                                    {...register("location")}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-input/30 dark:text-foreground dark:placeholder:text-muted-foreground"
                                    placeholder="Example: Egypt,Cairo"
                                />
                                {errors.location && (
                                    <p className="text-destructive text-xs mt-1">
                                        {errors.location.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium">Start Date</label>
                                <input
                                    type="date"
                                    {...register("date_from")}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-input/30 dark:text-foreground dark:placeholder:text-muted-foreground"
                                />
                                {errors.date_from && (
                                    <p className="text-destructive text-xs mt-1">
                                        {errors.date_from.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium">End Date</label>
                                <input
                                    type="date"
                                    {...register("date_to")}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-input/30 dark:text-foreground dark:placeholder:text-muted-foreground"
                                />
                                {errors.date_to && (
                                    <p className="text-destructive text-xs mt-1">
                                        {errors.date_to.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Time */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium">Start Time</label>
                                <input
                                    type="time"
                                    {...register("time_from")}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-input/30 dark:text-foreground dark:placeholder:text-muted-foreground"
                                />
                                {errors.time_from && (
                                    <p className="text-destructive text-xs mt-1">
                                        {errors.time_from.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium">End Time</label>
                                <input
                                    type="time"
                                    {...register("time_to")}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-input/30 dark:text-foreground dark:placeholder:text-muted-foreground"
                                />
                                {errors.time_to && (
                                    <p className="text-destructive text-xs mt-1">
                                        {errors.time_to.message}
                                    </p>
                                )}
                            </div>
                        </div>


                        {/* Contact */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium">
                                    Phone
                                </label>
                                <input
                                    {...register("phone")}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-input/30 dark:text-foreground dark:placeholder:text-muted-foreground"
                                    placeholder="01xxxxxxxxx"
                                />
                                {errors.phone && (
                                    <p className="text-destructive text-xs mt-1">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    {...register("email")}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-input/30 dark:text-foreground dark:placeholder:text-muted-foreground"
                                    placeholder="example@email.com"
                                />
                                {errors.email && (
                                    <p className="text-destructive text-xs mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Event Color */}
                        <div>
                            <label className="text-sm font-medium">Event Color</label>
                            <div className="flex gap-3 mt-2">
                                {HIGHLIGHT_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        title={color.label}
                                        onClick={() => setValue("highlight", color.value)}
                                        className="w-8 h-8 rounded-full transition-all cursor-pointer"
                                        style={{
                                            backgroundColor: color.value,
                                            border:
                                                selectedColor === color.value
                                                    ? "3px solid #000"
                                                    : "3px solid transparent",
                                            outline:
                                                selectedColor === color.value
                                                    ? "2px solid" + color.value
                                                    : "none",
                                            outlineOffset: "2px",
                                        }}
                                    />
                                ))}
                            </div>
                            {errors.highlight && (
                                <p className="text-destructive text-xs mt-1">
                                    {errors.highlight.message}
                                </p>
                            )}
                        </div>
                    </div>


                    {/* Buttons */}
                    <div className="border-t px-5 py-4 flex justify-end gap-2 shrink-0 bg-background dark:bg-gray-950">
                        <Button className="cursor-pointer" type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>

                        <Button className="cursor-pointer" type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "Saving..."
                                : isEditMode
                                    ? "Save Changes"
                                    : "Add Event"}
                        </Button>
                    </div>

                </form>
            </DialogContent>
        </Dialog>

    )
}