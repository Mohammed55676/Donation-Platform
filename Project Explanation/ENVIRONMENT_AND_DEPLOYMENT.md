# Environment and Deployment

The project consists of two separate environments: the Vite frontend and the Node.js backend.

## 1. Required Environment Variables

### Frontend (`/.env`)
These variables must be prefixed with `VITE_` to be accessible in React.
* `VITE_API_URL`: The base URL for the backend API.
  * *Local:* `http://localhost:5000/api`
  * *Production:* `https://your-backend-domain.com/api`
* `VITE_FIREBASE_API_KEY`: Firebase project API key.
* `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain.
* `VITE_FIREBASE_PROJECT_ID`: Firebase project ID.
* `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket.
* `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID.
* `VITE_FIREBASE_APP_ID`: Firebase app ID.

### Backend (`/backend/.env`)
* `PORT`: The port the Express server runs on (usually `5000`).
* `MONGODB_URI`: The connection string for MongoDB.
  * *Local:* `mongodb://localhost:27017/donation_platform`
  * *Production:* MongoDB Atlas connection string.
* `JWT_SECRET`: A strong, random string used to sign JWTs.
* `CLIENT_ORIGIN`: The URL of the deployed frontend. Used to configure CORS and Socket.IO allowed origins.
  * *Local:* `http://localhost:5173`
  * *Production:* `https://your-frontend-domain.com`

## 2. Running Locally

**Prerequisites:** Node.js installed, MongoDB installed and running locally (or an Atlas URI).

1. **Backend:**
   ```bash
   cd backend
   npm install
   npm run dev  # Starts nodemon on port 5000
   ```
2. **Frontend:**
   Open a new terminal in the root directory.
   ```bash
   npm install
   npm run dev  # Starts Vite dev server on port 5173
   ```

## 3. Building for Production

**Frontend Build:**
```bash
npm run build
```
This command compiles the React application using Vite and outputs static files to the `dist/` directory.

**Backend Start:**
```bash
cd backend
npm start  # Runs 'node src/server.js' instead of nodemon
```

## 4. Deployment Notes

### Frontend Deployment (e.g., Netlify, Vercel)
* **Build Command:** `npm run build`
* **Publish Directory:** `dist`
* **Environment Variables:** Ensure all `VITE_` variables are set in the hosting provider's dashboard.
* The repository includes a `netlify.toml` file configured to rewrite all traffic to `index.html` to support React Router's client-side routing.

### Backend Deployment (e.g., Render, Heroku)
* The backend is a standard Node.js web service.
* Set the Root Directory to `backend/` if deploying from a monorepo, or ensure the build commands run `cd backend && npm install`.
* Ensure `CLIENT_ORIGIN` matches the deployed frontend URL so CORS does not block requests.
* Ensure WebSockets are supported by the hosting tier for Socket.IO to function correctly.
* The repository includes a `render.yaml` file outlining the backend service configuration.

## 5. Common Setup Problems
* **CORS Errors:** If the frontend cannot communicate with the backend, verify that `VITE_API_URL` is correct on the frontend and `CLIENT_ORIGIN` is exactly correct on the backend.
* **Socket Disconnects:** Ensure `socket.io-client` on the frontend is attempting to connect to the backend's root URL (e.g., `http://localhost:5000`), not the `/api` route.
