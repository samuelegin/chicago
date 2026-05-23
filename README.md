# Chicago Web3 — Frontend

Neo-brutalist Web3 social platform built with Vite + React + Tailwind CSS.

## Setup

```bash
npm install
cp .env.example .env     # set VITE_API_BASE_URL
npm run dev              # http://localhost:5173
npm run build            # production build → dist/
npm run preview          # preview production build
```

## Environment Variables

```
VITE_API_BASE_URL=https://your-backend-url.com/api
```

All API calls require `VITE_API_BASE_URL` to be set. The app will throw a
configuration error if it is missing.

## Project Structure

```
src/
├── services/
│   └── api.js            ← API client — all endpoints, no mock fallbacks
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

## API Endpoints

| Method | Path                         | Used in          |
|--------|------------------------------|------------------|
| POST   | /auth/magic-link             | Login            |
| POST   | /auth/magic-link/verify      | AuthCallback     |
| GET    | /auth/me                     | AuthContext      |
| POST   | /auth/wallet/connect         | TopBar           |
| GET    | /feed/posts                  | Feed             |
| POST   | /feed/posts                  | Feed             |
| POST   | /posts/:id/like              | PostCard         |
| DELETE | /posts/:id/like              | PostCard         |
| GET    | /feed/trending               | Feed             |
| GET    | /feed/categories             | Feed             |
| GET    | /posts/:id/comments          | CommentsPage     |
| POST   | /posts/:id/comments          | CommentsPage     |
| GET    | /users/:id                   | UserProfile      |
| GET    | /users/suggestions           | Feed             |
| POST   | /users/:id/follow            | Feed             |
| DELETE | /users/:id/follow            | Feed             |
| PATCH  | /users/me                    | EditProfile      |
| GET    | /leaderboard?type=           | Leaderboard      |
| GET    | /leaderboard/me              | Leaderboard      |
| GET    | /staking/info                | Staking          |
| POST   | /staking/stake               | Staking          |
| POST   | /staking/unstake             | Staking          |
| POST   | /staking/claim-rewards       | Staking          |
| GET    | /marketplace/campaigns       | Marketplace      |
| GET    | /marketplace/pricing         | Marketplace      |
| POST   | /marketplace/campaigns       | Marketplace      |
| GET    | /network/stats               | Marketplace      |
| POST   | /admin/auth/login            | AdminLogin       |
| POST   | /admin/auth/verify-2fa       | AdminVerify      |

See `src/services/api.js` for full request/response contract.
See `API_CONTRACT.md` for detailed backend specification.
