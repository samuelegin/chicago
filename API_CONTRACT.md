# Chicago Web3 — API Contract

> **For the backend developer.**
> Every endpoint the frontend calls is listed here, grouped by domain.
> All routes are prefixed with `/api` (configured via `VITE_API_BASE_URL` in `.env`).
> All request/response bodies are JSON unless noted.
> All protected routes require a valid session token in the `Authorization` header:
> `Authorization: Bearer <token>`

---

## Table of Contents

1. [Auth — User](#1-auth--user)
2. [Auth — Admin](#2-auth--admin)
3. [Feed & Posts](#3-feed--posts)
4. [Comments & Replies](#4-comments--replies)
5. [Users & Profiles](#5-users--profiles)
6. [Leaderboard](#6-leaderboard)
7. [Staking](#7-staking)
8. [Marketplace](#8-marketplace)
9. [Network](#9-network)
10. [Shared Conventions](#10-shared-conventions)

---

## 1. Auth — User

### `POST /auth/magic-link`
Sends a magic-link email to the given address. If the email doesn't exist, a new account is created on first verify.

**Called from:** `src/context/AuthContext.jsx → sendMagicLink()`

**Request body:**
```json
{ "email": "user@example.com" }
```

**Response:**
```json
{ "ok": true }
```

**Errors:**
| Status | Meaning |
|--------|---------|
| 400 | Invalid or missing email |
| 429 | Rate limited (too many magic link requests) |

---

### `GET /auth/verify?token=TOKEN`
Verifies a magic-link token and returns a session. The frontend redirects here from the email link.

**Called from:** `src/pages/CheckEmail.jsx` (resend flow) / email deep-link

**Query params:** `token` — the one-time token embedded in the magic link email

**Response:**
```json
{
  "token": "session_jwt_here",
  "user": {
    "id": "u_001",
    "email": "user@example.com",
    "name": "Jordan Neo",
    "handle": "@jordan_neo.eth",
    "avatar": "https://...",
    "role": "user"
  }
}
```

**Errors:**
| Status | Meaning |
|--------|---------|
| 400 | Token missing or malformed |
| 401 | Token invalid or already used |
| 410 | Token expired |

---

### `POST /auth/magic-link/resend`
Resends the magic-link to the same email. Enforces a 60-second cooldown server-side.

**Called from:** `src/pages/CheckEmail.jsx → handleResend()`

**Request body:**
```json
{ "email": "user@example.com" }
```

**Response:**
```json
{ "ok": true }
```

---

### `POST /auth/register`
Registers a new user account (username/password flow, separate from magic-link).

**Called from:** `src/pages/Register.jsx → handleStep1()`

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword1!",
  "username": "jordan_neo",
  "displayName": "Jordan Neo",
  "bio": "Optional bio text"
}
```

**Response:**
```json
{
  "token": "session_jwt_here",
  "user": {
    "id": "u_001",
    "email": "user@example.com",
    "name": "Jordan Neo",
    "handle": "@jordan_neo.eth",
    "avatar": null,
    "role": "user"
  }
}
```

**Errors:**
| Status | Meaning |
|--------|---------|
| 400 | Validation failed (weak password, missing fields) |
| 409 | Email or username already taken |

---

### `GET /auth/me`
Returns the currently authenticated user's full profile.

**Called from:** `src/services/api.js → getCurrentUser()`

**Auth required:** Yes

**Response:**
```json
{
  "id": "u_001",
  "email": "user@example.com",
  "name": "Jordan Neo",
  "handle": "@jordan_neo.eth",
  "avatar": "https://...",
  "bio": "...",
  "website": "jordanneo.eth",
  "twitter": "@jordan_neo",
  "farcaster": "@jordan.fc",
  "posts": 1284,
  "followers": 8500,
  "following": 492,
  "cltHeld": 15000,
  "cltStaked": 5000,
  "walletConnected": false,
  "walletAddress": null,
  "role": "user"
}
```

---

### `POST /auth/wallet/connect`
Links a Web3 wallet address to the current user's account.

**Called from:** `src/services/api.js → connectWallet()`

**Auth required:** Yes

**Request body:**
```json
{ "address": "0xABC123..." }
```

**Response:**
```json
{ "ok": true, "walletAddress": "0xABC123..." }
```

---

## 2. Auth — Admin

> All admin routes are under `/api/admin/auth`.
> The admin portal lives at the obscure path `/portal-ax92-v1` (not linked in user-facing UI).

---

### `GET /admin/auth/validate-setup-token?token=TOKEN`
Validates the one-time server-generated bootstrap token. Only valid if **no admin accounts exist** in the database. Once used (or if an admin already exists), this endpoint returns `{ valid: false }` for all future requests.

**Called from:** `src/pages/admin/AdminSetup.jsx → useEffect on mount`

**Query params:** `token` — the setup token printed to server logs on first boot

**Response (valid):**
```json
{ "valid": true }
```

**Response (invalid / already used / admin exists):**
```json
{ "valid": false }
```

---

### `POST /admin/auth/setup`
Creates the first super admin account. **Permanently destroys the setup token and disables this endpoint** after one successful call. If an admin already exists, this returns 409.

**Called from:** `src/pages/admin/AdminSetup.jsx → handleSubmit()`

**Request body:**
```json
{
  "token": "SETUP_TOKEN_HERE",
  "email": "superadmin@chicago.io",
  "name": "Jane Smith",
  "password": "SuperSecure1!"
}
```

**Response:**
```json
{ "success": true }
```

**Errors:**
| Status | Meaning |
|--------|---------|
| 400 | Missing/invalid fields or weak password |
| 401 | Invalid or expired setup token |
| 409 | An admin account already exists |

---

### `POST /admin/auth/login`
Authenticates an admin with email + password. On success, issues a short-lived temporary token and triggers a 2FA code to the admin's authenticator app / email.

**Called from:** `src/pages/admin/AdminLogin.jsx → handleSubmit()`

**Request body:**
```json
{
  "email": "admin@chicago.io",
  "password": "AdminPassword1!"
}
```

**Response:**
```json
{
  "tempToken": "short_lived_jwt",
  "adminId": "a_001",
  "twoFactorMethod": "totp"
}
```

> The `tempToken` is stored in `sessionStorage` on the client and sent in the Authorization header for the 2FA verify step.

**Errors:**
| Status | Meaning |
|--------|---------|
| 401 | Invalid email or password |
| 429 | Too many failed attempts — account temporarily locked |

---

### `POST /admin/auth/verify-2fa`
Verifies the 6-digit TOTP code entered by the admin. On success, issues a full admin session token as an `HttpOnly` cookie.

**Called from:** `src/pages/admin/AdminVerify.jsx → handleSubmit()`

**Auth required:** `tempToken` from login step (Bearer header)

**Request body:**
```json
{ "code": "123456" }
```

**Response:**
```json
{ "sessionToken": "admin_session_jwt" }
```

> **Note:** Set the session as an `HttpOnly; Secure; SameSite=Strict` cookie server-side. Max-Age should match your session timeout (default frontend idle timeout: 14 minutes).

**Errors:**
| Status | Meaning |
|--------|---------|
| 401 | Invalid or expired 2FA code |
| 400 | Code format invalid |

---

### `POST /admin/auth/resend-2fa`
Resends the 2FA code. Enforces a 60-second cooldown server-side.

**Called from:** `src/pages/admin/AdminVerify.jsx → handleResend()`

**Auth required:** `tempToken` from login step (Bearer header)

**Request body:** _(none)_

**Response:**
```json
{ "ok": true }
```

---

### `GET /admin/auth/validate-invite?token=TOKEN`
Validates an admin invite token before showing the registration form.

**Called from:** `src/pages/admin/AdminRegister.jsx → useEffect on mount`

**Query params:** `token` — the invite token from the email link

**Response (valid):**
```json
{
  "valid": true,
  "email": "invited@chicago.io",
  "expiresAt": "2025-01-15T12:00:00Z"
}
```

**Response (invalid / expired):**
```json
{ "valid": false }
```

---

### `POST /admin/auth/invite`
Sends an admin invite email with a one-time registration link. Only callable by a super admin. Tokens expire after 24 hours.

**Called from:** `src/pages/admin/AdminDashboard.jsx → InviteModal → send()`

**Auth required:** Yes (super admin session)

**Request body:**
```json
{ "email": "newadmin@chicago.io" }
```

**Response:**
```json
{ "ok": true, "expiresAt": "2025-01-15T12:00:00Z" }
```

**Errors:**
| Status | Meaning |
|--------|---------|
| 400 | Invalid email |
| 403 | Caller is not a super admin |
| 409 | An active invite for this email already exists |

---

### `POST /admin/auth/register`
Completes an invited admin's account setup. Permanently destroys the invite token on success.

**Called from:** `src/pages/admin/AdminRegister.jsx → handleSubmit()`

**Request body:**
```json
{
  "token": "INVITE_TOKEN_HERE",
  "name": "New Admin",
  "password": "SecureAdminPass1!"
}
```

**Response:**
```json
{ "success": true }
```

**Errors:**
| Status | Meaning |
|--------|---------|
| 400 | Missing/invalid fields or weak password |
| 401 | Invalid or expired invite token |

---

## 3. Feed & Posts

### `GET /feed/posts?filter=general&page=1`
Returns paginated feed posts. `filter` maps to a category slug or `general` for all.

**Called from:** `src/services/api.js → getFeedPosts()` / `src/pages/Feed.jsx`

**Auth required:** Yes

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `filter` | string | `general` | Category slug or `general` |
| `page` | number | `1` | Page number |

**Response:**
```json
{
  "posts": [
    {
      "id": "p_001",
      "author": {
        "id": "u_002",
        "name": "DevZero",
        "handle": "@zero_layer.eth",
        "avatar": "https://..."
      },
      "content": "Post text here",
      "images": ["https://..."],
      "poll": null,
      "likes": 1200,
      "comments": 84,
      "shares": 32,
      "trending": true,
      "category": "DevLog",
      "timestamp": "2h ago",
      "liked": false,
      "comments_data": []
    }
  ],
  "hasMore": true,
  "page": 1
}
```

---

### `GET /feed/categories`
Returns all available feed filter categories.

**Called from:** `src/services/api.js → getFeedCategories()`

**Auth required:** Yes

**Response:**
```json
{
  "categories": [
    { "id": "general", "label": "General" },
    { "id": "devlog",  "label": "DevLog" },
    { "id": "meme",    "label": "Meme" }
  ]
}
```

---

### `POST /feed/posts`
Creates a new post.

**Called from:** `src/services/api.js → createPost()` / `src/pages/Feed.jsx → handlePost()`

**Auth required:** Yes

**Request body:**
```json
{
  "content": "Post text",
  "images": ["https://...", "data:image/..."],
  "category": "General",
  "poll": {
    "question": "Which chain?",
    "options": ["Ethereum", "Solana"],
    "duration": "1 day"
  }
}
```

> `poll` is optional. `images` accepts URLs or base64 data URIs.

**Response:** The created post object (same shape as feed post above).

---

### `POST /posts/:postId/like`
Likes a post.

**Called from:** `src/services/api.js → likePost()`

**Auth required:** Yes

**Response:**
```json
{ "ok": true, "likes": 1201 }
```

---

### `DELETE /posts/:postId/like`
Unlikes a post.

**Called from:** `src/services/api.js → unlikePost()`

**Auth required:** Yes

**Response:**
```json
{ "ok": true, "likes": 1200 }
```

---

### `GET /feed/trending`
Returns trending hashtags/topics.

**Called from:** `src/services/api.js → getTrendingTopics()`

**Auth required:** Yes

**Response:**
```json
{
  "topics": [
    { "tag": "#ChicagoDAO", "posts": 1240 },
    { "tag": "#Web3Chicago", "posts": 890 }
  ]
}
```

---

## 4. Comments & Replies

### `GET /posts/:postId/comments`
Returns all top-level comments for a post, each with their replies nested one level deep.

**Called from:** `src/services/api.js → getComments()` / `src/pages/CommentsPage.jsx`

**Auth required:** Yes

**Response:**
```json
{
  "comments": [
    {
      "id": "c_001",
      "author": {
        "id": "u_003",
        "name": "ArtBlock",
        "handle": "@art_block.sol",
        "avatar": "https://..."
      },
      "content": "Comment text here",
      "likes": 4,
      "timestamp": "5m ago",
      "replies": [
        {
          "id": "r_001",
          "author": {
            "id": "u_001",
            "name": "Jordan Neo",
            "handle": "@jordan_neo.eth",
            "avatar": "https://..."
          },
          "content": "Reply text here",
          "likes": 1,
          "timestamp": "3m ago"
        }
      ]
    }
  ]
}
```

---

### `POST /posts/:postId/comments`
Adds a top-level comment to a post.

**Called from:** `src/services/api.js → createComment()` / `src/pages/CommentsPage.jsx → submitComment()`

**Auth required:** Yes

**Request body:**
```json
{ "content": "Comment text here" }
```

**Response:** The created comment object (same shape as above, `replies: []`).

---

### `POST /posts/:postId/comments/:commentId/replies`
Adds a reply to a comment. Replies are one level deep only — no nested replies.

**Called from:** `src/pages/CommentsPage.jsx → handleReply()`

**Auth required:** Yes

**Request body:**
```json
{ "content": "Reply text here" }
```

**Response:** The created reply object.

---

### `POST /comments/:commentId/like`
Likes a comment.

**Called from:** `src/pages/CommentsPage.jsx → CommentRow → handleLike()`

**Auth required:** Yes

**Response:**
```json
{ "ok": true, "likes": 5 }
```

---

### `DELETE /comments/:commentId/like`
Unlikes a comment.

**Auth required:** Yes

**Response:**
```json
{ "ok": true, "likes": 4 }
```

---

### `POST /replies/:replyId/like`
Likes a reply.

**Called from:** `src/pages/CommentsPage.jsx → ReplyRow → handleLike()`

**Auth required:** Yes

**Response:**
```json
{ "ok": true, "likes": 2 }
```

---

### `DELETE /replies/:replyId/like`
Unlikes a reply.

**Auth required:** Yes

**Response:**
```json
{ "ok": true, "likes": 1 }
```

---

## 5. Users & Profiles

### `GET /users/:userId`
Returns a user's public profile.

**Called from:** `src/services/api.js → getUser()`

**Auth required:** Yes

**Response:** Same shape as `GET /auth/me` but without `email` and sensitive fields.

---

### `GET /users/suggestions`
Returns a list of suggested users to follow.

**Called from:** `src/services/api.js → getSuggestedUsers()`

**Auth required:** Yes

**Response:**
```json
{
  "users": [
    {
      "id": "u_004",
      "name": "CryptoKing",
      "handle": "@crypto_king.eth",
      "avatar": "https://...",
      "followers": 12000,
      "following": false
    }
  ]
}
```

---

### `POST /users/:userId/follow`
Follows a user.

**Called from:** `src/services/api.js → followUser()`

**Auth required:** Yes

**Response:**
```json
{ "ok": true }
```

---

### `DELETE /users/:userId/follow`
Unfollows a user.

**Called from:** `src/services/api.js → unfollowUser()`

**Auth required:** Yes

**Response:**
```json
{ "ok": true }
```

---

### `PATCH /users/me`
Updates the current user's profile.

**Called from:** `src/services/api.js → updateProfile()` / `src/pages/EditProfile.jsx`

**Auth required:** Yes

**Request body** (all fields optional):
```json
{
  "name": "Jordan Neo",
  "bio": "Updated bio",
  "website": "jordanneo.eth",
  "twitter": "@jordan_neo",
  "farcaster": "@jordan.fc",
  "avatar": "data:image/jpeg;base64,..."
}
```

**Response:** Updated user object (same shape as `GET /auth/me`).

---

## 6. Leaderboard

### `GET /leaderboard?period=weekly`
Returns the ranked leaderboard for the given period.

**Called from:** `src/services/api.js → getLeaderboard()`

**Auth required:** Yes

**Query params:**
| Param | Values | Default |
|-------|--------|---------|
| `period` | `daily`, `weekly`, `monthly`, `alltime` | `weekly` |

**Response:**
```json
{
  "period": "weekly",
  "entries": [
    {
      "rank": 1,
      "user": {
        "id": "u_002",
        "name": "DevZero",
        "handle": "@zero_layer.eth",
        "avatar": "https://..."
      },
      "score": 9820,
      "change": 2
    }
  ]
}
```

---

### `GET /leaderboard/me`
Returns the current user's leaderboard stats and rank.

**Called from:** `src/services/api.js → getMyLeaderboardStats()`

**Auth required:** Yes

**Response:**
```json
{
  "rank": 42,
  "score": 3200,
  "change": -1,
  "period": "weekly"
}
```

---

## 7. Staking

### `GET /staking/info`
Returns the current user's staking summary and available pools.

**Called from:** `src/services/api.js → getStakingInfo()`

**Auth required:** Yes

**Response:**
```json
{
  "stakedAmount": 5000,
  "pendingRewards": 120.5,
  "apy": 12.4,
  "lockExpiry": "2025-03-01T00:00:00Z",
  "pools": [
    { "durationDays": 30,  "apy": 8.0 },
    { "durationDays": 90,  "apy": 12.4 },
    { "durationDays": 180, "apy": 18.0 }
  ]
}
```

---

### `POST /staking/stake`
Stakes tokens into a pool.

**Called from:** `src/services/api.js → stakeTokens()`

**Auth required:** Yes

**Request body:**
```json
{ "amount": 1000, "durationDays": 90 }
```

**Response:**
```json
{ "ok": true, "stakedAmount": 6000, "lockExpiry": "2025-04-01T00:00:00Z" }
```

---

### `POST /staking/unstake`
Unstakes tokens (subject to lock period).

**Called from:** `src/services/api.js → unstakeTokens()`

**Auth required:** Yes

**Request body:**
```json
{ "amount": 500 }
```

**Response:**
```json
{ "ok": true, "stakedAmount": 5500 }
```

**Errors:**
| Status | Meaning |
|--------|---------|
| 400 | Amount exceeds staked balance |
| 403 | Lock period has not expired |

---

### `POST /staking/claim-rewards`
Claims all pending staking rewards.

**Called from:** `src/services/api.js → claimRewards()`

**Auth required:** Yes

**Response:**
```json
{ "ok": true, "claimed": 120.5, "pendingRewards": 0 }
```

---

## 8. Marketplace

### `GET /marketplace/campaigns?period=3d`
Returns active marketplace campaigns.

**Called from:** `src/services/api.js → getMarketplaceCampaigns()`

**Auth required:** Yes

**Query params:**
| Param | Values | Default |
|-------|--------|---------|
| `period` | `1d`, `3d`, `7d` | `3d` |

**Response:**
```json
{
  "campaigns": [
    {
      "id": "camp_001",
      "title": "Chicago Launch",
      "image": "https://...",
      "budget": 5000,
      "durationDays": 3,
      "impressions": 12400,
      "clicks": 380,
      "status": "active"
    }
  ]
}
```

---

### `GET /marketplace/pricing?duration=3d`
Returns pricing tiers for campaign durations.

**Called from:** `src/services/api.js → getMarketplacePricing()`

**Auth required:** Yes

**Response:**
```json
{
  "pricing": [
    { "duration": "1d", "cltCost": 500,  "label": "1 Day" },
    { "duration": "3d", "cltCost": 1200, "label": "3 Days" },
    { "duration": "7d", "cltCost": 2500, "label": "7 Days" }
  ]
}
```

---

### `POST /marketplace/campaigns`
Creates a new marketplace campaign.

**Called from:** `src/services/api.js → createCampaign()`

**Auth required:** Yes

**Request body:**
```json
{
  "title": "My Campaign",
  "image": "https://... or data:image/...",
  "budget": 1200,
  "durationDays": 3
}
```

**Response:** The created campaign object.

**Errors:**
| Status | Meaning |
|--------|---------|
| 400 | Missing fields or invalid duration |
| 402 | Insufficient CLT balance |

---

## 9. Network

### `GET /network/stats`
Returns overall platform stats (total users, posts, transactions, etc.).

**Called from:** `src/services/api.js → getNetworkStats()`

**Auth required:** Yes

**Response:**
```json
{
  "totalUsers": 48200,
  "totalPosts": 312000,
  "totalTransactions": 91400,
  "cltCirculating": 50000000,
  "activeStakers": 8700
}
```

---

## 10. Shared Conventions

### Base URL
Set `VITE_API_BASE_URL` in your `.env` file:
```
VITE_API_BASE_URL=https://api.chicago.io/api
```
Defaults to `http://localhost:3000/api` in development.

### Authentication
All protected routes expect:
```
Authorization: Bearer <session_token>
```
Admin session tokens may alternatively be delivered as an `HttpOnly` cookie (see 2FA verify endpoint).

### Standard error shape
All errors return:
```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

### Timestamps
All timestamps in responses should be ISO 8601 strings (`"2025-01-15T12:00:00Z"`). The frontend currently renders relative time strings (e.g. `"2h ago"`) — either return relative strings directly or return ISO and let the frontend format.

### Pagination
Feed and list endpoints use `page` (1-indexed). Response always includes `hasMore: boolean`.

### Image uploads
Images are currently sent as base64 data URIs in request bodies. For production, consider replacing with a pre-signed S3 upload URL flow — but the contract above works as-is for v1.

### Frontend swap guide
To wire up a real endpoint, replace the mock in the relevant file:

```js
// BEFORE (mock)
const [posts, setPosts] = useState(feedPosts)

// AFTER (real API)
const [posts, setPosts] = useState([])
useEffect(() => { api.getFeedPosts().then(data => setPosts(data.posts)) }, [])
```

Then delete `src/data/mockData.js` once all endpoints are live.
