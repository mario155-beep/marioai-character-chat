# MarioAI Character Chat

GitHub-ready AI character chat starter with:

- Character creator
- Persistent browser saves
- Long-term memory notes
- Emotion + relationship system
- HP / damage / healing / death
- Cinematic event mode
- Image-generation endpoint hook
- Up to 10,000-character AI reply limit
- Mature-theme level selector (content boundaries still apply)
- Mobile responsive UI
- Local demo mode when no API key is configured

## Quick start

### 1. Install

```bash
npm install
```

### 2. Run

```bash
npm run dev
```

Open `http://localhost:3000`.

### 3. Online AI

Create `.env` from `.env.example`.

The server uses an OpenAI-compatible HTTP endpoint. Configure:

```env
AI_API_KEY=your_key
AI_BASE_URL=https://your-provider.example/v1
AI_CHAT_MODEL=your-chat-model
AI_IMAGE_MODEL=your-image-model
```

Do NOT put the API key in frontend JavaScript or commit `.env`.

### 4. GitHub

Push this repository to GitHub. For the online backend, deploy the same project to a serverless Node host that supports `/api/*` routes. GitHub Pages alone cannot safely run the private AI API key.

## Notes

"Unlimited" is implemented as persistent local/server-ready memory and does not bypass provider rate limits, usage limits, or billing.

The maturity selector changes storytelling tone only. It does not disable platform/provider safety requirements.


## GitHub Pages note

GitHub Pages is for the static frontend. It cannot securely store `AI_API_KEY`.
For a real online AI version, deploy the Node server (`server.js` + `/api`) to a serverless/Node host and set your secrets there. Then point the frontend API calls to that backend URL.

If you only upload this package to GitHub Pages, the UI can be used as a static prototype, but `/api/chat` and `/api/image` will not run on GitHub Pages.

## Safety / maturity

The maturity selector controls the storytelling tone. It is not a mechanism to bypass model/provider safety policies or generate prohibited sexual content.
