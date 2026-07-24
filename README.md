# StudySphere v1 — AI Student OS

Premium MERN-stack learning platform. **v1 scope** (free APIs only):

- 🔐 Authentication — register/login, JWT access + refresh tokens (httpOnly cookies), forgot/reset password, email verification token, device login history
- 📊 Dashboard — streak, XP, level, motivation, quick actions
- 🤖 AI Tutor — persistent chat, Markdown + LaTeX rendering, code explanation, quiz/flashcard/roadmap generation (via **Groq free API**)
- 📝 Smart Notes — Markdown editor with live preview, folders/tags, AI summarize
- 🔎 Smart Search — combines AI explanation + Wikipedia + YouTube + your notes in one search
- 🧮 Calculator Hub — scientific calculator, unit converter, GPA calculator, percentage calculator (100% client-side)
- 📺 YouTube Hub — search + embedded player (via **YouTube Data API v3 free quota**)
- 👤 Profile — edit profile, view login/device history
- 🌗 Dark mode, responsive/mobile-first UI, Linear/Notion-inspired design

Deferred to v2/v3 per the original brief: PDF Assistant, dedicated Flashcards/Quiz UI, Study Planner, Assignment Helper, File Manager, Gamification/leaderboards, collaborative rooms, voice tutor, OCR, mobile app.

---

## 1. Get your free API keys

| Service | Used for | Get a key |
|---|---|---|
| MongoDB Atlas | Database (free M0 tier) | https://www.mongodb.com/cloud/atlas/register |
| Groq | AI Tutor / explanations (free tier, fast) | https://console.groq.com/keys |
| YouTube Data API v3 | Video search (free daily quota) | https://console.cloud.google.com/apis/library/youtube.googleapis.com |

Wikipedia's REST API needs no key.

## 2. Backend setup

```bash
cd backend
cp .env.example .env
# fill in MONGO_URI, JWT secrets, GROQ_API_KEY, YOUTUBE_API_KEY
npm install
npm run dev
```

Runs on `http://localhost:5000`. Health check: `GET /api/health`.

Generate strong JWT secrets, e.g.:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api` to the backend.

## 4. Build for production

```bash
cd frontend && npm run build
```
Deploy `frontend/dist` to Vercel, and `backend/` to Render/Railway with the same env vars (set `CLIENT_URL` to your deployed frontend URL and `NODE_ENV=production`).

## Project structure

```
studysphere/
├── backend/
│   ├── config/db.js
│   ├── models/          # User, Note, Chat, Message
│   ├── middleware/       # auth, error handling
│   ├── controllers/      # auth, users, notes, ai, youtube, search
│   ├── routes/
│   ├── utils/
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js          # auto refresh-token interceptor
        ├── store/authStore.js    # zustand auth state
        ├── components/           # Sidebar, Navbar, AppLayout, ProtectedRoute
        └── pages/                 # Login, Register, Dashboard, AITutor, Notes,
                                    # SmartSearch, CalculatorHub, YoutubeHub, Profile
```

## Notes on the free-tier scope

- **Email sending isn't wired up** (no free SMTP configured) — `forgot-password` returns a dev-mode reset token directly in the response instead of emailing it, so the flow is fully testable. Swap in a provider like Resend/Brevo free tier for production.
- **AI provider** defaults to Groq (OpenAI-compatible endpoint) — swap the URL/headers in `backend/controllers/aiController.js` to use OpenAI or Gemini instead if you have those keys.
- Rate limiting is applied on auth and AI routes to protect your free API quotas.

Enjoy building on top of this — v2 (PDF Assistant, Flashcards, Quiz Generator, Study Planner, Analytics) and v3 (Gamification, collaboration, voice tutor) can be layered on the same architecture.
