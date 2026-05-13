# 🚀 Frontend — Deployment (Vercel)

> How to deploy the NoteDown frontend to Vercel.

---

## ⚡ One-Click Deploy

The simplest way is to connect your GitHub repo to Vercel:

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import `UsaaryanByte07/NoteDown`
3. Set **Root Directory** to `frontend`
4. Vercel auto-detects Vite — **no build command changes needed**
5. Add environment variables (see below)
6. Deploy!

---

## 🔑 Environment Variables

In Vercel project settings → **Environment Variables**:

| Variable | Value | Environment |
|---|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com` | Production |

> **No trailing slash** on the URL.

> In preview deployments (PRs), you can set `VITE_API_URL` to a staging backend or leave it empty if the preview build won't use the real API.

---

## 📄 SPA Rewrite Rule (`vercel.json`)

The `frontend/vercel.json` contains a catch-all rewrite so React Router handles all routes client-side:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Without this, refreshing a URL like `/my-notes` would return a 404 from Vercel's CDN instead of serving the React app.

---

## 🏗️ Build Output

Vite builds to `frontend/dist/`. Vercel serves this as a static site from their global CDN. The build includes:

- All React components bundled + minified
- Tailwind CSS purged (only used classes included)
- pdfjs-dist worker file (large — ~3 MB) served separately
- Tesseract.js WASM files loaded lazily at runtime

---

## 🔄 Continuous Deployment

Vercel auto-deploys on every push to the connected branch (usually `main`). PRs get preview deployments automatically.

---

## 📋 Production Checklist

```
✅ VITE_API_URL set to Render backend URL
✅ vercel.json present in frontend/ with SPA rewrite
✅ npm run build passes locally without errors
✅ CORS: backend FRONTEND_URL matches Vercel domain
✅ No localhost URLs hardcoded in source
```

---

## 🐛 Common Issues

| Issue | Fix |
|---|---|
| Page refreshes give 404 | Ensure `vercel.json` rewrite is in `frontend/` root |
| API calls fail (CORS) | Check `FRONTEND_URL` on Render backend matches your Vercel URL exactly (no trailing slash) |
| Tesseract OCR fails | pdfjs worker path — check `pdfjsWorker` import in `useOcrProcessor.jsx` uses `?url` suffix |
| Dark mode flashes on load | `getInitialTheme()` in `themeContext.jsx` reads localStorage synchronously — should not flash |
