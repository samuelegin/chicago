# Chicago Web3 — Frontend

Neo-brutalist Web3 social platform built with Vite + React + Tailwind CSS.

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build
```

## Project Structure

```
src/
├── data/
│   └── mockData.js       ← ALL hardcoded content lives here
├── services/
│   └── api.js            ← Ready-made API client (all endpoints documented)
├── components/
│   ├── Layout.jsx         ← TopBar, LeftSidebar, BottomNav, RightSidebar, Icon
│   └── PostCard.jsx       ← Reusable post card
├── pages/
│   ├── Feed.jsx
│   ├── Leaderboard.jsx
│   ├── Staking.jsx
│   ├── Marketplace.jsx
│   ├── Profile.jsx
│   └── EditProfile.jsx
├── App.jsx                ← Router
├── main.jsx
└── index.css
```

## Connecting the Backend

1. Copy `.env.example` → `.env` and set `VITE_API_BASE_URL`
2. In each page, replace the mock import with an `api.*` call — every page
   has a `// BACKEND:` comment showing exactly what to swap
3. Delete `src/data/mockData.js`

### API Endpoints Summary

| Method | Path                         | Used in          |
|--------|------------------------------|------------------|
| GET    | /auth/me                     | App.jsx          |
| POST   | /auth/wallet/connect         | TopBar           |
| GET    | /feed/posts                  | Feed             |
| POST   | /feed/posts                  | Feed             |
| POST   | /posts/:id/like              | PostCard         |
| GET    | /feed/trending               | RightSidebar     |
| GET    | /feed/categories             | Feed             |
| GET    | /posts/:id/comments          | (future)         |
| POST   | /posts/:id/comments          | (future)         |
| GET    | /users/suggestions           | RightSidebar     |
| POST   | /users/:id/follow            | RightSidebar     |
| PATCH  | /users/me                    | EditProfile      |
| GET    | /leaderboard                 | Leaderboard      |
| GET    | /leaderboard/me              | Leaderboard      |
| GET    | /staking/info                | Staking          |
| POST   | /staking/stake               | Staking          |
| GET    | /marketplace/campaigns       | Marketplace      |
| GET    | /marketplace/pricing         | Marketplace      |
| POST   | /marketplace/campaigns       | Marketplace      |
| GET    | /network/stats               | Marketplace      |

See `src/services/api.js` for full request/response shapes.
