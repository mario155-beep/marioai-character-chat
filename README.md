# MarioAI Character Universe v4.1 — Button Fix

This build fixes the previous v4 UI event system. All controls use explicit JavaScript event listeners and buttons no longer depend on inline click handlers.

## Upload
Put `index.html` at the root of your GitHub Pages repository.

## Features
- Character creation and switching
- Local persistent character state
- Chat + Enter-to-send
- HP/damage/heal
- Bond/emotion state
- Manual long-term memory
- Cinematic scene UI
- AI configuration
- Supabase connection dialog
- Cloud character save/load
- Mobile responsive layout

## Important
For real online AI, use a secure Supabase Edge Function rather than exposing a provider secret in GitHub Pages.
