# Donation Platform — Backend API

REST API built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

---

## 🗂 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                        # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── donation.controller.js
│   │   ├── campaign.controller.js
│   │   ├── volunteer.controller.js
│   │   └── community.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js           # JWT verification
│   │   ├── role.middleware.js           # RBAC
│   │   ├── validate.middleware.js       # Joi validation
│   │   └── error.middleware.js          # Central error handler
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Donation.model.js
│   │   ├── Campaign.model.js
│   │   ├── VolunteerOpportunity.model.js
│   │   └── CommunityRequest.model.js
│   ├── routes/
│   │   ├── index.js                     # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── donation.routes.js
│   │   ├── campaign.routes.js
│   │   ├── volunteer.routes.js
│   │   └── community.routes.js
│   ├── utils/
│   │   ├── apiResponse.js               # Standardised JSON helpers
│   │   └── pagination.js               # Pagination parser
│   └── server.js                        # App entry point
├── .env.example
└── package.json
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your MongoDB Atlas URI, JWT secret, etc.
```

### 3. Seed Database (Optional but Recommended)
Populate your database with sample users, donations, campaigns, and volunteer opportunities.
```bash
npm run seed
# Or manually run: node src/seed.js
```

### 3. Run in development

```bash
npm run dev       # starts with nodemon (auto-restarts on file changes)
```

### 4. Run in production

```bash
npm start
```

---

## 🔐 Environment Variables

| Variable | Example | Description |
|---|---|---|
| `PORT` | `5000` | HTTP server port |
| `NODE_ENV` | `development` | `development` or `production` |
| `MONGODB_URI` | `mongodb://localhost:27017/donation_platform` | MongoDB connection string |
| `JWT_SECRET` | `super_secret_key_64_chars_min` | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Frontend origin for CORS |

---

## 📡 API Endpoints

### Auth  `/api/auth`
| Method | Path | Auth | Body |
|---|---|---|---|
| `POST` | `/register` | — | `{name, email, password}` |
| `POST` | `/login` | — | `{email, password}` |
| `POST` | `/logout` | ✅ | — |
| `GET` | `/me` | ✅ | — |

### Users  `/api/users`
| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET` | `/` | Admin | `?page&limit&search&role&status` |
| `GET` | `/:id` | ✅ | — |
| `PUT` | `/:id` | ✅ | Self or admin |
| `PUT` | `/:id/status` | Admin | `{status: "active"/"banned"}` |
| `DELETE` | `/:id` | Admin | — |

### Donations  `/api/donations`
| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET` | `/` | — | `?page&limit&category&urgency&status&location&search&sort` |
| `GET` | `/:id` | — | — |
| `POST` | `/` | ✅ | Creates in "قيد المراجعة" status |
| `PUT` | `/:id` | ✅ | Owner or admin |
| `PUT` | `/:id/status` | Admin | `{status}` |
| `DELETE` | `/:id` | ✅ | Owner or admin |

### Campaigns  `/api/campaigns`
| Method | Path | Auth |
|---|---|---|
| `GET` | `/` | — |
| `GET` | `/:id` | — |
| `POST` | `/` | Admin |
| `PUT` | `/:id` | Admin |
| `DELETE` | `/:id` | Admin |

### Volunteer Opportunities  `/api/volunteer`
| Method | Path | Auth |
|---|---|---|
| `GET` | `/` | — |
| `GET` | `/:id` | — |
| `POST` | `/` | Admin |
| `PUT` | `/:id` | Admin |
| `DELETE` | `/:id` | Admin |
| `POST` | `/:id/apply` | ✅ |

### Community Requests  `/api/community`
| Method | Path | Auth |
|---|---|---|
| `GET` | `/` | ✅ |
| `GET` | `/:id` | ✅ |
| `POST` | `/` | ✅ |
| `PUT` | `/:id` | ✅ (owner/admin) |
| `DELETE` | `/:id` | ✅ (owner/admin) |
| `POST` | `/:id/like` | ✅ (toggle) |

---

## 🛡️ Security

- **bcrypt** (12 rounds) — password hashing
- **JWT** (HS256) — stateless authentication
- **helmet** — HTTP security headers
- **CORS** — restricted to `CLIENT_ORIGIN`
- **express-rate-limit** — 20 req/15min on auth, 200 req/15min globally
- **Joi** — strict input validation + unknown field stripping
- Centralized error handler hides stack traces in production

---

## 📦 Response Format

All responses follow a consistent shape:

```json
// Success
{ "success": true, "message": "...", "data": {}, "meta": {} }

// Error
{ "success": false, "error": "...", "details": [] }
```

---

## 🔗 Connecting to the Frontend

Set `VITE_API_URL=http://localhost:5000/api` in the frontend `.env`, then use:

```js
const res = await fetch(`${import.meta.env.VITE_API_URL}/donations`);
```

Include the JWT in protected requests:
```js
headers: { Authorization: `Bearer ${token}` }
```
