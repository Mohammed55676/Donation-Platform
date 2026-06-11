# Donation Platform

## Overview
The Donation Platform is a comprehensive web application designed to connect generous donors with verified charities and individuals in need. It facilitates the donation of money, items (clothes, food, furniture, books, etc.), and volunteer time, while ensuring a secure and privacy-focused environment for all users. The system features a robust real-time messaging system, charity verification workflow, and an administration dashboard to oversee platform activity.

## Problem Statement
In many communities, individuals willing to donate items or money struggle to find verified, trustworthy charities or individuals who genuinely need help. Additionally, direct communication between donors and unverified individuals can sometimes lead to privacy concerns, harassment, or unverified claims. Charities also lack a centralized platform to manage donation requests, campaigns, and volunteers efficiently.

## Solution
This platform solves these issues by acting as a secure intermediary. It enforces a strict charity verification process, ensuring donors only interact with legitimate organizations. It provides a structured way to list donations, create fundraising campaigns, request community help, and volunteer. The built-in privacy-first messaging system allows donors and verified charities to communicate securely without exposing personal contact information by default.

## User Roles
* **Donor (`user` role, `donor` type):** The primary user who can browse campaigns, make donations, offer items, volunteer, and chat with verified charities. Donors cannot directly message other donors or unverified users to protect privacy.
* **Charity (`user` role, `charity` type):** Organizations that must undergo a verification process. Once verified by an admin, they can create campaigns, receive donations, and communicate with donors.
* **Admin (`admin` role):** Platform moderators who manage users, approve or reject charity registrations, oversee reported content, and maintain the overall health of the platform through a dedicated dashboard.

## Main Features
* **Authentication & OTP:** Secure login and registration with email/password and Google OAuth, complemented by OTP verification.
* **Charity Verification Flow:** A structured process for charities to submit licenses and await admin approval before gaining public visibility.
* **Item & Monetary Donations:** Support for donating physical items with condition tracking, as well as monetary campaigns with progress bars.
* **Volunteer Opportunities:** Charities can post volunteer roles, and users can apply to help.
* **Community Requests:** A space for specific needs or requests from the community.
* **Real-time Chat:** A Socket.IO powered messaging system that respects privacy rules and role-based restrictions.
* **Admin Dashboard:** Comprehensive tools for managing users, charities, donations, and reports.
* **Reports & Blocking:** Users can report malicious behavior or block others, enhancing community safety.

## Tech Stack and Main Libraries
The project utilizes a modern MERN-like stack (MongoDB, Express, React, Node).

* **Frontend:** React 19, Vite, Tailwind CSS v4, Context API, React Router v7.
* **Backend:** Node.js, Express.js, Socket.IO for real-time features.
* **Database:** MongoDB with Mongoose ODM.
* **Authentication:** JSON Web Tokens (JWT) and Firebase Authentication.

> 📚 **Deep Dive:** For a full technical breakdown of the architecture, installed packages, and reasons behind these technical choices, please read the [Tech Stack & Packages](Project%20Explanation/TECH_STACK_AND_PACKAGES.md) and [Technical Decisions Rationale](Project%20Explanation/TECHNICAL_DECISIONS.md) documents.

## Project Structure
```text
/ (root)
├── backend/                # Express + MongoDB backend
│   ├── src/
│   │   ├── controllers/    # Route logic
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth and validation
│   │   └── server.js       # App entry & Socket.IO config
│   └── package.json        # Backend dependencies
├── src/                    # React frontend
│   ├── app/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Global state (Auth)
│   │   ├── pages/          # Route views
│   │   ├── services/       # API integration
│   │   ├── utils/          # Helpers (Axios config)
│   │   └── routes.tsx      # Application routing
│   └── main.tsx            # React entry point
└── package.json            # Frontend dependencies
```

## Main User Flows
* **Donor Flow:** A donor registers, verifies their email via OTP, browses active campaigns or verified charities, and either donates directly or starts a secure chat to arrange physical item handoffs.
* **Charity Flow:** A charity registers and provides licensing documents. Their status is set to `pending`. Once an admin approves them, their status changes to `verified`. They can then create campaigns, receive items, and respond to donor messages.
* **Admin Flow:** An admin logs into the secure dashboard to review pending charities, monitor platform statistics, handle user reports, and manage all platform content.
* **Messaging Flow:** Users initiate conversations through specific contexts (e.g., a community request or finding a verified charity). The system checks role permissions before creating a Socket.IO chat room to prevent spam and unauthorized contact.

## Installation
The project is split into two independent npm packages (frontend and backend).

1. Clone the repository.
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

## Environment Variables
Create `.env` files in both the root and `backend/` directories.

**Frontend (`/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

**Backend (`/backend/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/donation_platform
JWT_SECRET=your_jwt_secret
CLIENT_ORIGIN=http://localhost:5173
```

## Running Locally

1. Start the backend server (from the `backend/` directory):
   ```bash
   npm run dev
   ```
   *The backend will run on port 5000.*

2. Start the frontend development server (from the root directory):
   ```bash
   npm run dev
   ```
   *The frontend will be accessible at http://localhost:5173.*

## API Overview
The backend provides a RESTful API grouped into several modules:
* `/api/auth` - Login, registration, OTP, Google OAuth.
* `/api/users` - Profile management, wishlist, contactable charities.
* `/api/charity` - Public charity listings.
* `/api/donations` - Physical item donation management.
* `/api/campaigns` - Fundraising campaign management.
* `/api/conversations` & `/api/messages` - Real-time chat integration.
* `/api/admin` - Administrative controls.
* *(See `Project Explanation/API_REFERENCE.md` for full details).*

## Security and Privacy
The platform prioritizes user privacy. Donors cannot view other donors' contact information or initiate chats with them. Charities must be verified before they appear in public directories. Phone numbers and email addresses are hidden by default in chats unless explicitly shared by the user. Rate limiting is enforced globally and strictly on authentication endpoints to prevent abuse.

## Manual Testing
For a comprehensive guide on how to test the platform's core flows, please refer to the [Manual Testing Guide](Project%20Explanation/MANUAL_TESTING_GUIDE.md).

## Future Improvements
* Integration with a real payment gateway (e.g., Stripe, PayPal) for monetary campaigns.
* Enhanced AI-based matching between donor items and community requests.
* Mobile application development (React Native).
* Automated verification checks against public charity registries.
* Advanced analytics and reporting exports for charities.
