-- ============================================================
-- StudySwap Migration — run this in Supabase SQL Editor
-- ============================================================

-- ── New columns on forms ─────────────────────────────────────
ALTER TABLE forms ADD COLUMN IF NOT EXISTS sample_criteria JSONB DEFAULT '{}';

-- ── New columns on profiles (for "For You" matching) ─────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age       INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sex       TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country   TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role      TEXT DEFAULT '';

-- ── Referral fills (sharing earns 5 pts when recipient fills) ─
CREATE TABLE IF NOT EXISTS referral_fills (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_id  UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  form_id      UUID REFERENCES forms(id)    ON DELETE CASCADE NOT NULL,
  filled_by    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 5,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, form_id, filled_by)
);

ALTER TABLE referral_fills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ref_fills_select" ON referral_fills FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = filled_by);
CREATE POLICY "ref_fills_insert" ON referral_fills FOR INSERT WITH CHECK (auth.uid() = filled_by);

-- ── Rebuild forms_feed view (add sample_criteria, remove ORDER BY) ──
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
  p.institution AS submitter_institution,
  p.points      AS submitter_points
FROM forms f
JOIN profiles p ON p.id = f.user_id
WHERE f.is_active = true;

-- ── Updated fill_form RPC (now accepts optional referrer) ─────
CREATE OR REPLACE FUNCTION public.fill_form(
  form_id_input     UUID,
  referrer_id_input UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id    UUID := auth.uid();
  v_form_owner UUID;
  v_est_min    INTEGER;
  v_points     INTEGER;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT user_id, estimated_minutes INTO v_form_owner, v_est_min
  FROM forms WHERE id = form_id_input AND is_active = true;

  IF NOT FOUND THEN RAISE EXCEPTION 'Form not found'; END IF;
  IF v_form_owner = v_user_id THEN RAISE EXCEPTION 'Cannot fill your own form'; END IF;

  -- Points: 10 base + 2 per minute
  v_points := 10 + (v_est_min * 2);

  INSERT INTO fills (user_id, form_id) VALUES (v_user_id, form_id_input);
  UPDATE profiles SET points = points + v_points WHERE id = v_user_id;
  UPDATE forms    SET fill_count = fill_count + 1 WHERE id = form_id_input;

  -- Referral bonus (5 pts to sharer if different from filler and owner)
  IF referrer_id_input IS NOT NULL
     AND referrer_id_input != v_user_id
     AND referrer_id_input != v_form_owner THEN
    BEGIN
      INSERT INTO referral_fills (referrer_id, form_id, filled_by, points_awarded)
      VALUES (referrer_id_input, form_id_input, v_user_id, 5);
      UPDATE profiles SET points = points + 5 WHERE id = referrer_id_input;
    EXCEPTION WHEN unique_violation THEN NULL;
    END;
  END IF;

  RETURN jsonb_build_object('points_earned', v_points);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
