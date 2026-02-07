CREATE TABLE public.event_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  default_title text NOT NULL,
  default_description text,
  default_color text DEFAULT '#8B5CF6',
  default_duration_days integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Seed standard templates
INSERT INTO public.event_templates (name, default_title, default_color, default_duration_days) VALUES
  ('Gruppenstunde', 'Gruppenstunde', '#3B82F6', 1),
  ('Lager', 'Sommerlager', '#10B981', 7),
  ('Elternabend', 'Elternabend', '#F59E0B', 1),
  ('Leiterrunde', 'Leiterrunde', '#8B5CF6', 1),
  ('Aktion', 'Aktion', '#EF4444', 1);

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  all_day boolean DEFAULT true,
  color text DEFAULT '#10B981',
  notes text,
  template_id uuid REFERENCES public.event_templates(id),
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_end_date ON public.events(end_date);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.event_responsibles (
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, user_id)
);

-- RLS for all event tables
ALTER TABLE public.event_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read templates"
  ON public.event_templates FOR SELECT TO authenticated USING (true);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read events"
  ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update events"
  ON public.events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete events"
  ON public.events FOR DELETE TO authenticated USING (true);

ALTER TABLE public.event_responsibles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read event_responsibles"
  ON public.event_responsibles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create event_responsibles"
  ON public.event_responsibles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete event_responsibles"
  ON public.event_responsibles FOR DELETE TO authenticated USING (true);
