# PROJECT_SUMMARY.md

## Project overview
`my-dashboard-app` is a protected admin dashboard built with Next.js (App Router). It provides authentication (Supabase email/password), CRUD management for “posts”, analytics dashboards, and event calendar management. Posts include rich-text content (Draft.js-based), an optional main image, and a gallery of sub-images stored in Supabase Storage.

The UI is organized into a dashboard layout with a sidebar and top navbar, plus pages for dashboard analytics, listing posts, viewing a single post, creating a post, editing an existing post, and managing events.

## Technologies used
- **Next.js** (App Router)
- **React** (v19)
- **TypeScript**
- **Tailwind CSS** (Tailwind v4) + `class-variance-authority`, `tailwind-merge`, `clsx`
- **UI components**: Shadcn-like `components/ui/*` (e.g., Button, Card, Table, Dialog, Tabs, etc.)
- **Auth / Backend**: **Supabase**
  - `@supabase/supabase-js`
  - `@supabase/ssr` for middleware/cookie-based SSR session handling
- **Database**: Supabase Postgres (table `posts`)
- **Storage**: Supabase Storage bucket `project-images`
- **Rich text**:
  - Draft.js editor via `react-draft-wysiwyg`
  - HTML rendering via `draftjs-to-html`
- **Forms/validation**:
  - `react-hook-form`
  - `zod` + `@hookform/resolvers/zodResolver`
- **Table UI**: `@tanstack/react-table` (client-side sorting/filtering/pagination)
- **Toasts/notifications**: `sonner`
- **Icons**: `lucide-react`

## Folder structure (high-level)
- `app/`
  - `layout.tsx` — root layout, ThemeProvider, Toaster, fonts
  - `login/page.tsx` — login page
  - `actions/`
    - `auth.ts` — server actions: signIn, signOut, getUser
    - `posts.ts` — server actions: createPost, updatePost, deletePost
  - `(dashboard)/`
    - `page.tsx` — dashboard overview with analytics cards and charts
    - `events/`
      - `page.tsx` — events calendar view
    - `posts/`
      - `page.tsx` — server-rendered posts list
      - `show/[id]/page.tsx` — server-rendered post detail
      - `create/page.tsx` — client post creation form
      - `edit/[id]/page.tsx` — server component to fetch post and render edit form
      - `edit/[id]/edit-post-form.tsx` — client post editing form (not included in tool reads here, but referenced)
      - `loading.tsx` — loading state for dashboard posts route (referenced)
    - `settings/page.tsx` — settings placeholder page
    - `users/page.tsx` — users placeholder page
- `components/`
  - `providers/theme-provider.tsx` — theme provider
  - `shared/`
    - `navbar.tsx` — top navbar (search + user dropdown + logout)
    - `sidebar.tsx` — responsive sidebar (desktop collapsible + mobile drawer)
    - `signout-button.tsx` — referenced by open tabs
    - `posts/`
      - `columns.tsx` — table column definitions for posts
      - `data-table.tsx` — table component (tanstack/react-table)
      - `rich-text-editor.tsx` — Draft.js editor wrapper
      - `rich-text-display.tsx` — converts stored Draft.js JSON/content into HTML
      - `gallery-upload.tsx` — image gallery uploader UI
    - `events/`
      - `events-calendar.tsx` — calendar view for events
      - `event-form-modal.tsx` — event create/edit modal form
      - `event-detail-modal.tsx` — event detail modal
      - `event-delete-modal.tsx` — event deletion confirmation modal
    - `dashboard/`
      - `stats-card.tsx` — dashboard metric card
      - `events-chart.tsx` — daily events bar chart
      - `posts-status-chart.tsx` — posts status radial chart
      - `events-time-of-day-chart.tsx` — events time-of-day area chart
  - `ui/`
    - `button.tsx`, `table.tsx`, `dialog.tsx`, `alert.tsx`, etc. (shadcn-style components)
  - `mode-toggle.tsx` — theme toggler (referenced)
- `hooks/`
  - `use-file-upload.ts` — reusable drag/drop file uploader with previews and validation
- `lib/`
  - `supabase.ts` — Supabase client (public/browser-side, uses NEXT_PUBLIC env vars)
  - `seed-posts.sql` — SQL seed script (inserts sample posts)
  - `utils.ts` — `cn()` helper for classnames
  - `validations/post.schema.ts` — Zod schema for post fields (note: create/edit pages also define their own schemas)
- `middleware.ts` — Supabase SSR session + route protection middleware

## Features
- **Route protection** using Supabase SSR session in `middleware.ts`
  - Redirects unauthenticated users to `/login`
  - Redirects authenticated users away from `/login`
- **Login** via Supabase email/password
- **Logout** via Supabase signOut server action
- **Posts dashboard**
  - List posts in a searchable/sortable/paginated table
  - View post detail (main image, rich text content, gallery)
  - Create post
    - Upload main image + gallery images to Supabase Storage
    - Submit rich text content (Draft.js JSON) plus text fields
  - Edit post
    - Re-upload main image and/or add new gallery images
  - Delete post with confirmation dialog
- **Analytics dashboard**
  - Dashboard overview with total posts, total events, total users cards
  - Events activity chart for the last 7 days
  - Posts status donut chart and active/inactive breakdown
  - Events time-of-day stacked area chart for morning, afternoon, evening
- **Events management**
  - Calendar view for events
  - Event CRUD support with server-side actions and validation
  - Event details include date, time, location, contact, and highlight style
- **Rich text authoring**
  - Draft.js editor with limited toolbar options
  - Renderer converts Draft.js raw JSON into HTML (with fallback to plain text)
- **Image uploads**
  - Drag-and-drop and click-to-upload gallery
  - Previews via `URL.createObjectURL()`
  - Uploads to Supabase Storage bucket `project-images`

## State management
- **No global app state library for domain data**.
- **UI state** uses React hooks within components:
  - `useState` for table sorting/filters/pagination state (in `DataTable`)
  - `useState` for loading/submission states in create/edit forms
  - `useState` for file uploader previews and drag state (`useFileUpload`)
  - `useState` for dialog open/close and delete loading states
- **Server Actions** are used for mutations (create/update/delete and auth actions). After mutations, routes are revalidated using `revalidatePath`.

## APIs used
### Supabase
- **Auth**
  - `supabase.auth.signInWithPassword({ email, password })`
  - `supabase.auth.signOut()`
  - `supabase.auth.getUser()`
- **Database** (`posts` table)
  - Select list: `supabase.from('posts').select('*')`
  - Select single: `.eq('id', id).single()`
  - Insert: `.from('posts').insert({ ... })`
  - Update: `.from('posts').update({ ... }).eq('id', id)`
  - Delete: `.from('posts').delete().eq('id', id)`
- **Storage**
  - Upload main image and gallery images:
    - `supabase.storage.from('project-images').upload(path, file)`
  - Generate public URLs:
    - `supabase.storage.from('project-images').getPublicUrl(path)`

### Next.js
- **Server Actions** via `"use server"` server action modules
- **Route rendering**: App Router server components/pages fetch data from Supabase directly
- **Revalidation**: `revalidatePath()` after mutations

## Authentication
Authentication is implemented with Supabase email/password:

- **Login page**: `app/login/page.tsx`
  - Client-side form posts to a Supabase server action `signIn(formData)`.
- **Server actions**: `app/actions/auth.ts`
  - `signIn(formData)` calls `supabase.auth.signInWithPassword(...)` and then redirects to `/`.
  - `signOut()` calls `supabase.auth.signOut()` and redirects to `/login`.
  - `getUser()` can be used to retrieve the current Supabase user.
- **Route protection**: `middleware.ts`
  - Uses `createServerClient` from `@supabase/ssr`.
  - Reads the current session user using `supabase.auth.getUser()`.
  - Redirect rules:
    - Not logged in -> redirect to `/login` for all routes except `/login`.
    - Logged in and visiting `/login` -> redirect to `/`.

## Database
Supabase Postgres is used as the primary database.

- Primary table: `posts`
- Fields inferred/used in code:
  - `id` (used as identifier)
  - `title`
  - `content` (Draft.js raw JSON stored as a string)
  - `sub_content` (Draft.js raw JSON stored as a string)
  - `active` (boolean)
  - `main_image` (string URL)
  - `sub_images` (array of image URL strings)
  - `created_at`

Mutations are performed in server actions:
- `app/actions/posts.ts`
  - `createPost(formData)` inserts a new row.
  - `updatePost(formData)` updates row by `id`.
  - `deletePost(formData)` deletes row by `id`.

A SQL seed file exists:
- `lib/seed-posts.sql` inserts sample rows into `public.posts`.

## UI libraries
- **shadcn-like UI kit** via local `components/ui/*` (Button, Dialog, Table, Tooltip, etc.)
- **Lucide icons** (`lucide-react`)
- **sonner** notifications (`Toaster` + `toast`)
- **@tanstack/react-table** for posts table

## Styling
- **Tailwind CSS** (`app/globals.css`, Tailwind config via `tailwind.config` implied by package deps)
- **Theme support**: `next-themes` through `components/providers/theme-provider.tsx`
- **Utility helpers**: `lib/utils.ts` exports `cn()` (clsx + tailwind-merge)
- **Global UI feedback**: `sonner` toast + `Toaster` in `app/layout.tsx`

## Major components (by domain)
### Auth
- `app/login/page.tsx`
- `app/actions/auth.ts`
- `middleware.ts`
- `components/shared/navbar.tsx` (logout UI)
- `components/shared/sidebar.tsx` (logout button form)

### Posts (CRUD)
- `app/(dashboard)/posts/page.tsx` — posts table/list
- `components/shared/posts/columns.tsx` — table columns + actions
- `components/shared/posts/data-table.tsx` — table rendering + sorting/filtering/pagination
- `app/(dashboard)/posts/show/[id]/page.tsx` — post details view
- `app/(dashboard)/posts/create/page.tsx` — create post form
- `app/(dashboard)/posts/edit/[id]/page.tsx` — fetch post and render edit form
- `app/(dashboard)/posts/edit/[id]/edit-post-form.tsx` — edit form client component (referenced in codebase)

### Rich text
- `components/shared/posts/rich-text-editor.tsx`
  - Draft.js editor (react-draft-wysiwyg)
  - Stores content as Draft.js raw JSON string
- `components/shared/posts/rich-text-display.tsx`
  - Converts stored Draft.js JSON to HTML (draftjs-to-html)
  - Uses `dangerouslySetInnerHTML`

### Image uploads
- `hooks/use-file-upload.ts`
  - Drag/drop + preview + validation (mime types + max size)
- `components/shared/posts/gallery-upload.tsx`
  - Gallery uploader UI built on `useFileUpload`

## Environment variables needed
The project expects Supabase-related environment variables.

From `lib/supabase.ts` and `middleware.ts` / `app/actions/auth.ts`:
- `NEXT_PUBLIC_SUPABASE_URL` (string)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (string)

From Supabase SSR + server actions:
- (Implied by Supabase SSR usage) these values must be valid and allow both:
  - Auth session handling via cookies
  - DB CRUD access to the `posts` table and Storage bucket `project-images`

No other environment variables are referenced directly in the inspected source.

## Scripts
From `package.json`:
- `npm run dev` — run Next.js development server
- `npm run build` — build for production
- `npm run start` — start production server
- `npm run lint` — run ESLint

## How to run the project
1. Install dependencies:
   - `npm install`
2. Configure environment variables:
   - Create `.env.local` in the project root.
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Start dev server:
   - `npm run dev`
4. Open:
   - `http://localhost:3000`

Authentication is required to access dashboard routes; unauthenticated users are redirected to `/login` by `middleware.ts`.

