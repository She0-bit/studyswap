# StudySwap — Setup Guide

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Choose a name (e.g. `studyswap`) and a strong database password
3. Wait ~2 min for the project to spin up

## 2. Run the database schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**

This creates: `profiles`, `forms`, `fills` tables + RLS policies + the `fill_form` RPC function + the `forms_feed` view.

## 3. Configure environment variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then fill in your values from Supabase → **Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## 4. Enable email auth

In Supabase → **Authentication → Providers**, make sure **Email** is enabled.

For local dev you can also turn off email confirmation:
- Go to **Authentication → Email Templates → Confirm signup**
- Or go to **Auth → Settings → Disable email confirmations** (dev only)

## 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 6. Deploy to Vercel (optional)

```bash
npx vercel --prod
```

Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in the Vercel dashboard.

---

## How the points system works

| Action | Points earned |
|---|---|
| Fill a 5-min form | +20 pts |
| Fill a 10-min form | +30 pts |
| Fill a 15-min form | +40 pts |

**Formula:** `10 + (estimated_minutes × 2)`

Your form's position in the feed = sorted by your total points (descending).

## Anti-abuse

- **Timer gate**: the "Claim points" button only activates after you've had the form open for at least as long as the estimated completion time (capped at 5 min).
- **Unique constraint**: you can only fill each form once.
- **Can't fill your own form**: enforced server-side in the `fill_form` RPC.
