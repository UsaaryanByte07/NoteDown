# 📡 Backend — API Reference

> Complete reference for all REST endpoints.

**Base URL (production):** `https://notedown-backend.onrender.com`  
**Base URL (dev):** `http://localhost:3010`

---

## 🔐 Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Rate Limit | Description |
|:---:|---|:---:|---|---|
| `POST` | `/signup` | Not logged in | 2/hr | Register new user, send OTP |
| `GET` | `/verify-otp` | Public | — | Check OTP page status |
| `POST` | `/verify-otp` | Public | 5/15min | Submit OTP → set JWT |
| `POST` | `/check-and-resend-otp` | Public | — | If unverified account → resend OTP |
| `POST` | `/resend-otp` | Public | 5/15min | Resend OTP (respects cooldown) |
| `GET` | `/cooldown-status` | Public | 60/15min | Get remaining OTP cooldown |
| `POST` | `/login` | Not logged in | 10/30min | Login → set httpOnly JWT cookie |
| `POST` | `/logout` | Any | — | Clear JWT cookie |
| `GET` | `/me` | Any | — | Current user (graceful, no 401 if logged out) |
| `POST` | `/forgot-password` | Public | 5/15min | Send reset link to email |
| `GET` | `/reset-password` | Public | — | Validate reset token |
| `POST` | `/reset-password` | Public | 2/15min | Submit new password via token |
| `GET` | `/profile` | Login | — | Get profile data |
| `PATCH` | `/profile` | Login | — | Update firstName / lastName |
| `POST` | `/profile/request-password-reset` | Login | 5/hr | Send in-app OTP to email |
| `POST` | `/profile/reset-password` | Login | — | Submit OTP + new password |

### Key Response Shapes

**GET /me:**
```json
{ "isLoggedIn": true, "user": { "_id": "...", "firstName": "John", "userType": "user", "totalStorageUsed": 1048576 } }
```

---

## 📝 Note Routes — `/api/notes`

| Method | Endpoint | Auth | Rate Limit | Description |
|:---:|---|:---:|---|---|
| `POST` | `/upload` | User | 5/5days | Upload file → VirusTotal scan |
| `GET` | `/` | Login | — | Community feed (approved notes) |
| `GET` | `/my-notes` | User | — | Current user's notes (all statuses) |
| `DELETE` | `/my-notes/:id` | User | — | Delete note + S3 cleanup |
| `GET` | `/my-storage` | User | — | Storage usage stats |
| `POST` | `/ocr-callback` | User | — | Submit OCR text from browser |
| `GET` | `/pending` | Admin | — | Notes awaiting admin review |
| `GET` | `/admin/all` | Admin | — | All notes (any status) |
| `PATCH` | `/:id/approve` | Admin | — | Approve → embed + summarize |
| `PATCH` | `/:id/reject` | Admin | — | Reject with reason |
| `PATCH` | `/:id/retry-summary` | Login | — | Re-trigger failed AI summary |

**POST /upload** (multipart/form-data): fields `noteFile`, `title`, `description`

**POST /upload response (202):**
```json
{ "success": true, "noteId": "...", "ocrRequired": true, "ocrToken": "eyJ..." }
```

**Approval side effects:**
```
Admin approves → status: 'approved' → embedNoteContent() → generateSummary()
```

---

## 💬 Chat Routes — `/api/chat`

All require `userType === 'user'`.

| Method | Endpoint | Description |
|:---:|---|---|
| `POST` | `/sessions` | Create session with `{ title, noteIds[] }` |
| `GET` | `/sessions` | Get all user's sessions |
| `GET` | `/sessions/:id` | Get session + messages |
| `DELETE` | `/sessions/:id` | Delete session + messages |
| `POST` | `/sessions/:id/messages` | Send message → RAG pipeline |

**Message pipeline:** User message → vector search (Atlas, filtered by noteIds) → LangChain prompt → Gemini 2.5 Flash Lite → save AI message → return both messages.

---

## 🔧 Utility Endpoints

| Method | Endpoint | Auth | Description |
|:---:|---|:---:|---|
| `GET` | `/api/maintenance-status` | Public | `{ isActive, message, endsAt }` |
| `GET` | `/api/my-ip` | Public | Server's detected client IP |

---

## ❌ Error Format

```json
{ "success": false, "message": "Human readable error", "errorCode": "RATE_LIMIT_EXCEEDED" }
```

| Status | Meaning |
|---|---|
| `202` | Accepted (async scan started) |
| `401` | Not authenticated |
| `403` | Forbidden (wrong role or terminated session) |
| `429` | Rate limit exceeded |
| `503` | AI service unavailable |
