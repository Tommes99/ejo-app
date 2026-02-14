-- Abstimmungen (Polls) Module

CREATE TABLE public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  poll_type text NOT NULL CHECK (poll_type IN ('date_poll', 'decision_poll')),
  status text NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'geschlossen', 'archiviert')),
  deadline timestamptz,
  allow_vote_change boolean DEFAULT true,
  show_results_before_voting boolean DEFAULT true,
  linked_event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_polls_status ON public.polls(status);
CREATE INDEX idx_polls_created_by ON public.polls(created_by);
CREATE INDEX idx_polls_linked_event_id ON public.polls(linked_event_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.polls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE,
  label text NOT NULL,
  option_date date,
  option_time_start time,
  option_time_end time,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_poll_options_poll_id ON public.poll_options(poll_id);

CREATE TABLE public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id uuid REFERENCES public.poll_options(id) ON DELETE CASCADE,
  voter_user_id uuid REFERENCES public.profiles(id),
  display_name text NOT NULL,
  vote text NOT NULL CHECK (vote IN ('yes', 'no', 'maybe')),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, option_id, voter_user_id)
);

CREATE INDEX idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX idx_poll_votes_voter ON public.poll_votes(voter_user_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.poll_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.poll_participants (
  poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (poll_id, user_id)
);

-- RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read polls"
  ON public.polls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create polls"
  ON public.polls FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update polls"
  ON public.polls FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete polls"
  ON public.polls FOR DELETE TO authenticated USING (true);

ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read poll_options"
  ON public.poll_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create poll_options"
  ON public.poll_options FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update poll_options"
  ON public.poll_options FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete poll_options"
  ON public.poll_options FOR DELETE TO authenticated USING (true);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read poll_votes"
  ON public.poll_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create poll_votes"
  ON public.poll_votes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update poll_votes"
  ON public.poll_votes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete poll_votes"
  ON public.poll_votes FOR DELETE TO authenticated USING (true);

ALTER TABLE public.poll_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read poll_participants"
  ON public.poll_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create poll_participants"
  ON public.poll_participants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete poll_participants"
  ON public.poll_participants FOR DELETE TO authenticated USING (true);
