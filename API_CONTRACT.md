# Chicago Web3 — API Contract

All routes are prefixed with `/api` (set via `VITE_API_BASE_URL` in `.env`).
All request/response bodies are JSON.
Protected routes need `Authorization: Bearer <token>` in the header.
Admin routes use `credentials: 'include'` (HttpOnly cookie) — see the admin section.

---

## Table of Contents

1. [User Auth](#1-user-auth)
2. [Admin Auth](#2-admin-auth)
3. [Admin Dashboard](#3-admin-dashboard)
4. [Feed & Posts](#4-feed--posts)
5. [Comments & Replies](#5-comments--replies)
6. [Users & Profiles](#6-users--profiles)
7. [Leaderboard](#7-leaderboard)
8. [Staking](#8-staking)
9. [Marketplace](#9-marketplace)
10. [Network](#10-network)
11. [Conventions](#11-conventions)

---

## 1. User Auth

### `POST /auth/magic-link`
Sends a magic-link email. Creates an account on first use if the email doesn't exist.

**Request:**
```json
{ "email": "user@example.com" }
```

**Response:**
```json
{ "ok": true }
```

**Errors:**
| Status | Reason |
|--------|--------|
| 400 | Invalid or missing email |
| 429 | Rate limited |

---

### `POST /auth/magic-link/verify`
Exchanges a magic-link token for a session. Token comes from the email link.

**Request:**
```json
{ "token": "TOKEN_FROM_EMAIL_LINK" }
```

**Response:**
```json
{
  "token": "session_jwt",
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
| Status | Reason |
|--------|--------|
| 400 | Token missing or malformed |
| 401 | Token invalid or already used |
| 410 | Token expired |

---

### `POST /auth/register`
Standard email/password registration.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword1!",
  "username": "jordan_neo",
  "displayName": "Jordan Neo",
  "bio": "Optional"
}
```

**Response:**
```json
{
  "token": "session_jwt",
  "user": { "id": "u_001", "email": "...", "name": "Jordan Neo", "handle": "@jordan_neo.eth", "avatar": null, "role": "user" }
}
```

**Errors:**
| Status | Reason |
|--------|--------|
| 400 | Validation failed |
| 409 | Email or username already taken |

---

### `GET /auth/me`
Returns the current user's full profile. Called on every app load to restore session.

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
Links a wallet address to the current user's account.

**Auth required:** Yes

**Request:**
```json
{ "address": "0xABC123..." }
```

**Response:**
```json
{ "ok": true, "walletAddress": "0xABC123..." }
```

---

## 2. Admin Auth

The admin portal lives at `/portal-ax92-v1` — never linked from the public UI.

**Login flow:**
```
1. POST /admin/auth/login        → returns tempToken + triggers 2FA code
2. POST /admin/auth/verify-2fa   → issues full session via HttpOnly cookie
3. Land on AdminDashboard
```

**Invite flow:**
```
1. Super admin: POST /admin/invite          → backend creates token, emails it, returns raw token
2. Invitee opens: /portal-ax92-v1/register?token=TOKEN
3. GET /admin/auth/validate-invite?token=   → prefills locked email field
4. POST /admin/auth/register                → creates account, destroys token
```

**Bootstrap:** Seed the super admin via CLI/migration. Never expose a setup UI in production.

---

### `POST /admin/auth/login`

**Request:**
```json
{ "email": "admin@chicago.io", "password": "AdminPassword1!" }
```

**Response:**
```json
{
  "tempToken": "short_lived_jwt",
  "adminId": "a_001",
  "twoFactorMethod": "totp"
}
```

The `tempToken` is stored in `sessionStorage` and sent as the Bearer token for the 2FA verify step.

**Errors:**
| Status | Reason |
|--------|--------|
| 401 | Wrong email or password |
| 429 | Too many attempts — account locked |

---

### `POST /admin/auth/verify-2fa`

**Auth required:** `tempToken` from login (Bearer header)

**Request:**
```json
{ "code": "123456" }
```

**Response:**
```json
{
  "admin": {
    "id": "a_001",
    "email": "admin@chicago.io",
    "name": "Jane Smith",
    "role": "super_admin"
  }
}
```

Set the session as `HttpOnly; Secure; SameSite=Strict` cookie server-side. Frontend idle timeout is 14 minutes — match `Max-Age` to that.

**Errors:**
| Status | Reason |
|--------|--------|
| 401 | Invalid or expired 2FA code |
| 400 | Code format invalid |

---

### `POST /admin/auth/resend-2fa`

**Auth required:** `tempToken` from login (Bearer header)

Enforce a 60-second cooldown server-side.

**Response:**
```json
{ "ok": true }
```

---

### `GET /admin/auth/validate-setup-token?token=TOKEN`

Called on mount in `AdminSetup.jsx`. Returns whether the one-time setup token is still valid.

**Response (valid):**
```json
{ "valid": true }
```

**Response (invalid):**
```json
{ "valid": false, "reason": "already_used" }
```

Possible `reason` values: `"expired"`, `"not_found"`, `"already_used"`.

---

### `POST /admin/auth/setup`

Creates the first super admin. Permanently disables this endpoint after success.

**Request:**
```json
{ "token": "SETUP_TOKEN", "email": "admin@chicago.io", "name": "Root Admin", "password": "..." }
```

**Response:**
```json
{ "success": true }
```

---

### `GET /admin/auth/validate-invite?token=TOKEN`

Called on mount in `AdminRegister.jsx`. Returns the email associated with the invite so the field can be pre-filled (read-only).

**Response (valid):**
```json
{ "valid": true, "email": "invited@chicago.io", "expiresAt": "2026-01-15T12:00:00Z" }
```

**Response (invalid):**
```json
{ "valid": false, "reason": "expired" }
```

---

### `POST /admin/auth/register`

**Request:**
```json
{ "token": "INVITE_TOKEN", "name": "New Admin", "password": "SecureAdminPass1!" }
```

**Response:**
```json
{ "success": true }
```

Token is destroyed server-side on success.

---

### `POST /admin/invite`

**Auth required:** Super admin session (cookie)

Creates an invite token, emails the link, and returns the raw token so the super admin can copy it manually (useful when email isn't wired up yet).

**Request:**
```json
{ "email": "newadmin@chicago.io" }
```

**Response:**
```json
{ "ok": true, "token": "64_char_crypto_random", "expiresAt": "2026-01-15T12:00:00Z" }
```

The frontend builds the full URL: `${window.location.origin}/portal-ax92-v1/register?token=${token}`

**Errors:**
| Status | Reason |
|--------|--------|
| 400 | Invalid email |
| 403 | Caller is not a super admin |
| 409 | Active invite already exists for this email |

---

## 3. Admin Dashboard

All routes below require an active admin session (HttpOnly cookie).

---

### `GET /admin/stats`

Called by the Overview tab on load.

**Response:**
```json
{
  "totalUsers": 14820,
  "usersBadge": "+2.4%",
  "totalPosts": 89314,
  "postsBadge": "412 today",
  "totalStaked": "4.2M",
  "stakedBadge": "↑ 8%",
  "activeCampaigns": 23,
  "campaignsBadge": "3 pending"
}
```

---

### `GET /admin/activity-log`

Returns the last 24 hours of admin security events for the Overview tab.

**Response:**
```json
{
  "events": [
    { "icon": "login",      "text": "Admin login · 2FA passed",        "time": "2 min ago", "ok": true  },
    { "icon": "warning",    "text": "Failed login attempt (3rd party)", "time": "3 hrs ago", "ok": false }
  ]
}
```

---

### `GET /admin/users?search=&filter=all&page=1`

**Query params:**
| Param | Values | Default |
|-------|--------|---------|
| `search` | string | `""` |
| `filter` | `all`, `active`, `suspended` | `all` |
| `page` | number | `1` |

Page size is 20. Pagination uses `page` (1-indexed).

**Response:**
```json
{
  "users": [
    {
      "id": "u_001",
      "name": "Amara Osei",
      "handle": "@amara_web3",
      "role": "User",
      "joined": "May 2026",
      "status": "active",
      "posts": 142,
      "staked": "2,400"
    }
  ],
  "total": 14820,
  "page": 1,
  "pageSize": 20
}
```

`role` values: `"User"`, `"Mod"`, `"Admin"`
`status` values: `"active"`, `"suspended"`, `"pending"`

---

### `PATCH /admin/users/:userId`

Update a user's role or status.

**Request:**
```json
{ "role": "Mod" }
```

**Response:**
```json
{ "ok": true }
```

---

### `POST /admin/users/:userId/suspend`

**Response:**
```json
{ "ok": true }
```

---

### `POST /admin/users/:userId/unsuspend`

**Response:**
```json
{ "ok": true }
```

---

### `GET /admin/campaigns`

Returns all campaigns plus aggregate stats for the Ad Manager tab.

**Response:**
```json
{
  "campaigns": [
    {
      "id": "camp_001",
      "name": "Premium Tier Access",
      "status": "active",
      "impressions": "452,001",
      "clicks": "12,402",
      "ctr": "2.74%"
    }
  ],
  "stats": {
    "impressions": "1.28M",
    "clicks": "48,931",
    "ctr": "3.81%"
  }
}
```

`status` values: `"active"`, `"paused"`, `"pending"`

---

### `PATCH /admin/campaigns/:campaignId`

**Request:**
```json
{ "status": "paused" }
```

**Response:**
```json
{ "ok": true }
```

---

### `DELETE /admin/campaigns/:campaignId`

**Response:**
```json
{ "ok": true }
```

---

### `POST /admin/campaigns`

**Request:**
```json
{
  "name": "Winter Drop 2026",
  "url": "https://...",
  "image": "https://... or data:image/..."
}
```

**Response:** The created campaign object.

---

### `GET /admin/team`

Returns all admin accounts.

**Response:**
```json
{
  "admins": [
    {
      "id": "a_001",
      "name": "Root Admin",
      "email": "root@chicago.io",
      "role": "Super Admin",
      "since": "Jan 2025",
      "last": "2 min ago",
      "status": "online"
    }
  ]
}
```

`status` values: `"online"`, `"away"`, `"offline"`
`role` values: `"Super Admin"`, `"Moderator"`, `"Ad Manager"`

---

### `PATCH /admin/team/:adminId`

**Request:**
```json
{ "role": "Moderator" }
```

**Response:**
```json
{ "ok": true }
```

---

### `DELETE /admin/team/:adminId`

Cannot delete own account or the last super admin — return 403 for both.

**Response:**
```json
{ "ok": true }
```

---

## 4. Feed & Posts

### `GET /feed/posts?filter=general&page=1`

**Auth required:** Yes

**Query params:**
| Param | Type | Default |
|-------|------|---------|
| `filter` | category slug or `general` | `general` |
| `page` | number | `1` |

**Response:**
```json
{
  "posts": [
    {
      "id": "p_001",
      "author": { "id": "u_002", "name": "DevZero", "handle": "@zero_layer.eth", "avatar": "https://..." },
      "content": "Post text here",
      "images": ["https://..."],
      "poll": null,
      "likes": 1200,
      "comments": 84,
      "shares": 32,
      "trending": true,
      "category": "DevLog",
      "timestamp": "2h ago",
      "liked": false
    }
  ],
  "hasMore": true,
  "page": 1
}
```

---

### `GET /feed/categories`

**Auth required:** Yes

**Response:**
```json
{
  "categories": [
    { "id": "general", "label": "General" },
    { "id": "devlog",  "label": "DevLog" }
  ]
}
```

---

### `POST /feed/posts`

**Auth required:** Yes

**Request:**
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

`poll` is optional. `images` accepts URLs or base64.

**Response:** The created post object.

---

### `POST /posts/:postId/like`

**Auth required:** Yes

**Response:**
```json
{ "ok": true, "likes": 1201 }
```

---

### `DELETE /posts/:postId/like`

**Auth required:** Yes

**Response:**
```json
{ "ok": true, "likes": 1200 }
```

---

### `GET /feed/trending`

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

## 5. Comments & Replies

### `GET /posts/:postId/comments`

**Auth required:** Yes

Replies are one level deep only — no nested replies.

**Response:**
```json
{
  "comments": [
    {
      "id": "c_001",
      "author": { "id": "u_003", "name": "ArtBlock", "handle": "@art_block.sol", "avatar": "https://..." },
      "content": "Comment text",
      "likes": 4,
      "timestamp": "5m ago",
      "replies": [
        {
          "id": "r_001",
          "author": { "id": "u_001", "name": "Jordan Neo", "handle": "@jordan_neo.eth", "avatar": "https://..." },
          "content": "Reply text",
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

**Auth required:** Yes

**Request:**
```json
{ "content": "Comment text" }
```

**Response:** The created comment object (`replies: []`).

---

### `POST /posts/:postId/comments/:commentId/replies`

**Auth required:** Yes

**Request:**
```json
{ "content": "Reply text" }
```

**Response:** The created reply object.

---

### `POST /comments/:commentId/like`
### `DELETE /comments/:commentId/like`
### `POST /replies/:replyId/like`
### `DELETE /replies/:replyId/like`

**Auth required:** Yes

**Response:**
```json
{ "ok": true, "likes": 5 }
```

---

## 6. Users & Profiles

### `GET /users/:userId`

**Auth required:** Yes

Same shape as `GET /auth/me` but without `email` and other private fields.

---

### `GET /users/suggestions`

**Auth required:** Yes

**Response:**
```json
{
  "users": [
    { "id": "u_004", "name": "CryptoKing", "handle": "@crypto_king.eth", "avatar": "https://...", "followers": 12000, "following": false }
  ]
}
```

---

### `POST /users/:userId/follow`
### `DELETE /users/:userId/follow`

**Auth required:** Yes

**Response:**
```json
{ "ok": true }
```

---

### `PATCH /users/me`

**Auth required:** Yes

All fields optional:

**Request:**
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

## 7. Leaderboard

### `GET /leaderboard?type=creators`

**Auth required:** Yes

**Query params:**
| Param | Values |
|-------|--------|
| `type` | `creators`, `stakers` |

**Response:**
```json
{
  "type": "creators",
  "entries": [
    {
      "rank": 1,
      "user": { "id": "u_002", "name": "DevZero", "handle": "@zero_layer.eth", "avatar": "https://..." },
      "score": 9820,
      "change": 2
    }
  ]
}
```

---

### `GET /leaderboard/me`

**Auth required:** Yes

**Response:**
```json
{
  "rank": 42,
  "score": 3200,
  "change": -1,
  "stakers": {
    "rank": 18,
    "stakedAmount": 5000
  }
}
```

---

## 8. Staking

### `GET /staking/info`

**Auth required:** Yes

**Response:**
```json
{
  "stakedAmount": 5000,
  "pendingRewards": 120.5,
  "apy": 12.4,
  "lockExpiry": "2026-03-01T00:00:00Z",
  "pools": [
    { "durationDays": 30,  "apy": 8.0 },
    { "durationDays": 90,  "apy": 12.4 },
    { "durationDays": 180, "apy": 18.0 }
  ]
}
```

---

### `POST /staking/stake`

**Auth required:** Yes

**Request:**
```json
{ "amount": 1000, "durationDays": 90 }
```

**Response:**
```json
{ "ok": true, "stakedAmount": 6000, "lockExpiry": "2026-04-01T00:00:00Z" }
```

---

### `POST /staking/unstake`

**Auth required:** Yes

**Request:**
```json
{ "amount": 500 }
```

**Response:**
```json
{ "ok": true, "stakedAmount": 5500 }
```

**Errors:**
| Status | Reason |
|--------|--------|
| 400 | Amount exceeds staked balance |
| 403 | Lock period hasn't expired |

---

### `POST /staking/claim-rewards`

**Auth required:** Yes

**Response:**
```json
{ "ok": true, "claimed": 120.5, "pendingRewards": 0 }
```

---

## 9. Marketplace

### `GET /marketplace/campaigns?period=3d`

**Auth required:** Yes

**Query params:** `period` — `1d`, `3d`, `7d` (default `3d`)

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

**Auth required:** Yes

**Request:**
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
| Status | Reason |
|--------|--------|
| 400 | Missing fields or invalid duration |
| 402 | Insufficient CLT balance |

---

## 10. Network

### `GET /network/stats`

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

## 11. Conventions

### Base URL
```
VITE_API_BASE_URL=https://api.chicago.io/api
```

### Auth headers
User routes:
```
Authorization: Bearer <session_token>
```
Admin routes send `credentials: 'include'` for the HttpOnly session cookie, plus the `tempToken` as a Bearer header during the 2FA step.

### Error shape
```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

### Timestamps
Return ISO 8601 (`"2026-01-15T12:00:00Z"`). The frontend handles relative formatting.

### Pagination
`page` is 1-indexed. Always include `hasMore: boolean` in paginated responses.

### Images
Currently sent as base64 data URIs. Fine for v1 — swap to pre-signed S3 URLs when needed.
