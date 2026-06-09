# Database Models

The backend utilizes MongoDB with Mongoose. Below are the primary models defining the schema.

## 1. User (`backend/src/models/User.model.js`)
* **Purpose:** Stores all account types (Donor, Charity, Admin).
* **Important Fields:**
  * `email`, `password` (hashed with bcrypt), `name`.
  * `role`: Enum `['user', 'admin']`. Defaults to `user`.
  * `user_type`: Enum `['donor', 'charity']`.
  * `status`: Enum `['active', 'banned']`.
  * `wishlist`: Array of ObjectIds referencing `Donation`.
  * `otp`, `otpExpires`, `isVerified`: Used for email validation.
* **Charity-Specific Fields:**
  * `charityStatus`: Enum `['pending', 'verified', 'rejected', null]`.
  * `charityRegistrationNumber`, `charityLicenseDocument`.
* **Privacy:** Passwords and OTPs are stripped from JSON responses via a custom `toJSON` transform.

## 2. Donation (`backend/src/models/Donation.model.js`)
* **Purpose:** Represents a physical item offered for donation.
* **Important Fields:**
  * `title`, `description`, `category`, `condition`, `location`, `image`.
  * `status`: Enum representing the lifecycle (e.g., `قيد المراجعة`, `متاح`, `محجوز`, `تم التسليم`).
  * `donor`: ObjectId referencing `User`.
  * `claimedBy`: ObjectId referencing `User` (the receiver).

## 3. Campaign (`backend/src/models/Campaign.model.js`)
* **Purpose:** Represents a monetary or hybrid fundraising effort.
* **Important Fields:**
  * `title`, `description`, `target` (financial goal), `current` (amount raised).
  * `status`: Enum `['pending_review', 'active', 'completed', 'cancelled']`.
  * `createdBy` and `charityId`: ObjectIds referencing `User`.
  * `demoTransactions`: Array of simulated payment records.
* **Virtuals:** `progressPercent` calculates `(current / target) * 100`.

## 4. Conversation (`backend/src/models/Conversation.model.js`)
* **Purpose:** Defines the chat container between two users.
* **Important Fields:**
  * `requester_id`, `receiver_id`: ObjectIds referencing `User`.
  * `post_id`: Optional ObjectId referencing `CommunityRequest` (for context).
  * `status`: Enum `['pending', 'active', 'rejected', 'blocked', 'closed']`.
  * `phone_visible`: Boolean indicating if contact info was shared.
* **Indexes:** A compound index on `requester_id`, `receiver_id`, and `post_id` prevents duplicate active chats for the same context.

## 5. Message (`backend/src/models/Message.model.js`)
* **Purpose:** Stores individual chat messages.
* **Important Fields:**
  * `conversation_id`: ObjectId referencing `Conversation`.
  * `sender_id`: ObjectId referencing `User`.
  * `message`: The actual text payload.
  * `is_read`: Boolean.

## 6. Report (`backend/src/models/Report.model.js`)
* **Purpose:** Stores user-submitted flags for moderation.
* **Important Fields:**
  * `reporter`: ObjectId referencing `User`.
  * `type`: Enum `['user', 'donation', 'campaign', 'message', 'other']`.
  * `targetId`: ObjectId of the flagged content.
  * `reason`: Text explanation.
  * `status`: Enum `['pending', 'reviewed', 'resolved', 'dismissed']`.

## 7. VolunteerOpportunity & CommunityRequest
* **Purpose:** Additional models handling specific sub-features. `VolunteerOpportunity` allows charities to post roles, while `CommunityRequest` allows users to post needs. Both link back to `User` ObjectIds as their creators.
