# 🖥️ Frontend — Setup & Structure

> Everything you need to run the NoteDown frontend locally and understand its folder layout.

---

## ⚡ Quick Start

```bash
cd NoteDown/frontend
npm install

# Development server (with Vite proxy to backend at :3010)
npm run dev
# → http://localhost:5173

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🔑 Environment Variables

**File:** `frontend/.env.production`

```env
# The base URL of your backend API.
# In dev, Vite proxies /api → localhost:3010, so this can be empty.
# In production, set this to your Render backend URL.
VITE_API_URL=https://your-backend.onrender.com
```

> In dev mode, `VITE_API_URL` is typically empty (or unset). `useApi` and `useFetch` prepend this env var to every fetch URL. With Vite's proxy config, all `/api/*` calls are forwarded to `:3010` automatically.

---

## 🔧 Vite Configuration (`vite.config.js`)

```js
// Dev proxy — forwards to Express backend
'/api'     → 'http://localhost:3010'
'/uploads' → 'http://localhost:3010'
'/root'    → 'http://localhost:3010'   // AdminJS panel
```

Plugins: `@vitejs/plugin-react` + `@tailwindcss/vite`

---

## 📂 Directory Structure

```
frontend/
├── index.html                   # HTML entry point (mounts #root)
├── vite.config.js               # Vite + proxy config
├── vercel.json                  # SPA catch-all rewrite → index.html
├── eslint.config.js             # ESLint (react-hooks, react-refresh)
│
└── src/
    ├── main.jsx                 # Entry: ThemeProvider → App
    ├── App.jsx                  # Maintenance check + BrowserRouter + Routes
    ├── App.css                  # Minimal global overrides
    ├── index.css                # Tailwind @import + CSS custom properties
    │
    ├── assets/                  # Static assets (logo, images)
    │
    ├── context/
    │   ├── themeContext.jsx      # ThemeProvider + useTheme hook
    │   └── auth/
    │       ├── AuthContext.jsx   # AuthContext (user state, setUser)
    │       └── AuthProvider.jsx  # Fetches /api/auth/me on mount
    │
    ├── hooks/
    │   ├── useApi.jsx            # Mutation hook (POST/PUT/DELETE)
    │   ├── useFetch.jsx          # Data fetching hook (GET, runs on mount)
    │   ├── useOcrProcessor.jsx   # Tesseract.js + pdfjs OCR pipeline
    │   ├── useCooldownTimer.jsx  # OTP resend countdown management
    │   └── useChatApi.jsx        # Chat-specific API calls (sessions, messages)
    │
    ├── components/
    │   ├── Layout.jsx            # Navbar + <Outlet /> wrapper
    │   ├── Navbar.jsx            # Full responsive nav with hamburger + dark mode toggle
    │   ├── Footer.jsx            # Site footer
    │   ├── Spinner.jsx           # Reusable loading spinner (size prop)
    │   ├── ProtectedRoute.jsx    # Redirects if not logged in or wrong role
    │   ├── PublicRoute.jsx       # Redirects if already logged in
    │   ├── auth/                 # Auth form sub-components (if any)
    │   ├── notes/
    │   │   ├── NoteCard.jsx      # Unified card (status badge, download, delete, summary)
    │   │   ├── StorageBar.jsx    # Visual storage progress bar
    │   │   └── UploadForm.jsx    # File upload form + OCR integration
    │   ├── profile/
    │   │   ├── ProfileInfo.jsx         # Display profile data
    │   │   ├── EditProfileModal.jsx    # Edit firstName/lastName modal
    │   │   └── ResetPasswordSection.jsx # In-app password reset with OTP
    │   └── chat/
    │       ├── ChatWindow.jsx     # Message list display
    │       ├── ChatInput.jsx      # Message input bar
    │       ├── MessageBubble.jsx  # Individual message bubble (user/ai)
    │       ├── NoteSelector.jsx   # Note multi-select for new sessions
    │       └── SessionSidebar.jsx # Sidebar listing all chat sessions
    │
    └── pages/
        ├── HomePage.jsx          # Landing page (logged out) + dashboard (logged in)
        ├── NotFoundPage.jsx      # 404 page
        ├── MaintenancePage.jsx   # Shown when site is in maintenance mode
        ├── auth/
        │   ├── LoginPage.jsx
        │   ├── SignupPage.jsx
        │   ├── VerifyOtpPage.jsx
        │   ├── ForgotPasswordPage.jsx
        │   └── ResetPasswordPage.jsx
        ├── user/
        │   ├── UploadNotePage.jsx  # Upload form page
        │   ├── NotesPage.jsx       # Community approved notes feed
        │   ├── MyNotesPage.jsx     # User's own notes (all statuses)
        │   ├── ProfilePage.jsx     # Profile management
        │   └── ChatPage.jsx        # AI chat interface
        └── admin/
            └── AdminNotesPage.jsx  # Admin approve/reject interface
```

---

## 🔢 Key NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Serve `dist/` locally for preview |
| `npm run lint` | Run ESLint |
