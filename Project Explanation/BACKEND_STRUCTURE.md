# Backend Structure

The backend is built with Node.js and Express, connected to a MongoDB database.

## 1. Core Technologies
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB with Mongoose ODM
* **Real-time:** Socket.IO
* **Security:** Helmet, CORS, Express Rate Limit, bcrypt, JWT

## 2. Directory Layout (`backend/src/`)
* **`config/`**: Configuration files.
  * `db.js`: MongoDB connection logic.
* **`controllers/`**: Business logic. Every route maps to a function here.
  * e.g., `auth.controller.js`, `donation.controller.js`, `conversation.controller.js`.
* **`models/`**: Mongoose schema definitions (see `DATABASE_MODELS.md`).
* **`routes/`**: Express Router configurations.
  * e.g., `auth.routes.js`, `user.routes.js`.
  * `index.js`: The master router that combines all feature routers under the `/api` prefix.
* **`middleware/`**: Functions that run before controllers.
  * `auth.middleware.js`: Contains `protect` (verifies JWT) and `requireRole` (checks user role).
  * `error.middleware.js`: A centralized error handler that catches async errors and formats them into a standard JSON response.
* **`utils/`**: Helper functions.
  * `apiResponse.js`: Standardizes `{ success, data, message }` JSON responses.

## 3. Server Initialization (`server.js`)
1. **Middleware Setup:** Applies `helmet()` for headers, `cors()` for Cross-Origin rules, and `express.json()` for payload parsing.
2. **Rate Limiting:** Applies a global limiter (e.g., 200 req/15min) and a stricter limiter specifically for `/api/auth/login` and `register` (e.g., 20 req/15min) to prevent brute-force attacks.
3. **Route Mounting:** Attaches the master router from `routes/index.js` to the `/api` path.
4. **Error Handling:** Attaches the 404 handler and the global `errorHandler` middleware.
5. **Socket.IO Attachment:** Binds the `Server` instance to the HTTP server, applies JWT middleware to the socket handshake, and defines the `sendMessage` event listeners.

## 4. Error Handling Philosophy
The backend uses a wrapper (often implicitly via the error middleware) to catch unhandled promise rejections. If a controller throws an error, it is passed to `next(error)`. The `errorHandler` determines if it's a Mongoose validation error, a CastError (invalid ID), or a generic 500 error, and responds with a safe, formatted JSON object. No stack traces are leaked in production.
