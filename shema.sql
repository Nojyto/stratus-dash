-- This script sets up the entire database schema for Stratus Dash.
-- Run this in your Supabase SQL Editor.

-- 1. USER SETTINGS TABLE
-- Stores user-specific preferences for the New Tab page.
CREATE TABLE
  public.user_settings (
    user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    updated_at timestamp with time zone,
    default_search_engine text DEFAULT 'google'::text,
    wallpaper_url text,
    wallpaper_artist text,
    wallpaper_photo_url text,
    wallpaper_mode text DEFAULT 'image'::text,
    wallpaper_query text DEFAULT 'nature landscape wallpaper'::text,
    gradient_from text DEFAULT '220 70% 50%'::text,
    gradient_to text DEFAULT '280 65% 60%'::text,
    weather_lat double precision,
    weather_lon double precision,
    news_country text DEFAULT 'us'::text,
    news_category text[] DEFAULT ARRAY['general'::text],
    tracked_stocks text[] DEFAULT ARRAY['SPY'::text]
  );

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see and update their own settings.
CREATE POLICY "Users can view and update their own settings" ON public.user_settings FOR ALL
USING (auth.uid () = user_id)
WITH CHECK (auth.uid () = user_id);

-- 2. QUICK LINKS TABLE
-- Stores the quick links for the New Tab page.
CREATE TABLE
  public.quick_links (
    id uuid NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    title text,
    url text NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
  );

-- Enable RLS
ALTER TABLE public.quick_links ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own quick links.
CREATE POLICY "Users can manage their own quick links" ON public.quick_links FOR ALL
USING (auth.uid () = user_id)
WITH CHECK (auth.uid () = user_id);

-- 3. GENERAL TODOS TABLE
-- Stores the "General Todos" for the New Tab page.
CREATE TABLE
  public.general_todos (
    id uuid NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    task text NOT NULL,
    link text,
    is_completed boolean DEFAULT FALSE,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
  );

-- Enable RLS
ALTER TABLE public.general_todos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own general todos.
CREATE POLICY "Users can manage their own general todos" ON public.general_todos FOR ALL
USING (auth.uid () = user_id)
WITH CHECK (auth.uid () = user_id);

-- 4. DAILY TASKS TABLE
-- Stores the task templates for the "Daily Tasks" list.
CREATE TABLE
  public.daily_tasks (
    id uuid NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    task text NOT NULL,
    link text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
  );

-- Enable RLS
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own daily tasks.
CREATE POLICY "Users can manage their own daily tasks" ON public.daily_tasks FOR ALL
USING (auth.uid () = user_id)
WITH CHECK (auth.uid () = user_id);

-- 5. DAILY TASK COMPLETIONS TABLE
-- Stores which daily tasks have been completed on which day.
CREATE TABLE
  public.daily_task_completions (
    id uuid NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
    task_id uuid NOT NULL REFERENCES public.daily_tasks (id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    completed_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT daily_task_completions_task_id_user_id_completed_date_key UNIQUE (task_id, user_id, completed_date)
  );

-- Enable RLS
ALTER TABLE public.daily_task_completions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own task completions.
CREATE POLICY "Users can manage their own task completions" ON public.daily_task_completions FOR ALL
USING (auth.uid () = user_id)
WITH CHECK (auth.uid () = user_id);

-- 6. FOLDERS TABLE
-- Stores folders for the notes dashboard.
CREATE TABLE
  public.folders (
    id uuid NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
    name text NOT NULL,
    parent_id uuid REFERENCES public.folders (id) ON DELETE CASCADE, -- Self-referencing
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now()
  );

-- Enable RLS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own folders.
CREATE POLICY "Users can manage their own folders" ON public.folders FOR ALL
USING (auth.uid () = user_id)
WITH CHECK (auth.uid () = user_id);

-- 7. NOTES TABLE
-- Stores notes for the notes dashboard.
CREATE TABLE
  public.notes (
    id uuid NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
    title text NOT NULL,
    content text,
    folder_id uuid REFERENCES public.folders (id) ON DELETE SET NULL, -- Set to NULL if folder is deleted
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now()
  );

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own notes.
CREATE POLICY "Users can manage their own notes" ON public.notes FOR ALL
USING (auth.uid () = user_id)
WITH CHECK (auth.uid () = user_id);
