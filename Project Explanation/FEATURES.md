# Features

This document outlines the primary features of the Donation Platform.

## 1. Authentication & Onboarding
* **Email & Password Registration:** Standard signup with strong password enforcement.
* **OTP Verification:** Email verification using a simulated OTP code (or actual email integration if configured).
* **Google OAuth:** One-click login using Firebase Authentication.
* **Password Reset:** Standard forgot/reset password flow.
* **Profile Management:** Users can update their avatar, phone number, and location.

## 2. Donor Registration & Experience
* Donors register and gain immediate access to browse verified charities, active campaigns, and donation requests.
* They can maintain a "Wishlist" of favorite physical donations.
* A personalized Dashboard shows their activity history.

## 3. Charity Registration & Verification
* Charities select "Charity" during registration and must provide additional fields: Category, Description, Registration Number, and a License Document (image/PDF).
* Their initial `charityStatus` is set to `pending`.
* While pending, they cannot create campaigns or appear in public directories. They see a "Pending Review" screen.
* Admins review the documents and change the status to `verified` or `rejected`.

## 4. Item Donations (Marketplace)
* Donors can list physical items (e.g., clothes, furniture, books).
* Each listing includes images, condition, location, urgency, and category.
* Items have statuses: `قيد المراجعة` (Under Review), `متاح` (Available), `محجوز` (Reserved), `تم التسليم` (Delivered).

## 5. Campaigns (Monetary Fundraising)
* Verified charities can create fundraising campaigns with a monetary target.
* Campaigns support an urgency level and timeline (start/end dates).
* Users can view progress bars indicating how close the campaign is to its goal.
* *Note: Payment processing is currently a simulated demo flow on the frontend.*

## 6. Volunteer Opportunities
* Charities can post volunteer roles with titles, descriptions, required skills, and dates.
* Donors can browse these listings and apply directly through the platform.

## 7. Community Requests
* A space for general community needs (e.g., "Need a wheelchair in Cairo").
* Other users can respond to these requests, initiating a conversation to fulfill the need.

## 8. Real-time Chat & Messaging
* Secure 1-on-1 messaging powered by Socket.IO.
* Users can initiate chats from a "Find Charities" directory or from specific community requests.
* The system prevents duplicate active conversations between the same two users for the same context.
* Features read receipts and real-time updates across multiple tabs.

## 9. Reports & Blocking
* Users can report messages, users, or specific posts (campaigns/donations) to the admin.
* Users can block other users, which prevents further messages from being sent or received between the two parties.

## 10. Admin Dashboard
* A comprehensive control panel restricted to users with the `admin` role.
* Features include:
  * Platform statistics overview.
  * User management (ban/unban).
  * Charity verification queue (Approve/Reject).
  * Report moderation.

## 11. Find Charities Directory
* A public directory listing only `verified` charities.
* Donors can filter charities by category and initiate contact directly from this page.

## 12. Notifications
* A page dedicated to alerting users about status changes (e.g., a charity being verified, or a donation being accepted). *Note: Implementation depth may vary based on recent codebase updates.*
