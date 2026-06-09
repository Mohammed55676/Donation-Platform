# Technical Decision Rationale

This document explains the reasoning behind every major technology, architectural choice, and package used in the Donation Platform. It details what was used, why it was chosen, what alternatives were rejected, and the tradeoffs involved.

## 1. React for Frontend

### What it is
React is a JavaScript library for building user interfaces using a component-based architecture.

### Where it is used in this project
Throughout the entire frontend (`src/app/`, `src/main.tsx`).

### Why we used it
React allows us to build a dynamic Single Page Application (SPA). By using reusable components (e.g., `Navbar`, `DonationCard`, `ProtectedRoute`), we can keep the codebase organized, maintainable, and avoid rewriting HTML. It provides a highly responsive experience for the user.

### Why not alternatives
* **Plain HTML/CSS/JS:** Too difficult to manage state (like the shopping cart/wishlist or real-time chat) across multiple pages. Code duplication would be high.
* **Angular / Vue:** React has a massive ecosystem, extensive documentation, and is highly favored in the industry. It was chosen for familiarity and library support (like shadcn/ui).

### Advantages
* Huge ecosystem of libraries.
* Reusable components make scaling the UI easy.
* Virtual DOM provides fast updates.

### Limitations
* Requires a build step.
* Can be complex for simple static pages.

### Suitability for this project
Perfect for a dynamic donation platform where state (user session, chat messages, donation filters) changes frequently.

### Future improvement
Migrating to a meta-framework like Next.js for Server-Side Rendering (SSR) if SEO becomes a critical priority.

---

## 2. Vite as Frontend Build Tool

### What it is
Vite is a modern build tool that provides a remarkably fast development environment and bundles code for production.

### Where it is used in this project
Frontend root (`vite.config.ts`, `package.json` scripts).

### Why we used it
Vite offers instant server start and extremely fast Hot Module Replacement (HMR) during development. It makes building React applications significantly faster than older bundlers.

### Why not alternatives
* **Create React App (CRA):** Deprecated, slow, and uses Webpack which takes a long time to start up as the project grows.
* **Next.js:** Next.js is a full-stack framework. We specifically wanted a decoupled architecture (separate Express backend and React SPA frontend) for learning and structural purposes.

### Advantages
* Near-instant dev server startup.
* Out-of-the-box support for TypeScript and Tailwind CSS v4.

### Limitations
* Strictly a Client-Side Rendering (CSR) tool (by default); poor for SEO compared to SSR.

### Suitability for this project
Excellent for a graduation project/SPA where rapid development iteration is more important than search engine indexing.

---

## 3. Tailwind CSS

### What it is
A utility-first CSS framework that allows styling elements directly in the HTML/JSX using predefined classes (e.g., `flex`, `text-center`, `p-4`).

### Where it is used in this project
Entire frontend (components, pages).

### Why we used it
It drastically speeds up UI development by eliminating the need to write custom CSS files and invent class names. It ensures a consistent design system (colors, spacing) out of the box.

### Why not alternatives
* **Plain CSS / SCSS:** Hard to maintain, prone to dead code, requires context switching between JS and CSS files.
* **Bootstrap:** Looks generic. Tailwind allows for a completely custom design without fighting overriding styles.

### Advantages
* Rapid UI development.
* No context switching.
* Highly customizable via configuration.

### Limitations
* HTML classes can become very long and ugly to read.

### Suitability for this project
Highly suitable. It allows the team to build a beautiful, custom UI very quickly.

---

## 4. shadcn/ui (Radix UI + Tailwind)

### What it is
A collection of reusable components built using Radix UI (for accessibility and logic) and Tailwind CSS (for styling) that are copied directly into the project rather than installed as an opaque npm package.

### Where it is used in this project
`src/app/components/` and `package.json` dependencies (`@radix-ui/react-*`).

### Why we used it
We needed complex, accessible UI components (like Modals, Dropdowns, and Accordions) but wanted full control over their styling. shadcn/ui provides the base code, which we own and can modify.

### Why not alternatives
* **Building manually:** Too time-consuming and difficult to get accessibility (ARIA tags, keyboard navigation) right.
* **Material UI (MUI):** Very heavy and opinionated. Harder to customize to match our specific custom design.

### Advantages
* Fully accessible.
* Completely customizable (we own the code).
* Looks modern and premium.

### Suitability for this project
Perfect for achieving a professional look quickly while maintaining flexibility.

---

## 5. React Router

### What it is
The standard routing library for React applications.

### Where it is used in this project
`src/app/routes.tsx` and across the app using `<Link>` or `useNavigate`.

### Why we used it
To enable Client-Side Routing. It allows the user to navigate between pages (Home -> Dashboard -> Messages) instantly without the browser reloading the page, preserving application state.

### Why not alternatives
* **Server-side routing (Express rendering HTML):** Defeats the purpose of building a modern SPA.
* **Next.js File-based routing:** Not applicable since we are using Vite for a standard SPA.

### Advantages
* Seamless, instant page transitions.
* Supports nested routes and layouts (e.g., `AuthLayout` vs `DashboardLayout`).

### Suitability for this project
The industry standard for Vite/React SPAs.

---

## 6. Context API for State Management

### What it is
A built-in React feature that allows data to be passed deeply through the component tree without manually passing props down at every level.

### Where it is used in this project
`src/app/context/AuthContext.tsx` and `src/app/context/LanguageContext.tsx`.

### Why we used it
We needed a way to access the user's authentication state (`user`, `isAuthenticated`) globally from any component (Navbar, ProtectedRoutes, API interceptors).

### Why not alternatives
* **Redux:** Overkill for this project. Redux requires a lot of boilerplate and is better suited for massive applications with complex, rapidly changing global state.
* **Zustand:** (Though installed, Context is primarily used for Auth). Context is built-in and sufficient for state that changes infrequently (like who is logged in or current language).

### Advantages
* No external dependencies.
* Simple to understand and implement.

### Suitability for this project
Highly suitable for Auth and Theme/Language state.

---

## 7. Axios (API Client)

### What it is
A popular promise-based HTTP client for the browser and Node.js.

### Where it is used in this project
`src/app/utils/api.ts` and throughout the frontend `services/` and `hooks/`.

### Why we used it
It simplifies making REST API calls to the Express backend. We used it specifically because of **Interceptors**. We set up an interceptor to automatically attach the JWT token to the header of every request, saving us from writing that logic in every single component.

### Why not alternatives
* **Native `fetch` API:** Requires more boilerplate (manually parsing JSON, harder to set up global interceptors for auth tokens).
* **Direct DB access:** Massive security risk; frontend must never connect directly to the database.
* **GraphQL:** Unnecessary complexity for a standard CRUD application. REST is simpler to implement for a graduation project.

### Advantages
* Global interceptors.
* Automatic JSON transformation.
* Better error handling than `fetch`.

---

## 8. Node.js & Express.js Backend

### What it is
Node.js allows running JavaScript on the server. Express.js is a minimal and flexible web application framework for Node.

### Where it is used in this project
The entire `backend/` directory.

### Why we used it
Using Node.js allows the entire project (frontend and backend) to be written in JavaScript/TypeScript. Express is used to easily create RESTful API endpoints, handle HTTP methods (GET, POST), and manage middleware.

### Why not alternatives
* **PHP / Django / Java:** Requires context-switching between different programming languages. Node.js allows for a unified JavaScript stack (MERN).
* **NestJS / Fastify:** NestJS is great but has a steep learning curve and heavy boilerplate. Express is straightforward and the industry standard for learning and medium-sized projects.

### Advantages
* Single language (JS) across the stack.
* Massive ecosystem of middleware (cors, helmet, multer).
* Very fast to build and deploy APIs.

### Suitability for this project
The quintessential choice for a MERN stack graduation project.

---

## 9. MongoDB & Mongoose

### What it is
MongoDB is a NoSQL document database. Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js.

### Where it is used in this project
`backend/src/models/` and throughout controller logic.

### Why we used it
Donation data can be flexible (a money campaign looks different from a physical clothing donation). Document-based storage fits this perfectly. Mongoose was used to enforce a strict schema, provide validation (e.g., ensuring emails are unique), and handle relationships (linking a Donation to a User).

### Why not alternatives
* **MySQL / PostgreSQL (SQL):** Relational databases are excellent, but require rigid schemas and complex migration scripts when requirements change. MongoDB allows for rapid iteration during the project phase.
* **Native MongoDB Driver:** Lacks schema enforcement and validation, which can lead to messy data.

### Advantages
* Flexible schema design.
* JSON-like documents map perfectly to JavaScript objects.
* Mongoose simplifies querying and validation.

### Suitability for this project
Excellent for projects requiring rapid development and flexible data structures (like varying donation types and chat messages).

---

## 10. JWT (JSON Web Tokens) Authentication

### What it is
A stateless, secure way of transmitting information between parties as a JSON object. Used here for user sessions.

### Where it is used in this project
`backend/src/controllers/auth.controller.js`, `backend/src/middleware/auth.middleware.js`, and frontend `AuthContext`.

### Why we used it
REST APIs should be stateless. JWT allows the backend to verify a user's identity without storing session state in the database or server memory. The token is generated on login and sent with every subsequent request.

### Why not alternatives
* **Cookies/Sessions (Stateful):** Requires the server to store session IDs in memory or a database (like Redis). Harder to scale and manage for cross-origin setups (separate frontend/backend URLs).

### Limitations
* Tokens cannot be easily revoked before expiration without building a blocklist.
* Currently stored in `localStorage`, which is vulnerable to XSS.

### Future improvement
Store the JWT in a secure, `HttpOnly` cookie to protect against Cross-Site Scripting (XSS) attacks in a production environment.

---

## 11. Role-Based Access Control & Verification

### What it is
A system where access to features is determined by the user's role (`user`, `admin`) and type (`donor`, `charity`), combined with a verification status (`pending`, `verified`).

### Why we used it
To protect the platform and ensure privacy. Charities require admin approval to prevent fraud. Donors cannot message each other to prevent the platform from becoming an unmoderated social network.

### Why this protects privacy
By default, the platform hides direct contact information. By enforcing role rules, we guarantee that vulnerable users only communicate with vetted organizations or within specific, monitored community requests.

---

## 12. Socket.IO for Messaging

### What it is
A library that enables low-latency, bidirectional, and event-based communication between a client and a server.

### Where it is used in this project
`backend/src/server.js` and `src/app/pages/messages/`.

### Why we used it
To power the real-time chat feature. When a charity replies to a donor, the donor needs to see the message instantly without refreshing the page.

### Why not alternatives
* **HTTP Polling:** The frontend asking the backend every 5 seconds "Are there new messages?" is highly inefficient and wastes server resources.
* **Raw WebSockets:** Too complex to handle reconnections, room management, and broadcasting manually. Socket.IO handles all of this automatically.

### Advantages
* Real-time updates.
* Easy "room" management (sending messages only to specific users).
* Automatic fallback to polling if WebSockets fail.

---

## Simple Explanation for Project Discussion

"This project is built using the **MERN stack**. We used **React** because it helps us build the user interface using reusable components, making pages like the Dashboard, Messages, and Public Directory easy to organize and highly interactive. We used **Vite** as it provides a lightning-fast development environment for React. For styling, we chose **Tailwind CSS** to quickly build a beautiful, custom design without writing bulky CSS files.

For the backend, we used **Express.js** running on **Node.js**. It is simple, fast, and allows us to write the entire project in JavaScript. **MongoDB** was chosen as our database because project data—like chat messages, flexible donation types, and user profiles—fits perfectly into flexible document storage. We used **Mongoose** to ensure our data remains structured and valid.

The frontend communicates with the backend through REST APIs using **Axios**. Authentication is handled securely using **JSON Web Tokens (JWT)**. Finally, to make our chat system work instantly without refreshing the page, we integrated **Socket.IO** for real-time communication. The platform applies strict role-based rules to safely separate the capabilities of Donors, Charities, and Admins."
