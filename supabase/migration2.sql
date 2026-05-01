-- ============================================================
-- StudySwap Migration 2 — usernames + follow system
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Username on profiles ─────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON profiles(lower(username));

-- ── Follows table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id  UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_select_all"  ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own"  ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own"  ON follows FOR DELETE USING (auth.uid() = follower_id);

-- ── Updated trigger: also stores username from metadata ───────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'username'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Rebuild forms_feed to include submitter_username ─────────
DROP VIEW IF EXISTS public.forms_feed;
CREATE OR REPLACE VIEW public.forms_feed AS
SELECT
  f.id,
  f.title,
  f.description,
  f.link,
  f.institution,
  f.specialty,
  f.estimated_minutes,
  f.fill_count,
  f.created_at,
  f.user_id,
  f.sample_criteria,
  p.name        AS submitter_name,
  p.username    AS submitter_username,
  p.institution AS submitter_institution,
  p.points      AS submitter_points
FROM forms f
JOIN profiles p ON p.id = f.user_id
WHERE f.is_active = true;
