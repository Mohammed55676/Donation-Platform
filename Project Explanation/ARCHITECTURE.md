# Architecture

The Donation Platform follows a classic client-server architecture, decoupled into a React Single Page Application (SPA) on the frontend and an Express REST API with Socket.IO on the backend.

## 1. Overall System Flow
1. **Client (Browser):** The user interacts with the React frontend.
2. **API Requests:** The frontend makes HTTP requests via Axios to the Node.js backend.
3. **Real-time Events:** For messaging, the frontend connects to the backend via WebSocket (Socket.IO).
4. **Database:** The backend queries and mutates data in MongoDB.
5. **Third-Party Services:** Firebase is used on the frontend for Google OAuth popups, but session management is ultimately handled by backend JWTs.

## 2. Frontend Structure
The frontend is built with React 19, Vite, and Tailwind CSS v4.

* **Entry Points:** `src/main.tsx` wraps the application in context providers and renders the router defined in `src/app/routes.tsx`.
* **Routing:** Handled by React Router v7. The application uses nested routes with layouts (e.g., `Layout.tsx` for public pages, `AuthLayout.tsx` for authentication).
* **State Management:** React Context API is used for global state (e.g., `AuthContext.tsx` for user sessions). Component-level state is managed with React Hooks.
* **Component Library:** The UI uses Tailwind CSS for utility-first styling, heavily mixed with Radix UI primitives and some Material UI (MUI) components for complex interactive elements.
* **API Integration:** An Axios instance (`src/app/utils/api.ts`) is configured with an interceptor to automatically attach the JWT `Bearer` token from `localStorage` to all requests.

## 3. Backend Structure
The backend is a Node.js application built with Express.js.

* **Entry Point:** `backend/src/server.js` initializes Express, connects to MongoDB, configures middleware (CORS, Helmet, Rate Limiting), mounts routes, and attaches the Socket.IO server.
* **Routing Layer:** `backend/src/routes/` defines API endpoints and maps them to controller functions.
* **Controller Layer:** `backend/src/controllers/` contains the core business logic for handling requests and formatting responses.
* **Model Layer:** `backend/src/models/` defines Mongoose schemas for MongoDB, handling data validation and relationships.
* **Middleware:** Custom middleware exists for JWT authentication (`protect`), role-based access control (`requireRole`), and centralized error handling.

## 4. Database Structure
The application uses MongoDB, a NoSQL document database. Key collections include:
* **Users:** Stores donors, charities, and admins. Differentiated by `role` and `user_type`.
* **Donations:** Physical items offered by donors.
* **Campaigns:** Monetary fundraising efforts created by charities.
* **Volunteer Opportunities:** Roles posted by charities.
* **Conversations & Messages:** Handles the real-time chat data structure.
* **Reports:** User-generated flags for inappropriate content.

## 5. Authentication Flow
1. **Local:** User submits email/password. Backend verifies, issues an OTP if required, then returns a JWT.
2. **Google (Firebase):** Frontend calls `signInWithPopup`. Frontend extracts email and profile data and sends it to `/api/auth/google`. Backend finds or creates the user and issues a JWT.
3. **Session:** The JWT is stored in `localStorage` on the client. It is sent in the `Authorization` header for all protected API calls.

## 6. Real-time Messaging Flow
1. **Handshake:** When an authenticated user visits the chat section, the Socket.IO client connects, passing the JWT in the handshake auth payload.
2. **Authentication:** The backend socket middleware verifies the JWT.
3. **Rooms:** The user joins a private Socket.IO room named after their `userId`.
4. **Emission:** When sending a message, the client emits a `sendMessage` event with the `receiverId` and text.
5. **Broadcast:** The server saves the message to MongoDB and emits `receiveMessage` to both the receiver's room and the sender's room.

## 7. Admin Flow
The admin interfaces with the system via the `/dashboard/admin` route on the frontend. The backend enforces security by checking `req.user.role === 'admin'` via the `requireRole` middleware. The admin has endpoints to list all users, change user statuses (ban/active), approve/reject charities, and review reports.

## 8. Deployment Overview
* **Frontend:** The Vite build output (`dist/`) can be deployed to static hosting services like Netlify, Vercel, or AWS S3. A `netlify.toml` file is present in the repository.
* **Backend:** The Express app can be deployed to any Node.js environment (e.g., Render, Heroku, DigitalOcean). A `render.yaml` file is present for Render deployment.
* **Database:** MongoDB Atlas is typically used for production database hosting.
