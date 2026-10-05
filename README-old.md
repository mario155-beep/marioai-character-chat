# MarioAI Smart Character Universe — No npm

This version is designed for GitHub Pages. Upload `index.html`.

## What is improved

- Natural AI prompting designed to reduce repetitive replies
- Persistent character personality/backstory
- Long-term memories
- Emotion + relationship/bond
- HP, damage, healing and permanent death state
- Cinematic story mode
- Auto cinematic image generation after AI replies (when image API is configured)
- Animated cinematic image presentation (pan/zoom + particles)
- Character creator
- 10,000-character response architecture
- Optional online Supabase database
- Anonymous Supabase account per browser
- No Node, no npm, no terminal required for the frontend

## Online database

1. Create a Supabase project.
2. Enable Anonymous Sign-Ins.
3. Open SQL Editor.
4. Run `database.sql`.
5. Copy the Project URL and **Publishable Key** (not the secret key).
6. In the website, click **☁ Database** and paste those values.
7. The app saves character state/memory to `character_saves`.

Supabase publishable keys are intended for browser applications; RLS must protect the tables. Never put a Supabase secret key/service-role key in this website.

## AI and images

Click **⚙ AI** and enter an OpenAI-compatible API endpoint, chat model, image model and API key.

For OpenAI, current image models include GPT Image models. Image generation is a metered API capability, so "unlimited" cannot mean unlimited free generations.

IMPORTANT: because this is a GitHub Pages-only app, an AI provider secret entered in the browser is not truly secret. For a public production app, use a server/Edge Function proxy and keep the provider key there.

## GitHub Pages

Repository → Settings → Pages → Deploy from a branch → main → /(root) → Save.

The site should load `index.html` from the repository root.
