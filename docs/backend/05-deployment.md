# ☁️ Backend — Deployment (Render)

> How to deploy the NoteDown backend to Render as a Node.js web service.

---

## 🚀 Render Setup

### 1. Create a Web Service

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo: `UsaaryanByte07/NoteDown`
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `notedown-backend` (or any) |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free (or paid for better uptime) |

---

### 2. Environment Variables

Add all variables from [`01-setup-and-env.md`](./01-setup-and-env.md) in Render's **Environment** tab. Key production-specific values:

```env
NODE_ENV=production
FRONTEND_URL=https://note-down-sooty.vercel.app
PORT=10000          # Render assigns this automatically via $PORT
```

> **Note:** Render automatically sets `PORT`. Use `process.env.PORT || 3010` in `server.js` (already done).

---

### 3. Health Check

Render will check the root path. Express responds with 404 (from the `pageNotFoundHandler`) which is fine — Render's health check just needs a TCP response, not HTTP 200.

---

## ⚠️ Render Free Tier Gotchas

| Issue | Workaround |
|---|---|
| **Cold starts** — service spins down after 15 min of inactivity | Use a ping service (e.g., UptimeRobot) to hit `/api/maintenance-status` every 14 min |
| **Disk is ephemeral** — `temp/quarantine/` files don't persist across deploys | Files are deleted after scanning anyway — by design |
| **CPU limits** — OCR is done client-side to avoid this | ✅ Architecture handles this |

---

## 📋 Production Checklist

```
✅ NODE_ENV=production
✅ FRONTEND_URL set to Vercel URL (no trailing slash)
✅ MONGO_URI points to Atlas (not localhost)
✅ AWS credentials set
✅ VIRUSTOTAL_API_KEY set
✅ RESEND_API_KEY set
✅ GEMINI_API_KEY_1 (and optionally _2 _3 _4) set
✅ ADMINJS_COOKIE_SECRET and ADMINJS_SESSION_SECRET set (min 32 chars)
✅ JWT_SECRET_KEY set (min 32 chars)
✅ Atlas Vector Search index "vector_index" created on note_embeddings
✅ First SystemUser (root) created in Atlas
```

---

## 🔄 Continuous Deployment

Render auto-deploys on every push to the main branch if the repo is connected. You can also manually trigger a deploy from the Render dashboard.

---

## 🛡️ Maintenance Mode

To put the site in maintenance mode without redeploying:

1. Log into the AdminJS panel at `/root/panel`
2. Navigate to **MaintenanceMode** → edit the singleton document
3. Set `isActive: true`, add a `message`, optionally set `endsAt`
4. Add your IP to `whitelistedIps` so you can still access the site

The frontend checks `/api/maintenance-status` on every page load and shows the maintenance page automatically.

To find your IP for whitelisting:
```
GET /api/my-ip
```

---

## 📊 Monitoring

- **Render Logs**: Available in the dashboard under your service → Logs
- **MongoDB Atlas**: Has built-in performance monitoring and slow query alerts
- **AdminJS Panel**: View all DB documents including SystemStats for storage usage
