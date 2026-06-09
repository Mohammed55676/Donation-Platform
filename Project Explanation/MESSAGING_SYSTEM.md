# Messaging System

The Donation Platform features a secure, real-time messaging system built with Socket.IO and MongoDB. The system prioritizes user privacy and prevents spam through strict role-based rules.

## 1. Architecture
* **Frontend:** React uses the `socket.io-client` library. It connects to the backend only when a user is authenticated.
* **Backend:** Express integrates `socket.io`. A custom middleware intercepts the connection handshake to verify the JWT.
* **Database:** MongoDB stores the chat history using two models:
  * `Conversation`: Tracks the metadata between two users (and optionally a specific community request `post_id`).
  * `Message`: Stores the actual text payload, linked to a `Conversation`.

## 2. Initiating a Chat
Chats cannot be started arbitrarily by searching for a username. They must be initiated through specific flows:
1. **From "Find Charities":** A donor views the public directory of verified charities and clicks "Contact".
2. **From a Community Request:** A user sees a post asking for help and clicks "Reply/Contact" to offer assistance.

## 3. Duplicate Prevention
Before creating a new conversation, the backend (`conversationController.createRequest`) checks the database. If an active or pending conversation already exists between the `requester_id`, `receiver_id`, and `post_id`, it returns the existing conversation ID instead of creating a duplicate.

## 4. Real-time Communication
1. Users join a Socket.IO room defined by their `userId`.
2. To send a message, the client emits `sendMessage` with the `receiverId` and `text`.
3. The server saves the message to MongoDB.
4. The server emits `receiveMessage` to the `receiverId`'s room and the `senderId`'s room.
5. Clients listen for `receiveMessage` and append the new message to their state.

## 5. Privacy Rules
* **Donor-to-Donor:** Strictly forbidden unless responding to a specific community request.
* **Charity-to-Donor:** Charities cannot initiate the first message. They can only reply once a donor has started the conversation.
* **Phone Numbers:** By default, user phone numbers are hidden. They can only be revealed if a user explicitly agrees to share them within the context of a conversation (represented by `phone_visible` in the Conversation schema).

## 6. Safety Features (Report & Block)
* **Report User:** Users can flag a conversation or user. This creates a `Report` entry in the database for admins to review.
* **Block User:** Users can block someone they are chatting with. This updates the conversation `status` to `blocked`. The backend prevents any further messages from being sent between these two users across any conversation.

## 7. The Conversations Page
The frontend (`/messages`) displays a list of active conversations on a sidebar. Selecting a conversation loads the history (fetched via REST API) and connects the real-time Socket.IO listeners for that chat.
