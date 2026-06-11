# AGENTS.md — Donation Platform

## Repo structure

```
/  (frontend root)          React 19 + Vite + Tailwind v4
├── backend/                Express + MongoDB (separate package.json)
├── src/                    Frontend source
│   └── app/
│       ├── pages/          Route pages (Home, Donations, Dashboard, etc.)
│       ├── components/     Shared UI (Navbar, Footer, Layout, shadcn-style primitives)
│       ├── context/        AuthContext, DonationContext, LanguageContext, etc.
│       ├── lib/            Firebase init, Socket.IO client
│       ├── services/       Mock API helpers (not the main API)
│       ├── utils/          Axios instance with JWT interceptor, validators
│       ├── hooks/          Custom hooks (useCampaigns, useVolunteerOpportunities)
│       ├── i18n/           en.json, ar.json
│       └── data/           Static mock data
└── dist/                   Build output
```

## Commands

| Location | Command | Purpose |
|---|---|---|
| root | `npm run dev` | Start Vite dev server (port 5173) |
| root | `npm run build` | Production build |
| backend/ | `npm run dev` | Nodemon (port 5000) |
| backend/ | `npm run seed` | Seed MongoDB |
| backend/ | `npm start` | Production start |

Run `npm i` in **both** root and `backend/` — they are independent packages.

## Architecture

- **Frontend entry**: `src/main.tsx` → `App.tsx` → `routes.tsx`
- **Backend entry**: `backend/src/server.js` (Express + Socket.IO)
- **API base**: `http://localhost:5000/api`, proxied via `VITE_API_URL` in `.env`
- **Frontend env** (root `.env`): `VITE_API_URL=http://localhost:5000/api`
- **Backend env** (`backend/.env`): `MONGODB_URI`, `JWT_SECRET`, `PORT`, `CLIENT_ORIGIN`

## Auth

- **Dual auth**: Firebase (Google popup) + JWT (email/password)
- Token stored in `localStorage` key `token`
- Axios interceptor attaches `Bearer` header automatically
- On 401: token is cleared **unless** the failing request is `/auth/me` (race condition safeguard)
- Backend: JWT verify → query user from DB → check `status !== 'banned'`
- Roles: `user`, `admin` (stored on User.role). `user_type`: `donor`, `charity`
- Protected routes use `<ProtectedRoute allowedRole={...}>` wrapper

## Database models (MongoDB/Mongoose)

- User (name, email, password, role, user_type, wishlist, status)
- Donation, DonationRequest, DonorOffer, Campaign, VolunteerOpportunity
- CommunityRequest
- Conversation, Message, Block (for Socket.IO messaging)

## Style system

- **Tailwind CSS v4** with `@tailwindcss/vite` plugin (no `tailwind.config.js`)
- **MUI 7** and **Radix UI** primitives also present (mixed styling)
- `@` import alias maps to `./src`
- RTL support via `LanguageContext` (Arabic/English toggle)
- Design tokens documented in `DESIGN.md`

## Gotchas

- Socket.IO client uses `autoConnect: false`; connect manually when logged in
- The project was originally exported from Figma (`@figma/my-make-file` in package.json name)
- `postcss.config.mjs` is intentionally empty (Tailwind v4 handles PostCSS)
- Vite `assetsInclude: ['**/*.svg', '**/*.csv']` for raw imports
- Backend rate limiting: 200 req/15min global, 20 req/15min on auth endpoints
- No test framework is configured
- **No ESLint, Prettier, or typecheck** in root frontend (`backend/` has `eslint src/`)
