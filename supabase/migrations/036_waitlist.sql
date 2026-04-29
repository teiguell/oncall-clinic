-- Round 23-4 (Q5-6) — pre-launch / blog / city-interest waitlist.
--
-- Single table backing the WaitlistForm component. We segment by
-- `source` so the announcement campaign can target only the relevant
-- cohorts (e.g. "blog stub" vs "home hero" vs "pre-launch").
--
-- Idempotent: ON CONFLICT (email) DO NOTHING in the API endpoint so
-- repeat submissions don't error and don't overwrite the original
-- source/timestamp.
--
-- RLS: public can INSERT (anonymous form), only admin can SELECT.
-- No UPDATE / DELETE policy = no one can mutate or remove rows
-- through the API surface (admin will use service-role for cleanup
-- if needed).

CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT,                 -- 'blog_stub', 'home_hero', 'pre_launch', etc.
  locale TEXT DEFAULT 'es',    -- 'es' | 'en' (kept short, no FK)
  city_interest TEXT,          -- optional city slug from lib/cities.ts
  metadata JSONB,              -- room for UTM tags, referrer, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist (email);
CREATE INDEX IF NOT EXISTS idx_waitlist_source ON public.waitlist (source);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist (created_at DESC);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Public INSERT — the form is unauthenticated.
DROP POLICY IF EXISTS "waitlist_insert_public" ON public.waitlist;
CREATE POLICY "waitlist_insert_public"
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin-only SELECT.
DROP POLICY IF EXISTS "waitlist_select_admin" ON public.waitlist;
CREATE POLICY "waitlist_select_admin"
  ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

COMMENT ON TABLE public.waitlist IS
  'Pre-launch / blog / city-interest waitlist (Round 23-4 / Q5-6). Anonymous INSERT, admin-only SELECT.';
