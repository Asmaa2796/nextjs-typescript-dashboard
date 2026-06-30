import z from "zod";
import { HIGHLIGHT_COLORS } from "../types/event.types";

const colorValues = HIGHLIGHT_COLORS.map(
  (c) => c.value
) as [string, ...string[]];

export const eventSchema = z
  .object({
    name: z
      .string()
      .min(1, "Event name is required")
      .max(255, "Event name must be less than 255 characters"),

    date_from: z
      .string()
      .min(1, "Start date is required"),

    date_to: z
      .string()
      .min(1, "End date is required"),

    time_from: z
      .string()
      .min(1, "Start time is required"),

    time_to: z
      .string()
      .min(1, "End time is required"),

    location: z
      .string()
      .min(1, "Location is required"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),

    phone: z
      .string()
      .min(1, "Phone number is required")
      .max(20, "Phone number must be less than 20 characters")
      .regex(/^\d+$/, "Phone number must contain digits only"),

    highlight: z.enum(colorValues, {
      message: "Invalid highlight color",
    }),
  })
  .refine(
    (data) => new Date(data.date_from) <= new Date(data.date_to),
    {
      message: "Start date must be before or equal to end date",
      path: ["date_to"],
    }
  );

export type EventFormValues = z.infer<typeof eventSchema>;