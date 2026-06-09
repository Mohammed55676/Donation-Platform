# Manual Testing Guide

This guide outlines a step-by-step checklist to manually verify the core flows of the Donation Platform.

## 1. Registration & Authentication
* [ ] **Register Donor:** Go to `/signup`. Create a user, selecting "Donor". Ensure it redirects to the OTP screen (or logs in directly if OTP is bypassed in dev).
* [ ] **Register Charity:** Go to `/signup`. Create another user, selecting "Charity". Fill in the extra fields (Category, License).
* [ ] **Pending Review:** After charity signup, verify the frontend redirects to the "Pending Review" page. Attempting to navigate to `/dashboard/charity` should fail.
* [ ] **Login Validation:** Log out, then attempt to log in with an incorrect password. Verify the error message.
* [ ] **Google OAuth:** Click the "Sign in with Google" button. Verify it creates an account or logs into an existing one smoothly.

## 2. Admin & Verification Flow
* [ ] **Admin Login:** Log in using an account with `role: 'admin'`. Navigate to the Admin Dashboard (`/dashboard/admin`).
* [ ] **Charity Approval:** Find the newly registered charity in the "Pending Charities" list. Click "Approve".
* [ ] **Verify Approval Effect:** Log out and log back in as the Charity. Verify access to the Charity Dashboard is now granted.

## 3. Public Directories & Discovery
* [ ] **Find Charities:** Log in as a Donor. Navigate to the "Find Charities" or "Community" section.
* [ ] **Visibility Check:** Verify that the approved charity appears in the list.
* [ ] **Pending Charity Hidden:** Ensure that no charities with `charityStatus: 'pending'` appear in this public list.

## 4. Messaging & Privacy
* [ ] **Start Chat:** As the Donor, click "Contact" on the verified charity's profile. Verify it redirects to the Messages page (`/messages`) and opens a new chat.
* [ ] **Send Message:** Type a message and send. Verify it appears in the chat log.
* [ ] **Receive Message:** Log in as the Charity in a different browser/incognito window. Navigate to Messages. Verify the incoming message is present.
* [ ] **Reply:** As the Charity, reply to the Donor. Verify the message appears instantly for the Donor (Socket.IO).
* [ ] **Duplicate Prevention:** As the Donor, try to click "Contact" on the same charity again. Verify it routes to the *existing* chat rather than creating a new database entry.
* [ ] **Donor-to-Donor Restrictions:** Verify there is no UI button for a Donor to contact another Donor directly outside of a specific community request.

## 5. Donations & Campaigns
* [ ] **Add Donation:** As a Donor, navigate to "Add Donation". Fill out the form. Verify it appears in the Donations list with status "Under Review" or "Available".
* [ ] **Create Campaign:** As a verified Charity, create a new fundraising campaign. Verify it appears on the public Campaigns page.
* [ ] **Wishlist:** As a Donor, add a donation item to your Wishlist. Check your profile to ensure it was saved.

## 6. Safety Tools
* [ ] **Report User:** Inside a chat, click the Report button. Fill out the reason.
* [ ] **Check Report:** Log in as Admin. Navigate to Reports on the dashboard. Verify the report appears.
* [ ] **Block User:** Inside a chat, click Block.
* [ ] **Verify Block:** Attempt to send a message to the blocked user. Verify the backend rejects it or the UI prevents typing.
