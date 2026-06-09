# Charity Verification Flow

To maintain trust on the platform, charities cannot immediately interact with donors upon registration. They must undergo a manual verification process.

## 1. Registration
During signup, if a user selects the "Charity" account type, they are required to provide additional information:
* `charityCategory`: The sector they operate in.
* `charityDescription`: A brief overview of their mission.
* `charityRegistrationNumber`: Official government/NGO registration ID.
* `charityLicenseDocument`: A URL/path to an uploaded document proving their legitimacy.

## 2. Pending State
Upon successful creation in the database:
* The user's `role` is set to `'user'`.
* The user's `user_type` is set to `'charity'`.
* The user's `charityStatus` is set to `'pending'`.
* The frontend directs the user to a "Pending Review" screen. They cannot access the main dashboard, create campaigns, or appear in search results.

## 3. Admin Review
* An Admin logs into the Admin Dashboard (`/dashboard/admin`).
* The Admin navigates to the "Pending Charities" section.
* This section fetches users from the database where `charityStatus === 'pending'`.
* The Admin reviews the provided details and the license document.

## 4. Approval or Rejection
The Admin can click **Approve** or **Reject**.
* **Approve:** The backend updates the user's `charityStatus` to `'verified'`.
* **Reject:** The backend updates the user's `charityStatus` to `'rejected'`.

## 5. Post-Verification (Verified State)
Once a charity is `verified`:
* The next time they log in (or refresh), the frontend detects the `verified` status.
* They are granted access to the Charity Dashboard (`/dashboard/charity`).
* They appear in the `/api/users/contactable-charities` endpoint and the "Find Charities" public directory.
* They can now create campaigns, post volunteer opportunities, and receive messages from donors.

## Data Privacy
While in the pending state, the charity's details are strictly private and only visible to Admins. Even after verification, sensitive documents (`charityLicenseDocument`) remain accessible only to Admins, while the description and category become public.
