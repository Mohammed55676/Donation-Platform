# 📁 Donation Platform — Project Structure Documentation

> **Stack:** React 18 + Vite + Tailwind CSS v4 (Frontend) · Node.js + Express + MongoDB (Backend)
> **Node:** ≥ 18.0.0 · **Package Manager:** npm (two separate packages)

---

## 🗂️ Root Directory

```
Donation-Platform-main/
├── src/                        # Frontend source code
├── backend/                    # Backend API (separate npm package)
├── public/                     # Static assets served as-is
├── dist/                       # Production build output (auto-generated)
├── index.html                  # Vite HTML entry point
├── vite.config.ts              # Vite config (port 5173, @ alias, chunk splitting)
├── package.json                # Frontend dependencies & scripts
├── postcss.config.mjs          # PostCSS config (intentionally minimal — Tailwind v4)
├── netlify.toml                # Netlify deployment configuration
├── render.yaml                 # Render.com deployment configuration
├── .env                        # Frontend environment variables (VITE_*)
├── AGENTS.md                   # AI agent instructions & repo conventions
├── DESIGN.md                   # Design tokens & style guidelines
├── STRUCTURE.md                # This file — project structure docs
└── README.md                   # Project overview & setup guide
```

---

## 🎨 Frontend — `src/`

```
src/
├── main.tsx                    # App entry — creates React root, imports CSS
├── vite-env.d.ts               # Vite environment type declarations
├── styles/
│   └── index.css               # Global styles, Tailwind v4 @import, CSS custom properties
└── app/
    ├── App.tsx                 # Root component — all providers + RouterProvider
    ├── routes.tsx              # All client-side routes via createBrowserRouter
    ├── components/             # Shared reusable UI components
    ├── pages/                  # Route-level page components
    ├── context/                # React Context providers (global state)
    ├── hooks/                  # Custom React hooks
    ├── lib/                    # Third-party library initializations
    ├── utils/                  # Utilities: axios instance, validators
    ├── services/               # Mock API helpers (non-primary)
    ├── i18n/                   # Internationalization JSON files (AR/EN)
    └── data/                   # Static mock/seed data files
```

### 📄 Core Entry Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | Creates React root, renders `<App />`, imports global CSS |
| `src/app/App.tsx` | Wraps everything: `ErrorBoundary → LanguageProvider → AuthProvider → NotificationProvider → DonationProvider → RouterProvider` |
| `src/app/routes.tsx` | Defines all routes: public layout, auth pages, role-protected routes |

---

## 🧩 Components — `src/app/components/`

### Top-Level Components

| Component | Description |
|-----------|-------------|
| `Layout.tsx` | Main app shell: `Navbar + <Outlet> + Footer + AIChatbot` |
| `Navbar.tsx` | Responsive navigation: auth state, language toggle, notification bell |
| `Footer.tsx` | Site footer with links and social icons |
| `AIChatbot.tsx` | Floating AI assistant with Arabic knowledge base, interactive guide flows, navigation intents |
| `ErrorBoundary.tsx` | Class-based boundary — catches React runtime errors, shows fallback UI |
| `ProtectedRoute.tsx` | Redirects unauthenticated users to `/login`; supports role-based access control |
| `DashboardLayout.tsx` | Sidebar layout used by Dashboard and AdminDashboard |
| `ChatDialog.tsx` | Modal dialog for direct messaging between users |
| `RatingDialog.tsx` | Dialog for rating donors/beneficiaries post-donation |
| `MapView.tsx` | Leaflet map component for donation center locations |
| `MessageBadge.tsx` | Unread message count badge shown in Navbar |
| `Testimonials.tsx` | Animated testimonials/reviews carousel |
| `BeneficiaryVerificationModal.tsx` | Modal for ID document upload & verification |

### Sub-Directories

```
components/
├── ui/                         # 48 shadcn-style Radix UI primitives
│   ├── button.tsx              # Button variants
│   ├── input.tsx               # Text input
│   ├── dialog.tsx              # Modal dialog
│   ├── card.tsx                # Card container
│   ├── chart.tsx               # Recharts wrapper
│   ├── sidebar.tsx             # Full collapsible sidebar system
│   ├── sonner.tsx              # Toast notifications wrapper
│   └── ... (42 more primitives)
├── community/
│   └── BeneficiaryProfileModal.tsx   # Profile detail modal for community posts
├── notifications/
│   └── NotificationDropdown.tsx      # Notification panel in Navbar
├── locations/
│   ├── CenterCard.tsx                # Donation center info card
│   └── CampaignCards.tsx             # Campaign summary cards on map
├── messages/                         # Messaging UI sub-components
├── feedback/                         # Feedback/rating sub-components
└── figma/                            # Legacy Figma-exported components
```

---

## 📃 Pages — `src/app/pages/`

### Public Pages

| Page | Route | Description |
|------|-------|-------------|
| `Home.tsx` | `/` | Landing: hero, stats, featured donations, active campaigns, how-it-works |
| `Donations.tsx` | `/donations` | Browse & filter all available donations |
| `DonationDetails.tsx` | `/donations/:id` | Single donation detail with request button |
| `AddDonation.tsx` | `/add-donation` | Submit a new donation item form |
| `Volunteer.tsx` | `/volunteer` | Volunteer opportunities listing & registration |
| `Organizations.tsx` | `/organizations` | Charity organizations directory |
| `OrganizationDetails.tsx` | `/organizations/:id` | Organization detail + donate/volunteer section |
| `About.tsx` | `/about` | Platform mission, team, and statistics |
| `Contact.tsx` | `/contact` | Contact form (via EmailJS) |
| `Locations.tsx` | `/locations` | Interactive Leaflet map of donation centers |
| `NotFound.tsx` | `*` | 404 not found page |

### Auth Pages (`pages/auth/`)

| Page | Route | Description |
|------|-------|-------------|
| `AuthLayout.tsx` | — | Auth pages shell (no Navbar/Footer) |
| `Login.tsx` | `/login` | Email/password + Google OAuth sign-in |
| `Signup.tsx` | `/signup` | Registration with account type: donor / beneficiary / volunteer |
| `ForgotPassword.tsx` | `/forgot-password` | Request a password reset link |
| `ResetPassword.tsx` | `/reset-password/:token` | Set a new password via reset token |

### Protected Pages (login required)

| Page | Route | Allowed Roles |
|------|-------|--------------|
| `Dashboard.tsx` | `/dashboard` | `user`, `volunteer` |
| `AdminDashboard.tsx` | `/dashboard/admin` | `admin` only |
| `BeneficiaryVerification.tsx` | `/verify-beneficiary` | any authenticated |
| `Notifications.tsx` | `/notifications` | any authenticated |

### Community Pages (`pages/community/`)

| Page | Route | Description |
|------|-------|-------------|
| `Feed.tsx` | `/community` | Community help-request posts feed |
| `Create.tsx` | `/community/create` | Create new community post |
| `Details.tsx` | `/community/:postId` | Post detail with comments |

### Messages Pages (`pages/messages/`)

| Page | Route | Description |
|------|-------|-------------|
| `Messages.tsx` | `/messages` | Conversations list view |
| `ConversationChat.tsx` | `/messages/:conversationId` | Real-time chat with a user |

---

## 🔄 Context Providers — `src/app/context/`

| Context | File | What It Provides |
|---------|------|-----------------|
| **AuthContext** | `AuthContext.tsx` | `user`, `isAuthenticated`, `isLoading`, `login()`, `loginWithGoogle()`, `signup()`, `logout()`, `updateUser()`, `toggleWishlist()` |
| **LanguageContext** | `LanguageContext.tsx` | `language` (`'ar'` \| `'en'`), `setLanguage()`, automatic RTL/LTR toggle on `<html>` |
| **DonationContext** | `DonationContext.tsx` | Shared donation state and filters across pages |
| **NotificationContext** | `NotificationContext.tsx` | In-app notifications list, unread count, mark-as-read |
| **CommunityContext** | `CommunityContext.tsx` | Community posts list, CRUD actions, comments |

**Provider nesting order in `App.tsx`:**
```
ErrorBoundary
  └─ LanguageProvider
       └─ AuthProvider
            └─ NotificationProvider
                 └─ DonationProvider
                      └─ RouterProvider
```

---

## 🪝 Custom Hooks — `src/app/hooks/`

| Hook | File | Purpose |
|------|------|---------|
| `useCampaigns` | `useCampaigns.ts` | Fetches and caches active campaigns from API |
| `useOrganizations` | `useOrganizations.ts` | Fetches charity organizations list |
| `useVolunteerOpportunities` | `useVolunteerOpportunities.ts` | Fetches available volunteer opportunities |

---

## 🔧 Utilities — `src/app/utils/`

| File | Purpose |
|------|---------|
| `api.ts` | Pre-configured Axios instance: base URL from `VITE_API_URL`, auto-attaches `Bearer` JWT from `localStorage`, clears token on 401 (except `/auth/me`) |
| `validators.ts` | Reusable form validation functions (email format, password strength, required fields) |
| `notificationSound.ts` | Web Audio API helper for playing notification ping sounds |

---

## 🌐 i18n — `src/app/i18n/`

| File | Content |
|------|---------|
| `en.json` | English UI strings |
| `ar.json` | Arabic UI strings |

RTL layout switches automatically via `LanguageContext` by toggling the `dir` attribute on `<html>` element.

---

## 📚 Library Init — `src/app/lib/`

| File | Purpose |
|------|---------|
| `firebase.ts` | Initializes Firebase app. Detects placeholder `...` API keys in `.env` and falls back to a safe dummy config to prevent app crash. Exports: `auth`, `googleProvider`, `firebaseEnabled` |
| `socket.ts` | Socket.IO client configured with `autoConnect: false`. Connect manually after login; disconnect on logout |

---

## 🖥️ Backend — `backend/`

```
backend/
├── src/
│   ├── server.js               # Entry: Express setup, middleware stack, Socket.IO, HTTP listen
│   ├── seed.js                 # MongoDB seeding script (run via npm run seed)
│   ├── config/
│   │   └── db.js               # Mongoose connection to MongoDB
│   ├── models/                 # 12 Mongoose data models
│   ├── routes/                 # 13 Express route files (mounted under /api)
│   ├── controllers/            # 12 controller files (business logic)
│   ├── middleware/             # JWT auth, error handler, file upload (multer)
│   └── utils/                 # apiResponse helpers, Joi validation schemas
├── uploads/                    # Multer upload destination (images, docs)
├── package.json                # Backend dependencies & scripts
├── .env                        # Backend secrets (never commit)
└── .env.example                # Template for required environment variables
```

---

## 🗄️ Database Models — `backend/src/models/`

| Model | File | Key Fields |
|-------|------|-----------|
| **User** | `User.model.js` | `name`, `email`, `password` (bcrypt hashed), `role` (`user`/`admin`/`volunteer`), `user_type` (`donor`/`beneficiary`), `wishlist[]`, `status` (`active`/`banned`) |
| **Donation** | `Donation.model.js` | `title`, `description`, `category`, `condition`, `city`, `status`, `donor` (ref User), `images[]` |
| **DonationRequest** | `DonationRequest.model.js` | `donation` (ref), `requester` (ref User), `status`, `message` |
| **Campaign** | `Campaign.model.js` | `title`, `description`, `goal`, `raised`, `organization` (ref), `endDate`, `status` |
| **VolunteerOpportunity** | `VolunteerOpportunity.model.js` | `title`, `description`, `hours`, `date`, `location`, `registeredUsers[]` |
| **Organization** | `Organization.model.js` | `name`, `description`, `logo`, `location`, `contactEmail`, `website` |
| **BeneficiaryProfile** | `BeneficiaryProfile.model.js` | `user` (ref), `verification_status`, `documents[]`, `needs`, `story` |
| **CommunityRequest** | `CommunityRequest.model.js` | `author` (ref User), `content`, `type`, `comments[]`, `likes[]` |
| **Conversation** | `Conversation.model.js` | `participants[]` (refs to User), `lastMessage`, `updatedAt` |
| **Message** | `Message.model.js` | `sender` (ref), `receiver` (ref), `text`, `read`, `createdAt` |
| **Block** | `Block.model.js` | `blocker` (ref User), `blocked` (ref User) — for messaging privacy |
| **Rating** | `Rating.model.js` | `rater` (ref), `rated` (ref), `donation` (ref), `score` (1–5), `comment` |

---

## 🛣️ API Routes — `backend/src/routes/`

**Base URL:** `http://localhost:5000/api`

| Router File | Prefix | Key Endpoints |
|-------------|--------|--------------|
| `auth.routes.js` | `/auth` | `POST /register`, `POST /login`, `POST /google`, `GET /me`, `POST /logout`, `POST /reset-password` |
| `user.routes.js` | `/users` | `GET /:id`, `PUT /:id`, `POST /:id/wishlist`, `DELETE /:id` |
| `donation.routes.js` | `/donations` | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `GET /mine` |
| `donationRequest.routes.js` | `/donation-requests` | `POST /`, `GET /`, `GET /:id`, `PUT /:id/status` |
| `campaign.routes.js` | `/campaigns` | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `volunteer.routes.js` | `/volunteer` | `GET /`, `POST /`, `GET /:id`, `POST /:id/register`, `GET /my` |
| `organization.routes.js` | `/organizations` | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `community.routes.js` | `/community` | `GET /`, `POST /`, `GET /:id`, `POST /:id/comments`, `POST /:id/like`, `DELETE /:id` |
| `conversation.routes.js` | `/conversations` | `GET /`, `POST /`, `GET /requests`, `GET /:id/messages`, `POST /:id/messages` |
| `beneficiary.routes.js` | `/beneficiary` | `GET /profile`, `POST /profile`, `PUT /profile`, `POST /verify` |
| `rating.routes.js` | `/ratings` | `POST /`, `GET /user/:id`, `GET /donation/:id` |
| `contact.routes.js` | `/contact` | `POST /` — sends email via nodemailer |
| `index.js` | — | Mounts all routers under `/api` prefix |

---

## ⚡ Real-Time — Socket.IO

Socket.IO is attached to the Express HTTP server in `backend/src/server.js`.

| Event | Direction | Description |
|-------|-----------|-------------|
| `connection` | client → server | Authenticates via JWT in `socket.handshake.auth.token`, joins personal room (userId) |
| `sendMessage` | client → server | Saves message to DB, emits to receiver's room and sender's room |
| `receiveMessage` | server → client | Broadcasts new message payload to both participants |
| `messageError` | server → client | Error notification when message fails to send |
| `disconnect` | client → server | Cleanup on user disconnect |

Frontend Socket.IO client (`src/app/lib/socket.ts`):
- `autoConnect: false` — must be manually connected after login
- Disconnect on logout to prevent memory leaks

---

## 🔐 Authentication Flow

```
  Email/Password Login              Google OAuth Login
  ─────────────────                 ──────────────────
  POST /api/auth/login              Firebase signInWithPopup()
        │                                   │
        │                           POST /api/auth/google
        └──────────────┬────────────────────┘
                       │ JWT token returned
                       ▼
          localStorage.setItem('token', jwt)
                       │
          Axios interceptor adds:
          Authorization: Bearer <token>
                       │
          GET /api/auth/me
          → Restores user session on page reload
                       │
          401 response → clear token
          (except on /auth/me to avoid race condition)
```

**Roles:** `user` · `admin` · `volunteer`
**User types:** `donor` · `beneficiary`

---

## 🌍 Environment Variables

### Frontend — `.env` (project root)

```env
VITE_FIREBASE_API_KEY=           # Firebase Web API key
VITE_FIREBASE_AUTH_DOMAIN=       # e.g. your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=        # Firebase project ID
VITE_FIREBASE_STORAGE_BUCKET=    # e.g. your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=    # Optional — only for Analytics
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

> ⚠️ If Firebase keys are `...` or missing, a safe dummy config is used automatically.
> Google Login will be disabled but the rest of the app functions normally.

### Backend — `backend/.env`

```env
MONGODB_URI=mongodb://localhost:27017/donation_platform
JWT_SECRET=your-long-random-secret-at-least-32-characters
JWT_EXPIRES_IN=7d
PORT=5000                        # Optional, defaults to 5000
CLIENT_ORIGIN=http://localhost:5173   # CORS whitelist for production
```

---

## 🚀 Development Commands

| Location | Command | Action |
|----------|---------|--------|
| Root `/` | `npm install` | Install frontend dependencies |
| Root `/` | `npm run dev` | Start Vite dev server → **http://localhost:5173** |
| Root `/` | `npm run build` | Production build → `dist/` |
| Root `/` | `npm run preview` | Preview production build locally |
| `backend/` | `npm install` | Install backend dependencies |
| `backend/` | `npm run dev` | Start Express with nodemon → **http://localhost:5000** |
| `backend/` | `npm run seed` | Populate MongoDB with sample data |
| `backend/` | `npm start` | Start Express without hot-reload (production) |

> **Run both servers simultaneously for full functionality.**

---

## 📦 Key Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` + `react-dom` | 18.3.x | Core UI framework |
| `react-router-dom` | 6.30.x | Client-side routing (SPA) |
| `@tailwindcss/vite` | 4.1.x | Tailwind CSS v4 via Vite plugin |
| `@radix-ui/*` | various | 22 headless accessible UI primitives |
| `@mui/material` | 7.3.x | Material UI components (mixed with Radix) |
| `firebase` | 12.x | Google Authentication via Firebase |
| `axios` | 1.15.x | HTTP client with JWT interceptor |
| `socket.io-client` | 4.8.x | Real-time WebSocket client |
| `leaflet` + `react-leaflet` | 1.9.x / 4.2.x | Interactive map components |
| `recharts` | 2.15.x | Charts and graphs (Admin Dashboard) |
| `motion` (framer-motion) | 12.x | Animations and transitions |
| `react-hook-form` | 7.55.x | Form state management |
| `zustand` | 5.x | Lightweight global state store |
| `lucide-react` | 0.487.x | SVG icon library |
| `sonner` | 2.x | Toast notification system |
| `date-fns` | 3.6.x | Date formatting utilities |

---

## 📦 Key Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | 4.21.x | HTTP web framework |
| `mongoose` | 8.9.x | MongoDB object modeling (ODM) |
| `jsonwebtoken` | 9.x | JWT creation and verification |
| `bcrypt` | 5.1.x | Password hashing |
| `socket.io` | 4.8.x | Real-time bidirectional communication |
| `multer` | 2.1.x | Multipart file upload handler |
| `joi` | 17.x | Input validation schemas |
| `helmet` | 7.x | Secure HTTP response headers |
| `cors` | 2.8.x | Cross-origin resource sharing |
| `express-rate-limit` | 7.x | Rate limiting middleware |
| `morgan` | 1.10.x | HTTP request logger |
| `nodemailer` | 8.x | Transactional email (contact form) |
| `dotenv` | 16.x | `.env` file loading |

---

## 🔒 Security Overview

| Layer | Measure |
|-------|---------|
| **HTTP Headers** | Helmet sets `Content-Security-Policy`, `X-Frame-Options`, etc. |
| **Rate Limiting** | 200 req/15min global · 20 req/15min on `/auth/login` & `/auth/register` |
| **Authentication** | JWT signed tokens stored in `localStorage` |
| **Passwords** | bcrypt with salt rounds — never stored as plain text |
| **CORS** | Dev: any `localhost:*` · Prod: restricted to `CLIENT_ORIGIN` only |
| **Socket Auth** | JWT verified on every socket handshake before connection is accepted |
| **File Uploads** | Multer limits file size and type on upload endpoints |

---

*Last updated: June 2026*
