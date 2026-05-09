
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  language TEXT NOT NULL DEFAULT 'es',
  theme TEXT NOT NULL DEFAULT 'light',
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  streak INT NOT NULL DEFAULT 0,
  hearts INT NOT NULL DEFAULT 5,
  gems INT NOT NULL DEFAULT 0,
  difficulty_tier TEXT NOT NULL DEFAULT 'beginner', -- beginner|intermediate|advanced|scholar
  knowledge_score INT NOT NULL DEFAULT 0, -- 0-100 from initial assessment
  onboarded BOOLEAN NOT NULL DEFAULT false,
  assessment_completed BOOLEAN NOT NULL DEFAULT false,
  goal TEXT,
  daily_minutes INT DEFAULT 10,
  topics TEXT[] DEFAULT '{}',
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Activities log (every action: lesson_done, quiz_done, verse_saved, ai_chat, etc.)
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  xp_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own activity read" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own activity insert" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX activities_user_date ON public.activities(user_id, created_at DESC);

-- Lesson progress
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress|completed
  score INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lp read" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own lp write" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own lp update" ON public.lesson_progress FOR UPDATE USING (auth.uid() = user_id);

-- Saved verses
CREATE TABLE public.saved_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  reference TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_verses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sv read" ON public.saved_verses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own sv write" ON public.saved_verses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sv delete" ON public.saved_verses FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
