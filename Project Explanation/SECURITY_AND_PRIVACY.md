# Security and Privacy

The Donation Platform handles sensitive interactions between donors and individuals/organizations in need. Therefore, security and privacy are core architectural considerations.

## 1. Authentication Security
* **Password Hashing:** User passwords are never stored in plain text. They are hashed using `bcrypt` (with a salt factor of 10) in a pre-save Mongoose hook.
* **JWT:** Sessions are managed via JSON Web Tokens. The tokens are signed with a strong secret and must be kept secure on the client (currently in `localStorage`).
* **Rate Limiting:** To prevent brute-force attacks on passwords or OTPs, the Express backend applies a strict rate limiter (20 requests per 15 minutes) specifically to the `/api/auth/login` and `/register` endpoints.

## 2. Role-Based Access Control (RBAC)
* The system enforces authorization rules at the route level using the `requireRole` middleware.
* Operations that modify global state, delete users, or approve charities are strictly isolated to the `admin` role.
* The frontend mirrors these checks using the `<ProtectedRoute>` wrapper to prevent unauthorized access to sensitive UI pages (e.g., `AdminDashboard`).

## 3. Charity Verification Workflow
* To prevent fraudulent organizations from soliciting donations, any user registering as a `charity` is immediately placed in a `pending` state.
* Their profile is hidden from the public API (`/api/charity` and `/api/users/contactable-charities`) until an administrator manually reviews their uploaded license documents and approves them.

## 4. Privacy-First Messaging
* **No Public Directories for Donors:** There is no "Find Users" page. Donors cannot be discovered or messaged randomly.
* **Restricted Initialization:** A charity cannot initiate a conversation with a donor out of nowhere. The donor must make the first contact (e.g., by clicking "Contact" on the charity's public profile).
* **Phone & Email Masking:** The platform acts as a secure intermediary. A user's phone number and email are not exposed to the other party in a chat by default. They can only be shared if a user chooses to do so within the conversation logic.

## 5. Private Fields and API Exposure
* The `User.model.js` utilizes a custom `toJSON` transform to ensure sensitive fields (`password`, `otp`, `otpExpires`) are stripped from the object before it is ever sent in an HTTP response.
* Charity license documents (`charityLicenseDocument`) are not exposed in public lists, preserving organizational privacy.

## 6. Report and Block Features
* Users have built-in tools to manage their own safety.
* **Blocking:** A user can block another user. The system updates the conversation status to `blocked`, and the backend will reject any future `sendMessage` events between the two ObjectIds.
* **Reporting:** Users can report suspicious behavior to the admin queue.

## 7. Known Security Limitations & Future Improvements
* **Token Storage:** Storing JWTs in `localStorage` makes them susceptible to XSS (Cross-Site Scripting) attacks. Moving the token to a secure, HTTP-only cookie is recommended for production.
* **File Upload Security:** Uploaded documents (like charity licenses) should be scanned for malware and stored in a private cloud bucket (like AWS S3) rather than a public local directory.
* **Content Moderation:** Currently, messages and campaign descriptions are not automatically filtered. Integrating an AI moderation API could help prevent inappropriate content before it requires manual reporting.
