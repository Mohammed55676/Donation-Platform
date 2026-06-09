# Authentication Flow

Authentication is handled via JWT (JSON Web Tokens) with a fallback to Firebase for Google OAuth.

## 1. Registration (Signup)
1. User submits name, email, password, and `user_type` (donor or charity).
2. Backend creates the user in MongoDB.
3. **If Donor:** Backend generates a 6-digit OTP, stores it in the database with an expiration time, and returns a flag `requiresOTP: true`.
4. **If Charity:** Backend immediately sets `charityStatus: 'pending'` and returns `isPendingCharity: true`.
5. Frontend redirects the user to the OTP Verification page or Pending Review page accordingly.

## 2. OTP Verification
1. User enters the OTP.
2. Backend verifies the OTP against the database and checks expiration.
3. If valid, the user's `isVerified` flag is set to true.
4. Backend generates a JWT and returns it to the client.

## 3. Login
1. User submits email and password.
2. Backend checks if the user exists and verifies the password using bcrypt.
3. Backend checks if the user's `status` is `'banned'`. If banned, login is rejected.
4. If the user is a donor and `isVerified` is false, it triggers the OTP flow again.
5. If the user is a charity and `charityStatus` is `'pending'`, it triggers the Pending Review flow.
6. If all checks pass, backend issues a JWT.
7. Frontend stores the JWT in `localStorage` (`token`) and updates `AuthContext`.

## 4. Google OAuth
1. Frontend calls Firebase `signInWithPopup(auth, googleProvider)`.
2. Firebase returns a Google User object.
3. Frontend sends the Google email, name, and avatar to `/api/auth/google`.
4. Backend searches for a user by email.
   * If found: Issues a JWT.
   * If not found: Creates a new user with `provider: 'google'` and issues a JWT.
5. Frontend stores the JWT.

## 5. Session Management (AuthContext)
The `AuthContext.tsx` handles the frontend session state.
* On app load, it checks for a token in `localStorage`.
* If found, it makes a silent request to `/api/auth/me` to fetch fresh user data.
* Axios is configured via an interceptor (`src/app/utils/api.ts`) to automatically attach the `Authorization: Bearer <token>` header to all requests.
* If any API request returns a `401 Unauthorized`, the interceptor clears the token and logs the user out (unless the failing request was the initial `/auth/me` check, which prevents infinite reload loops).

## 6. Logout
1. Frontend calls `logout()` from `AuthContext`.
2. The `/api/auth/logout` endpoint is hit (optional server-side invalidation if implemented).
3. The JWT is removed from `localStorage`.
4. The user is redirected to the login or home page.
