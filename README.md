# Chicago Web3 — Frontend

Neo-brutalist Web3 social platform. Vite + React + Tailwind CSS.

## Setup

```bash
npm install
cp .env.example .env     # add VITE_API_BASE_URL
npm run dev              # localhost:5173
npm run build            # → dist/
npm run preview          # preview prod build
```

## Env

```
VITE_API_BASE_URL=https://your-api-url.com/api
```

Required. The app throws on load if it's missing.

## Stack

- **Vite** + **React 18**
- **Tailwind CSS** — custom neo-brutalist design tokens in `tailwind.config.js`
- **React Router v6**
- **ethers.js** — wallet connection
- No UI library, no state management library

## Project structure

```
src/
├── services/
│   └── api.js              ← every API call lives here, grouped by domain
├── context/
│   ├── AuthContext.jsx     ← session, login/logout, current user
│   └── ThemeContext.jsx    ← light/dark toggle
├── components/
│   ├── Layout.jsx          ← TopBar, LeftSidebar, BottomNav, RightSidebar, Icon
│   └── PostCard.jsx
├── pages/
│   ├── Feed.jsx
│   ├── Leaderboard.jsx
│   ├── Staking.jsx
│   ├── Marketplace.jsx
│   ├── Profile.jsx
│   ├── EditProfile.jsx
│   ├── UserProfile.jsx
│   ├── CommentsPage.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── CheckEmail.jsx
│   ├── AuthCallback.jsx
│   └── admin/
│       ├── AdminLogin.jsx
│       ├── AdminVerify.jsx
│       ├── AdminSetup.jsx
│       ├── AdminRegister.jsx
│       ├── AdminDashboard.jsx
│       └── AdminShared.jsx
├── App.jsx                 ← routes
└── main.jsx
```

## API

Everything goes through `src/services/api.js`. Two internal helpers:

- `request(path, options)` — user-facing routes, attaches `Authorization: Bearer` from `localStorage`
- `adminRequest(path, options)` — admin routes, sends `credentials: 'include'` for the HttpOnly session cookie + `tempToken` from `sessionStorage` during the 2FA step

Full endpoint reference: **`API_CONTRACT.md`**

## Admin portal

Path: `/portal-ax92-v1` — not linked anywhere in the public UI.

Login flow: email/password → 2FA code → HttpOnly session cookie → dashboard.

Invite flow: super admin generates a one-time token link → invitee registers via `/portal-ax92-v1/register?token=`.

Bootstrap (one-time): super admin must be seeded via CLI/migration on the backend. There's no public setup UI in production.

## Notes for the backend dev

- All endpoints and expected request/response shapes are in `API_CONTRACT.md`
- The frontend has no mock fallbacks — everything throws if the API is down or `VITE_API_BASE_URL` isn't set
- Admin routes need `credentials: 'include'` support (CORS `allowCredentials: true`, explicit origin — no wildcard)
- GIF search isn't wired yet — placeholder is in `Feed.jsx → GifKeyboard`. Expecting `GET /gifs/search?q=&category=` returning `{ gifs: [{ id, url, preview }] }`
