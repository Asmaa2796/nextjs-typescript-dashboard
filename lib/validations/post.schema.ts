import { z } from "zod";

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title is too long"),

  content: z
    .string()
    .min(10, "Content must be at least 10 characters"),

  sub_content: z
    .string()
    .min(10, "Sub content must be at least 10 characters"),

  active: z.boolean(),

  main_image: z.string().nullable().optional(),
  sub_images: z.array(z.string()).optional(),
});

export type PostFormValues =
  z.infer<typeof postSchema>;