# Tech Stack and Packages

This document explains the technical foundation of the Donation Platform, detailing the core stack, specific libraries used in the frontend and backend, development tools, and architectural choices.

## 1. Main Tech Stack

The platform is built using a modern JavaScript/TypeScript stack:

* **Frontend Framework:** React 19
* **Build Tool:** Vite
* **Language:** TypeScript & JavaScript
* **Styling:** Tailwind CSS v4, supplemented by shadcn/ui components (Radix UI + Tailwind).
* **Backend Runtime:** Node.js
* **Backend Framework:** Express.js
* **Database:** MongoDB
* **ODM:** Mongoose
* **Authentication:** JSON Web Tokens (JWT) for custom auth, Firebase for Google OAuth.
* **Real-time Communication:** Socket.IO for the chat system.
* **HTTP Client:** Axios for API requests.

## 2. Frontend Packages

The frontend dependencies are managed via `package.json` in the root directory.

| Package | Purpose | Where Used | Dependency Type | Notes |
| ------- | ------- | ---------- | --------------- | ----- |
| `react` & `react-dom` | Core UI library for building the application. | Entire frontend (`src/`) | Runtime | Uses React 18/19 features. |
| `react-router` | Client-side routing. | `src/app/routes.tsx` | Runtime | Handles navigation without page reloads. |
| `tailwindcss` | Utility-first CSS framework for styling. | Entire frontend | Dev | Version 4.1.12. |
| `@radix-ui/react-*` | Accessible, unstyled UI primitives. | `src/app/components/` | Runtime | Forms the base of shadcn/ui components (e.g., Dialog, Accordion, Select). |
| `lucide-react` | SVG icon library. | `src/app/components/` | Runtime | Provides consistent icons across the app. |
| `axios` | Promise-based HTTP client for API requests. | `src/app/utils/api.ts` | Runtime | Configured with an interceptor for JWTs. |
| `zustand` | Lightweight state management. | Various hooks/components | Runtime | Used for simpler, un-opinionated global state where Context is too heavy. |
| `recharts` | Composable charting library. | `src/app/pages/AdminDashboard.tsx` | Runtime | Used for rendering platform statistics. |
| `socket.io-client` | Real-time WebSocket client. | `src/app/pages/messages/` | Runtime | Connects to the backend Socket.IO server. |
| `firebase` | Firebase SDK. | `src/app/lib/firebase.ts` | Runtime | Specifically used for Google OAuth (`signInWithPopup`). |
| `react-hook-form` | Form validation and state management. | Various forms | Runtime | Optimizes re-renders for complex forms. |
| `sonner` | Toast notification library. | Globally | Runtime | Used for success/error popups. |
| `date-fns` | Date utility library. | Various components | Runtime | Used for formatting timestamps. |
| `fallow` | Codebase intelligence tool. | Root directory | Dev | Static analysis and code health monitoring. |
| `vite` | Fast frontend bundler and dev server. | Development | Dev | Powers `npm run dev` and `build`. |

## 3. Backend Packages

The backend dependencies are managed via `backend/package.json`.

| Package | Purpose | Where Used | Dependency Type | Notes |
| ------- | ------- | ---------- | --------------- | ----- |
| `express` | Web framework for creating the REST API. | `backend/src/server.js`, `routes/` | Runtime | Core routing and middleware handler. |
| `mongoose` | Object Data Modeling (ODM) library for MongoDB. | `backend/src/models/` | Runtime | Defines schemas and handles DB interactions. |
| `jsonwebtoken` | Generates and verifies JWTs for authentication. | `backend/src/controllers/auth.controller.js` | Runtime | Used for session management. |
| `bcrypt` | Hashes and compares passwords securely. | `backend/src/models/User.model.js` | Runtime | Pre-save hook hashes passwords. |
| `socket.io` | WebSocket server for real-time chat. | `backend/src/server.js` | Runtime | Attaches to the Express HTTP server. |
| `cors` | Express middleware to enable CORS. | `backend/src/server.js` | Runtime | Allows the frontend to communicate with the API. |
| `dotenv` | Loads environment variables from `.env`. | `backend/src/server.js` | Runtime | Secures secrets like `JWT_SECRET`. |
| `helmet` | Secures Express apps by setting HTTP headers. | `backend/src/server.js` | Runtime | Security best practice. |
| `express-rate-limit` | Basic rate-limiting middleware. | `backend/src/server.js` | Runtime | Prevents brute-force/DDoS attacks. |
| `joi` | Data validation library. | Middleware/Controllers | Runtime | Validates incoming request bodies. |
| `multer` | Middleware for handling `multipart/form-data`. | File upload routes | Runtime | Likely used for charity license uploads. |
| `nodemailer` | Email sending library. | Auth controllers | Runtime | Used for sending OTPs or notifications. |
| `morgan` | HTTP request logger middleware. | `backend/src/server.js` | Runtime | Logs requests to the console. |
| `nodemon` | Automatically restarts the server on file changes. | Development | Dev | Used via `npm run dev`. |

## 4. Development Tools

* **Vite Dev Server:** Used for running the React frontend (`npm run dev` in root). Provides instant Hot Module Replacement (HMR).
* **Nodemon:** Used for running the Express backend (`npm run dev` in `backend/`). Automatically restarts the Node server when files change.
* **ESLint:** Linter for catching syntax and style issues in the backend (`npm run lint` inside `backend/`).
* **Fallow:** Static analysis tool used in the frontend workspace for maintaining code health.

## 5. Frontend Architecture From Tech Perspective

* **Component Organization:** Components are divided into reusable primitives (often inside `components/ui/` based on shadcn) and functional components (like `Navbar`, `Footer`).
* **Routing:** Uses `react-router` (`createBrowserRouter`) mapped in `src/app/routes.tsx`. It handles nested layouts (e.g., `Layout` vs `AuthLayout`).
* **Context Providers:** React Context (`AuthContext.tsx`) wraps the application to provide global session state (the `user` object and `login`/`logout` functions).
* **API Calls:** An Axios instance is configured in `src/app/utils/api.ts`. It intercepts all requests to inject the JWT from `localStorage` into the `Authorization` header.
* **Authentication State:** Stored locally in `localStorage` (`token`). On initial load, `AuthContext` verifies the token by hitting `/api/auth/me`.
* **Protected Routes:** A `<ProtectedRoute>` component acts as a wrapper. It checks if `isAuthenticated` is true, and optionally checks the user's `role` or `user_type` before rendering the children.
* **Styling:** Tailwind CSS is used heavily. `class-variance-authority` and `clsx` are used alongside Tailwind to dynamically construct class names for UI components.

## 6. Backend Architecture From Tech Perspective

* **Server Start:** `backend/src/server.js` initializes Express, connects to MongoDB via `mongoose.connect`, configures global middleware, mounts the main API router, attaches Socket.IO, and starts listening on the `PORT`.
* **Routing Registration:** `backend/src/routes/index.js` acts as the master router, delegating paths like `/auth` to `auth.routes.js`.
* **Controllers:** Functions inside `backend/src/controllers/` receive the `req` and `res` objects, execute business logic (querying Mongoose models), and return JSON responses.
* **MongoDB Connection:** Mongoose connects to the `MONGODB_URI` environment variable. Models are defined using `new mongoose.Schema()`.
* **Middleware:** Functions like `protect` decode the JWT from the `Authorization` header, find the user in the database, and attach `req.user`. `requireRole('admin')` checks `req.user.role`.
* **Error Handling:** A centralized error handler (`errorHandler`) sits at the end of the middleware chain in `server.js` to catch any asynchronous errors passed via `next(err)`, preventing server crashes and returning standardized JSON errors.
* **Socket.IO:** Runs on the same port as Express. It uses a custom middleware during the handshake to verify the JWT token, ensuring only authenticated users can connect.

## 7. API Communication

* **Base URL:** Defined via the `VITE_API_URL` environment variable on the frontend (e.g., `http://localhost:5000/api`).
* **Axios Instance:** Frontend uses `import api from '../utils/api'`.
* **Token Handling:** The Axios interceptor automatically attaches `Bearer <token>`. If a `401 Unauthorized` response is received, the interceptor clears the token and forces a logout (unless the request was to `/auth/me`).
* **Request/Response Flow:** Frontend requests JSON. Backend returns a standard format: `{ success: boolean, data?: any, error?: string }`.

## 8. Database Technical Explanation

* **Why MongoDB:** The flexible document schema perfectly fits the diverse nature of donations (items vs. money) and handles rapidly changing chat logs efficiently.
* **Mongoose:** Enforces schema structure, validation rules (like string lengths and enums), and provides middleware hooks (like pre-save password hashing).
* **Main Models:** `User`, `Donation`, `Campaign`, `Conversation`, `Message`, `Report`.
* **Relationships:** Modeled using Mongoose `ObjectId` references (e.g., `Message` has a `conversation_id`, and `sender_id` ref to `User`).
* **Status Fields:** Statuses are strictly controlled via Enum validators. For example, a `User` has `charityStatus: ['pending', 'verified', 'rejected']`.

## 9. Authentication Technical Explanation

* **Login Flow:** Frontend sends `{ email, password }` -> Backend verifies with `bcrypt.compare` -> Backend returns JWT -> Frontend stores in `localStorage`.
* **Register Flow:** Similar to login, but creates a new document. Includes OTP generation for donors.
* **Firebase (Google OAuth):** Firebase handles the UI popup and Google verification. The frontend extracts the Google email/name and sends it to `/api/auth/google`. The backend searches for this email; if found, it issues a standard JWT. The application ultimately relies on JWT, not Firebase sessions.
* **Admin Verification:** Charities register but are locked in a `pending` state. Admins hit a specific PUT route to change `charityStatus` to `verified`, which unlocks standard capabilities.

## 10. Messaging Technical Explanation

* **Conversation Model:** Stores metadata (`requester_id`, `receiver_id`, `status`). Acts as the parent container.
* **Message Model:** Stores the actual `text`, linked to a `conversation_id`.
* **Duplicate Prevention:** A compound index on the `Conversation` model (`requester_id`, `receiver_id`, `post_id`) helps prevent duplicating chat rooms. The controller checks for existing records before creating a new one.
* **Role Enforcement:** Handled via UI conditionals (hiding the "Contact" button) and backend validation during chat initialization.
* **Reporting/Blocking:** Blocking updates the `Conversation.status` to `'blocked'`, preventing further database writes for that chat. Reporting creates a separate `Report` document linking the chat to an Admin review queue.

## 11. Environment Variables

| Variable | Frontend/Backend | Purpose | Example Placeholder |
| -------- | ---------------- | ------- | ------------------- |
| `VITE_API_URL` | Frontend | Base URL for backend requests | `http://localhost:5000/api` |
| `VITE_FIREBASE_API_KEY` | Frontend | Firebase auth configuration | `AIzaSyB...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Frontend | Firebase auth configuration | `app.firebaseapp.com` |
| `PORT` | Backend | Port for Express server | `5000` |
| `MONGODB_URI` | Backend | MongoDB connection string | `mongodb://localhost:27017/db` |
| `JWT_SECRET` | Backend | Secret key to sign JWTs | `super_secret_string` |
| `CLIENT_ORIGIN` | Backend | Allowed CORS origin | `http://localhost:5173` |

## 12. Possible Unused or Needs Review Packages

* **`zustand`:** Installed in the frontend, but `AuthContext` and React hooks handle most state. *Needs review* to see if it's actively used for a specific slice of state, otherwise it could be removed to reduce bundle size.
* **`nodemailer`:** Present in the backend `package.json`. If OTPs are currently simulated and logged to the console (as hinted by `devOtp` references), `nodemailer` might be installed but dormant. *Needs manual verification* to ensure it's either configured with SMTP credentials or removed.

---

## 13. Simple Explanation for Project Discussion

"This project uses **React** and **Vite** for the frontend, providing a fast, component-based user interface styled with **Tailwind CSS**. We used **Express.js** running on **Node.js** for the backend because it is simple and suitable for building robust REST APIs. **MongoDB** with **Mongoose** was chosen as the database because the project data—such as users, donations, conversations, and reports—can be stored flexibly as documents. 

The frontend communicates with the backend through REST APIs using **Axios**. Authentication is handled securely using **JSON Web Tokens (JWT)**, with an optional **Firebase** integration solely for Google login. For real-time features like chat, we implemented **Socket.IO**. The platform enforces strict role-based access control directly in the backend middleware and frontend routes to safely separate the capabilities of Donors, Charities, and Admins."
