DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admins') THEN
    CREATE TABLE public.admins (
      user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  END IF;
END
$$;

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User can view own admin record" ON public.admins;
CREATE POLICY "User can view own admin record" ON public.admins
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins: full visibility on events
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
CREATE POLICY "Admins can view all events" ON public.events
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

-- Admins: can update any event (approve/reject/edit)
DROP POLICY IF EXISTS "Admins can update any event" ON public.events;
CREATE POLICY "Admins can update any event" ON public.events
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

-- Admins: can delete any event
DROP POLICY IF EXISTS "Admins can delete any event" ON public.events;
CREATE POLICY "Admins can delete any event" ON public.events
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));