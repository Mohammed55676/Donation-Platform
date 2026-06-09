# API Reference

*Note: All endpoints prefixed with `/api`. Most endpoints require a valid JWT passed in the `Authorization: Bearer <token>` header.*

## 1. Auth (`/api/auth`)
| Method | Endpoint | Auth Req | Role Req | Description |
|---|---|---|---|---|
| POST | `/login` | No | None | Login with email/password. May return OTP requirements. |
| POST | `/register` | No | None | Register a new donor or charity. |
| POST | `/verify-otp` | No | None | Verifies OTP and returns a JWT. |
| POST | `/resend-otp` | No | None | Resends the OTP to the provided email. |
| POST | `/google` | No | None | Authenticates using a Google OAuth payload. |
| POST | `/logout` | No | None | Clears session/token on the client. |
| GET  | `/me` | Yes | None | Returns the currently authenticated user's profile. |

## 2. Users (`/api/users`)
| Method | Endpoint | Auth Req | Role Req | Description |
|---|---|---|---|---|
| GET | `/` | Yes | Admin | Lists all users. |
| POST | `/` | Yes | Admin | Creates a user manually. |
| GET | `/contactable-charities`| Yes | None | Returns a list of verified charities available for chat. |
| GET | `/:id` | Yes | None | Fetches a specific user profile. |
| PUT | `/:id` | Yes | None | Updates a user's profile details. |
| PUT | `/:id/status` | Yes | Admin | Bans or unbans a user. |
| DELETE| `/:id` | Yes | Admin | Deletes a user account. |
| POST | `/:id/wishlist` | Yes | None | Toggles a donation item in the user's wishlist. |

## 3. Charity Directory (`/api/charity`)
| Method | Endpoint | Auth Req | Role Req | Description |
|---|---|---|---|---|
| GET | `/` | No | None | Lists verified charities for the public directory. |

## 4. Donations (`/api/donations`)
| Method | Endpoint | Auth Req | Role Req | Description |
|---|---|---|---|---|
| GET | `/` | No | None | Lists physical item donations. |
| GET | `/:id` | No | None | Gets a specific donation. |
| POST | `/` | Yes | None | Creates a new item donation listing. |
| PUT | `/:id` | Yes | None | Updates a donation listing. |
| PUT | `/:id/status` | Yes | Admin | Updates the status of a donation. |
| DELETE| `/:id` | Yes | Admin | Deletes a donation listing. |

## 5. Campaigns (`/api/campaigns`)
| Method | Endpoint | Auth Req | Role Req | Description |
|---|---|---|---|---|
| GET | `/` | No | None | Lists active fundraising campaigns. |
| GET | `/:id` | No | None | Gets a specific campaign. |
| POST | `/` | Yes | Charity/Admin | Creates a new campaign. |
| PUT | `/:id` | Yes | Creator/Admin | Updates a campaign. |
| DELETE| `/:id` | Yes | Admin | Deletes a campaign. |
| POST | `/:id/donate` | Yes | None | Simulates a monetary donation to the campaign. |

## 6. Conversations & Messages (`/api/conversations`)
| Method | Endpoint | Auth Req | Role Req | Description |
|---|---|---|---|---|
| GET | `/` | Yes | None | Gets user's active conversations. |
| POST | `/request` | Yes | None | Initiates a chat request, avoiding duplicates. |
| GET | `/:id/messages` | Yes | None | Fetches chat history for a conversation. |

## 7. Reports (`/api/reports`)
| Method | Endpoint | Auth Req | Role Req | Description |
|---|---|---|---|---|
| POST | `/` | Yes | None | Creates a report against a user, campaign, or donation. |

## 8. Admin (`/api/admin`)
| Method | Endpoint | Auth Req | Role Req | Description |
|---|---|---|---|---|
| GET | `/stats` | Yes | Admin | Gets platform statistics for the dashboard. |
| GET | `/pending-charities`| Yes | Admin | Lists charities waiting for verification. |
| PUT | `/verify-charity/:id`| Yes | Admin | Approves or rejects a charity. |
