# MarioAI Character Universe

A deployable AI character chat app built with a Node.js + Express backend and a static frontend.

## Features
- Character creation and switching
- Local persistence in browser storage
- Cinematic story prompts
- Memory support
- Optional AI chat and image generation via server environment variables
- Ready for deployment on Render, Railway, or any Node host

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open the app at:
   ```bash
   http://localhost:3000
   ```

## Deploy to Render or Railway

- Push this repo to GitHub
- Connect the repo to Render or Railway
- Set the start command to:
  ```bash
  npm start
  ```
- Add environment variables:
  ```bash
  AI_API_KEY=
  AI_BASE_URL=https://api.openai.com/v1
  AI_CHAT_MODEL=
  AI_IMAGE_MODEL=
  PORT=3000
  ```

If AI keys are not configured, the app runs in demo mode and returns a simulated character reply.
