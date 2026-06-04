# Donation Platform — منصة الخير

A full-stack donation platform connecting donors with beneficiaries. Built with React 18 + Vite (frontend) and Node.js + Express + MongoDB (backend), with Firebase Authentication for Google Sign-In and Socket.IO for real-time messaging.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6, Tailwind CSS v4, React Router v7 |
| Backend | Node.js ≥18, Express 4, Mongoose 8, Socket.IO 4 |
| Auth | Firebase Authentication (Google) + JWT |
| Database | MongoDB Atlas |
| Email | Nodemailer + Gmail App Password |
| Frontend Hosting | Netlify |
| Backend Hosting | Render |

---

## Project Structure

```
donation-platform/
├── src/                        # Frontend source (React + Vite)
│   ├── app/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React context (Auth, Donation, etc.)
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # firebase.ts, socket.ts
│   │   ├── pages/              # Route-level page components
│   │   ├── services/           # API service helpers
│   │   └── utils/              # api.ts (Axios), validators
│   └── main.tsx
├── backend/                    # Backend source (Express + MongoDB)
│   ├── src/
│   │   ├── config/db.js        # MongoDB connection
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth, roles, validation, errors
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express routers
│   │   ├── utils/              # Response helpers, upload config
│   │   └── server.js           # Entry point
│   ├── uploads/                # Local file uploads (dev only)
│   ├── .env.example
│   └── package.json
├── public/
│   └── _redirects              # Netlify SPA fallback
├── .env.example                # Frontend environment template
├── netlify.toml                # Netlify build config
├── render.yaml                 # Render backend config
├── vite.config.ts
└── package.json
```

---

## Prerequisites

- **Node.js** v18 or higher — https://nodejs.org
- **npm** v9+ (comes with Node 18)
- **MongoDB Atlas** account — https://cloud.mongodb.com (free tier works)
- **Firebase** project with Authentication enabled — https://console.firebase.google.com
- **Gmail** account with 2FA and an App Password (for email features)

---

## Quick Start — Fresh Machine

### 1. Clone the repository

```bash
git clone https://github.com/your-username/donation-platform.git
cd donation-platform
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure frontend environment

```bash
cp .env.example .env
```

Open `.env` and fill in your values (see [Frontend Environment Variables](#frontend-environment-variables)).

### 4. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 5. Configure backend environment

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your values (see [Backend Environment Variables](#backend-environment-variables)).

### 6. Seed the database (optional but recommended)

```bash
cd backend
npm run seed
cd ..
```

### 7. Start development servers

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
npm run dev
# Runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## Frontend Environment Variables

Create `.env` at the project root by copying `.env.example`:

```env
# Firebase — from Firebase Console → Project Settings → Your Apps → Web App
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXX

# Backend connection
# Development:
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
# Production (replace with your Render URL):
# VITE_API_URL=https://donation-platform-backend.onrender.com/api
# VITE_SOCKET_URL=https://donation-platform-backend.onrender.com
```

> All `VITE_` variables are embedded into the compiled JS bundle at build time. Never put secrets in them.

---

## Backend Environment Variables

Create `backend/.env` by copying `backend/.env.example`:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/donation_platform?retryWrites=true&w=majority

# JWT — use a long random string (64+ characters)
JWT_SECRET=replace_with_a_very_long_random_string_at_least_64_characters
JWT_EXPIRES_IN=7d

# CORS — frontend origin
# Development:
CLIENT_ORIGIN=http://localhost:5173
# Production: CLIENT_ORIGIN=https://your-app.netlify.app

# Email (Gmail App Password)
# 1. Enable 2FA on your Google account
# 2. Go to myaccount.google.com/apppasswords
# 3. Create an App Password for "Mail"
SMTP_EMAIL=your_gmail@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop   # 16-char app password

# Contact form recipient
ADMIN_EMAIL=your_admin_email@gmail.com
```

---

## Firebase Setup

1. Go to https://console.firebase.google.com and create a project.
2. Enable **Authentication** → **Sign-in methods** → enable **Google** and **Email/Password**.
3. Add your domains to **Authorized domains**:
   - `localhost`
   - `your-app.netlify.app` (add after deploying)
4. Go to **Project Settings** → **Your apps** → **Web app** → copy the config values into your `.env`.

---

## MongoDB Atlas Setup

1. Create a free cluster at https://cloud.mongodb.com.
2. Create a database user with read/write access.
3. Add your IP to the **Network Access** allowlist (or use `0.0.0.0/0` for all IPs in dev).
4. Copy the connection string into `backend/.env` as `MONGODB_URI`.

---

## Deployment

### Frontend — Netlify

1. Push your repository to GitHub.
2. In the Netlify dashboard, click **Add new site → Import an existing project**.
3. Connect your GitHub repo.
4. Netlify will auto-detect settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Go to **Site settings → Environment variables** and add all `VITE_` variables with **production values** (point `VITE_API_URL` and `VITE_SOCKET_URL` to your Render URL).
6. Deploy.

### Backend — Render

1. In the Render dashboard, click **New → Web Service**.
2. Connect your GitHub repo.
3. Render will detect `render.yaml` automatically.
4. Set the following environment variables in the dashboard (marked `sync: false` in `render.yaml`):
   - `MONGODB_URI`
   - `CLIENT_ORIGIN` — your Netlify URL (e.g. `https://your-app.netlify.app`)
   - `SMTP_EMAIL`
   - `SMTP_PASSWORD`
   - `ADMIN_EMAIL`
5. Deploy.
6. Copy the Render URL and update `VITE_API_URL` / `VITE_SOCKET_URL` in Netlify, then redeploy the frontend.

> **Note:** Render's free tier uses **ephemeral storage**. Files uploaded via the platform (national IDs, proof documents) are stored on disk and **will be deleted on each redeploy**. For production, migrate file uploads to [Cloudinary](https://cloudinary.com) or [AWS S3](https://aws.amazon.com/s3/).

---

## Available Scripts

### Frontend (project root)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server at `http://localhost:5173` |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Serve the production build locally for testing |

### Backend (`cd backend` first)

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restarts on changes) |
| `npm start` | Start in production mode |
| `npm run seed` | Seed MongoDB with sample data |

---

## API Health Check

```
GET /api/health
```

Returns `{ "success": true, "message": "API is running", "timestamp": "..." }` — use this to verify the backend is running.

---

## Troubleshooting

### "Network Error" / API calls failing
- Check that the backend is running (`cd backend && npm run dev`)
- Verify `VITE_API_URL` in `.env` matches the backend port (`http://localhost:5000/api`)
- Check the browser console for CORS errors

### "Firebase: Error (auth/...)"
- Ensure all `VITE_FIREBASE_*` variables are set in `.env`
- For Google Sign-In popups blocked: check that `localhost` is in Firebase Authorized Domains

### MongoDB connection refused
- Verify `MONGODB_URI` in `backend/.env`
- Check MongoDB Atlas Network Access: your IP must be whitelisted
- Try adding `0.0.0.0/0` temporarily in Atlas for testing

### Socket.IO not connecting in production
- Ensure `CLIENT_ORIGIN` in `backend/.env` matches exactly the Netlify URL (no trailing slash)
- Ensure `VITE_SOCKET_URL` in the frontend `.env` matches the Render URL

### Emails not sending
- Gmail requires an **App Password** (not your regular password)
- Enable 2FA on Gmail first, then create an App Password at `myaccount.google.com/apppasswords`
- If no SMTP credentials are set, the app uses Ethereal Email (fake SMTP for testing) — check the backend console for a preview URL

### Netlify: page refreshes show 404
- Verify `public/_redirects` contains `/* /index.html 200`
- Or verify `netlify.toml` has the `[[redirects]]` rule — both are present in this repo

---

## Security Notes

- **Never commit `.env` files.** They are in `.gitignore`. Use `.env.example` as the template.
- **Rotate credentials** if `backend/.env` was ever accidentally committed (`git log --all -- backend/.env`).
- The Google login endpoint (`POST /api/auth/google`) currently trusts the email sent from the frontend without server-side token verification. For production, implement Firebase Admin SDK token verification.
- JWT tokens are stored in `localStorage`. For higher security, consider `httpOnly` cookies.

---

## Fresh Machine Test Plan

Use this checklist to verify the project works on a completely new computer:

```
SETUP
[ ] Node.js v18+ installed (node --version)
[ ] Repository cloned fresh (not copied from another machine)
[ ] npm install completed without errors in project root
[ ] npm install completed without errors in backend/
[ ] .env created from .env.example with real values
[ ] backend/.env created from backend/.env.example with real values

BACKEND
[ ] cd backend && npm run dev — server starts on port 5000
[ ] GET http://localhost:5000/api/health returns { success: true }
[ ] MongoDB connected log appears (no ECONNREFUSED)

FRONTEND
[ ] npm run dev — Vite starts on port 5173
[ ] http://localhost:5173 loads without white screen
[ ] Browser console has no uncaught errors

AUTH FLOWS
[ ] Register new account (email + password)
[ ] Login with that account
[ ] Google Sign-In popup works and creates/logs in account
[ ] Logout clears session

CORE FEATURES
[ ] Donations list loads from API (not empty/error)
[ ] Create a donation (requires login)
[ ] Messages page loads, Socket.IO connects (no WebSocket errors in console)
[ ] Contact form submits (check backend console for email preview URL if no SMTP)

PRODUCTION BUILD
[ ] npm run build completes without errors
[ ] npm run preview — production build works at http://localhost:4173
[ ] No broken routes on page refresh (SPA routing works)
```
