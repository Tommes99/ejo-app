CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  pinned boolean DEFAULT false,
  author_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read news"
  ON public.news FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create news"
  ON public.news FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update news"
  ON public.news FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete news"
  ON public.news FOR DELETE TO authenticated USING (true);
