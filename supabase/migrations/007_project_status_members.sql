-- Add status column to projects
ALTER TABLE public.projects
  ADD COLUMN status text DEFAULT 'in_bearbeitung' CHECK (status IN ('in_bearbeitung', 'archiviert'));

-- Project members junction table
CREATE TABLE public.project_members (
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read project members"
  ON public.project_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage project members"
  ON public.project_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can remove project members"
  ON public.project_members FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_project_members_project ON public.project_members(project_id);
CREATE INDEX idx_project_members_user ON public.project_members(user_id);
