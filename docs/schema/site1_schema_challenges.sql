-- Challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  challenge_code character varying(8) NOT NULL UNIQUE,
  game_settings jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  CONSTRAINT challenges_pkey PRIMARY KEY (id)
);

-- Challenge results table
CREATE TABLE IF NOT EXISTS public.challenge_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL,
  player_name character varying(100) NOT NULL,
  score integer NOT NULL,
  accuracy numeric(5,2) NOT NULL,
  time_elapsed integer NOT NULL,
  total_attempts integer NOT NULL,
  longest_streak integer DEFAULT 0,
  fastest_guess character varying(20),
  game_stats jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT challenge_results_pkey PRIMARY KEY (id),
  CONSTRAINT challenge_results_challenge_id_fkey FOREIGN KEY (challenge_id) 
    REFERENCES public.challenges(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenges_code ON public.challenges(challenge_code);
CREATE INDEX IF NOT EXISTS idx_challenges_expires_at ON public.challenges(expires_at);
CREATE INDEX IF NOT EXISTS idx_challenge_results_challenge_id ON public.challenge_results(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_results_score ON public.challenge_results(challenge_id, score DESC);

-- Enable Row Level Security
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anonymous read/write access
CREATE POLICY "Allow anonymous read access to challenges" ON public.challenges
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access to challenges" ON public.challenges
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to challenges" ON public.challenges
  FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access to challenge_results" ON public.challenge_results
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access to challenge_results" ON public.challenge_results
  FOR INSERT WITH CHECK (true);

-- Admin policies (for authenticated admin users)
CREATE POLICY "Allow admin full access to challenges" ON public.challenges
  FOR ALL USING (auth.role() = 'admin');

CREATE POLICY "Allow admin full access to challenge_results" ON public.challenge_results
  FOR ALL USING (auth.role() = 'admin');

