# User Roles and Permissions

The platform uses a combination of `role` and `user_type` to determine access levels and capabilities.

## 1. Donor
* **Database Representation:** `role: 'user'`, `user_type: 'donor'`
* **Capabilities:**
  * Browse verified charities, active campaigns, and community requests.
  * Donate money (demo flow) or list physical items for donation.
  * Apply for volunteer opportunities.
  * Start conversations with **verified charities** or users who posted a community request.
  * Report or block other users.
* **Restrictions:**
  * Cannot contact another donor directly without a community request context.
  * Cannot contact an Admin through the public chat system.
  * Cannot access the Admin Dashboard or Charity Dashboard.
  * Cannot create campaigns or volunteer opportunities.

## 2. Charity
* **Database Representation:** `role: 'user'`, `user_type: 'charity'`
* **Verification Status:** Relies on the `charityStatus` field (`pending`, `verified`, `rejected`).
* **Capabilities (Pending):**
  * Can log in and view their profile.
  * Cannot perform public actions or be seen in the directory. Must wait for admin approval.
* **Capabilities (Verified):**
  * Appear in the public "Find Charities" directory.
  * Create and manage fundraising campaigns.
  * Post volunteer opportunities.
  * Receive and reply to messages from donors.
* **Restrictions:**
  * Cannot freely initiate messages to donors without a prior context (e.g., the donor must reach out first, or respond to a request).
  * Cannot access the Admin Dashboard.

## 3. Admin
* **Database Representation:** `role: 'admin'` (user_type is generally irrelevant, but defaults to donor).
* **Capabilities:**
  * Full access to the Admin Dashboard.
  * Approve or reject pending charities.
  * Ban or unban any user (`status: 'banned'`).
  * Delete users, campaigns, or donations.
  * Review platform reports.
* **Restrictions:**
  * Excluded from the public "Find Charities" or general contact discovery. The chat system is not designed for public-to-admin support messaging (admins moderate from the dashboard).

## Role-Based Route Protection (Frontend)
The React frontend uses a `<ProtectedRoute>` wrapper to enforce these rules on the client side:
```tsx
// Example: Admin Only
<ProtectedRoute allowedRole="admin">
  <AdminDashboard />
</ProtectedRoute>

// Example: Charity Only
<ProtectedRoute allowedRole="user" allowedUserType="charity">
  <CharityDashboard />
</ProtectedRoute>
```

## Role-Based Route Protection (Backend)
The Express backend uses the `requireRole` middleware:
```javascript
const { requireRole } = require('../middleware/auth.middleware');
router.get('/admin-stats', protect, requireRole('admin'), getStats);
```
