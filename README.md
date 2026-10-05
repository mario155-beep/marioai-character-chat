# MarioAI Character Universe v4 — Smart AI Edition

A GitHub Pages-friendly AI character platform with no npm/Node requirement for the frontend.

## What v4 adds

- Natural character chat with persistent persona/context
- Durable character saves in Supabase
- Cloud memory sync + remote character loading
- HP, bond, emotion and alive/dead state
- Long-term memory extraction and manual memory
- Character creator with personality/backstory/genre/maturity
- Cinematic scene mode
- AI image generation hook
- Auto-scene mode
- Responsive Android/mobile UI
- PWA-ready frontend structure
- Secure Supabase Edge Function AI proxy
- Provider key stays server-side instead of GitHub Pages
- Direct API mode remains available for testing only

## 1. GitHub Pages

Upload/replace `index.html` in the root of your repository.

GitHub → Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.

## 2. Supabase database

Open your Supabase project → SQL Editor → paste `database.sql` → Run.

Anonymous Auth must be enabled because the frontend uses anonymous sessions for a simple account without requiring email.

## 3. Supabase URL + Publishable Key

In Supabase Dashboard, use Project Settings → API Keys. Copy the Project URL and Publishable Key. The publishable key is intended for browser/client code when Row Level Security is configured correctly. Never put a Secret Key in `index.html`.

Enter those two values under **Database** in MarioAI.

## 4. Secure AI backend — recommended

In Supabase Dashboard:

1. Open **Edge Functions**.
2. Choose **Deploy a new function → Via Editor**.
3. Create a function named `mario-ai`.
4. Replace the editor code with `supabase/functions/mario-ai/index.ts`.
5. Deploy the function.
6. Open the function's Secrets / Environment Variables.
7. Add:

`AI_PROVIDER_KEY` = your AI provider secret key

Optional:

`AI_BASE_URL` = `https://api.openai.com/v1`
`AI_MODEL` = your selected chat model

The secret belongs in Supabase, not GitHub. Supabase documents production Edge Function secrets in the Dashboard and exposes them to the function runtime through environment variables.

Your function URL will look like:

`https://YOUR_PROJECT_ID.supabase.co/functions/v1/mario-ai`

Put that URL in MarioAI → **AI Settings → Secure Edge Function URL**.

Leave the browser API-key field empty when using the secure function.

## 5. Why the secure function is important

A GitHub Pages site is public. Any provider key placed in frontend JavaScript can be inspected by users. The Edge Function keeps the provider secret server-side and lets Supabase authenticate the caller.

## 6. Image generation

The frontend includes a configurable image-generation hook. Set your image model/provider according to the provider you actually use. Image/video providers have their own billing and usage limits; “unlimited” in the UI cannot mean unlimited provider usage.

## 7. Important limits

This project can keep a large persistent memory record in Supabase, but an AI model still has a finite context window. MarioAI therefore sends recent conversation plus durable memory instead of pretending the model has literally infinite context.

True generated video/character motion requires a video/animation provider. The built-in cinematic layer provides animated presentation effects; it is not falsely presented as AI-generated video.

## 8. Security

- Browser: Publishable key only.
- Server/Edge Function: Secret provider key.
- Keep RLS enabled.
- Do not commit `.env` files or secret keys.
