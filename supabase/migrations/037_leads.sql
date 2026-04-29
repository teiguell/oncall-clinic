-- Round 22-7 (Q4-19) — B2B leads table for /pro + /clinica forms.
--
-- Backs:
--   POST /api/leads/pro    — doctor lead (full_name, email, phone,
--                            specialty, comib_number, message)
--   POST /api/leads/clinic — clinic lead (clinic_name, contact_name,
--                            email, phone, cif, city, doctors_count,
--                            message)
--
-- Single table with `type` discriminator + columns nullable per type.
-- Status tracks the funnel: new → contacted → qualified → converted /
-- rejected. Admin moves rows manually for now (post-alpha we'll wire
-- a CRM dashboard).
--
-- RLS: anon INSERT (forms are public), admin-only SELECT + UPDATE.

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('patient', 'doctor', 'clinic')),

  -- common
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,

  -- doctor specific
  comib_number TEXT,
  specialty TEXT,

  -- clinic specific
  clinic_name TEXT,
  contact_name TEXT,
  cif TEXT,
  city TEXT,
  doctors_count INTEGER,

  message TEXT,
  source_url TEXT,

  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'rejected')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  contacted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_leads_type_status ON public.leads (type, status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_insert_public" ON public.leads;
CREATE POLICY "leads_insert_public"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "leads_select_admin" ON public.leads;
CREATE POLICY "leads_select_admin"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "leads_update_admin" ON public.leads;
CREATE POLICY "leads_update_admin"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

COMMENT ON TABLE public.leads IS
  'B2B contact-form leads (Round 22-7 / Q4-19). Anonymous INSERT, admin-only SELECT + UPDATE.';
