/**
 * src/config/firebaseAdmin.js
 * Lazily initializes the Firebase Admin SDK, used to verify Google (Firebase)
 * ID tokens server-side. Credentials come from environment variables so no
 * service-account file is committed to the repo.
 *
 * Required env vars (from your Firebase service account JSON):
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY   — paste the key with its literal "\n" escapes intact
 *
 * Returns the initialized admin namespace, or null if credentials are absent
 * (so the rest of the app can boot without Google sign-in configured).
 */
const admin = require('firebase-admin');

let _initialized = false;

function getFirebaseAdmin() {
  if (_initialized) return admin;

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let   privateKey  = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null; // Google sign-in not configured on this environment
  }

  // Env vars store the PEM key with escaped newlines; restore real newlines.
  privateKey = privateKey.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
  _initialized = true;
  return admin;
}

module.exports = { getFirebaseAdmin };
