DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_category') THEN
    CREATE TYPE public.event_category AS ENUM ('Food','Music','Arts','Sports','Family');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
    CREATE TYPE public.event_status AS ENUM ('pending','approved','rejected');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category public.event_category NOT NULL,
  start timestamptz NOT NULL,
  "end" timestamptz NULL,
  address text NOT NULL,
  price text NOT NULL,
  website text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  status public.event_status NOT NULL DEFAULT 'pending',
  organizer_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_start ON public.events(start);
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_unique_key ON public.events (title, start, address);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved events" ON public.events;
CREATE POLICY "Public can view approved events" ON public.events
  FOR SELECT
  USING (status = 'approved');

DROP POLICY IF EXISTS "Authenticated users can submit events" ON public.events;
CREATE POLICY "Authenticated users can submit events" ON public.events
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND (organizer_id IS NULL OR organizer_id = auth.uid()));

DROP POLICY IF EXISTS "Organizers can view their own submissions" ON public.events;
CREATE POLICY "Organizers can view their own submissions" ON public.events
  FOR SELECT
  USING (organizer_id = auth.uid());