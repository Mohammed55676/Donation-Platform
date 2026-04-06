# Donation Platform Documentation (منصة الخير) - Developer Guide

Welcome to the **Donation Platform** codebase! If you are a beginner developer (or just new to this project), this file is written specifically for you. It explains what this project is, how it's built under the hood, and how you can comfortably navigate, edit, and expand it.

---

## 1. What the Project Does
Imagine a digital bulletin board where people who want to give away items (clothing, food, furniture) can connect directly with charities, volunteers, and individuals in need. 

The Donation Platform is an Arabic-first web application that digitizes the entire charitable cycle:
* **Donors** can list items they want to give away.
* **Beneficiaries/Charities** can request those items or post their own requests for help in a community feed.
* **Volunteers** can find upcoming events (like packing food boxes) and register to help.

**To a developer:** It is a front-end React application utilizing simulated client-side state (React Context/Local Storage) to mock a full-stack experience (user auth, data fetching, database updates).

---

## 2. Why it Exists
Charitable giving in many regions still relies on word-of-mouth or fragmented social media groups. This project exists to provide a **centralized, modern, and dedicated digital platform**. 

From a technical standpoint, it exists to demonstrate a scalable frontend architecture. It shows how modern tools (Vite, Tailwind, React Router v7, and shadcn/ui) can be combined to build applications that look premium and function flawlessly across all devices.

---

## 3. All Pages and Their Purpose
Pages are top-level React components located in the `src/app/pages/` directory. They represent the "screens" the user sees.

* **Home (`/`)**: The landing page. It introduces the platform and provides quick call-to-actions (CTAs).
* **Donations (`/donations`)**: The marketplace. Users come here to scroll through cards representing donated items. It includes dynamic category filters.
* **Donation Details (`/donations/:id`)**: Shows the full details of a specific item. The `:id` is a URL parameter used to fetch that specific item from the state.
* **Add Donation (`/add-donation`)**: A comprehensive form for listing new donations (handles image uploads, descriptions, categories).
* **Volunteer (`/volunteer`)**: Lists active volunteering opportunities.
* **Community Feed (`/community`)**: A social media-like feed where users post text-based requests or updates.
* **Create Post (`/community/create`)**: The form to submit a new feed post.
* **Post Details (`/community/:postId`)**: A focused view of one post and its comment section.
* **Auth Pages (`/login`, `/signup`, `/forgot-password`)**: Simple, isolated forms that manage user onboarding. They don't have the main navbar or footer.
* **Dashboard (`/dashboard`)**: A private tabbed control center for a standard user to view their active donations, pending requests, and personal settings.
* **Admin Dashboard (`/dashboard/admin`)**: A specialized control center where administrators can view platform analytics, approve pending donations, and manage users.

---

## 4. All Components and What Each One Does
Components are the reusable building blocks of pages. They are separated into different folders based on their purpose:

### A. The Core UI Components (`src/app/components/ui/`)
This project uses **shadcn/ui**, meaning the base UI elements (Buttons, Inputs, Cards, Dialogs) aren't imported from an npm library (like Material UI). Instead, their source code lives directly in your project.
* **Why?** It gives you 100% control over the styling.
* **Example Use**: Instead of building `<button class="...">` from scratch, you import it like this:
  ```tsx
  import { Button } from '../components/ui/button';
  return <Button variant="destructive">Delete Item</Button>
  ```

### B. Structural Layout Components
* **`Navbar.tsx`**: Contains the logo, navigation links, translation button, dark mode toggle, and the user profile dropdown. It's fully responsive (turns into a hamburger menu on mobile).
* **`Footer.tsx`**: The bottom section of the site containing links and copyright info.
* **`Layout.tsx`**: A wrapper component. When you visit a page, this component dictates "Put the Navbar at the top, put the Page Content in the middle, and put the Footer at the bottom."

### C. Feature Components
These are complex pieces of UI extracted so pages don't become overwhelmingly large:
* **`ChatDialog.tsx`**: A popup modal that simulates a messaging interface between users.
* **`MapView.tsx`**: A map component (using Leaflet) to show the geographical location of a donation.
* **`NotificationDropdown.tsx`**: The bell icon in the navbar that shows recent alerts to the user.
* **`ProtectedRoute.tsx`**: An invisible component wrapped around private pages. If a user isn't logged in, it intercepts their request and forces them to `/login`.

---

## 5. Routing Structure
The project uses the modern object-based router from `react-router` located in `src/app/routes.tsx`.

Instead of writing `<Route path="/foo".../>`, the app defines an array of route objects:
```tsx
export const router = createBrowserRouter([
  {
    // The main public layout wrapper
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home }, // Loading the home page
      { path: 'donations', Component: Donations },
      // Protected community route
      { 
        path: 'community', 
        element: <ProtectedRoute><Feed /></ProtectedRoute> 
      },
    ],
  }
]);
```
**How to think about it:** The router reads the URL bar. If it sees `/donations`, it goes into the layout, and replaces the middle "children" area with the `Donations` page component.

---

## 6. Authentication Flow
Authentication determines "Who is the user?" The logic lives in `src/app/context/AuthContext.tsx`.

1. **The Context**: Think ofContext as a global variable available to any component.
2. **Logging In**: When a user fills out `/login`, the component calls the `login(email, password)` function from the AuthContext.
3. **Session Simulation**: The AuthContext validates the credentials against some mock data, creates a User object, and saves it in the browser's `localStorage` (so the user stays logged in if they refresh the page).
4. **Using Auth**: Any component can grab the user like this:
   ```tsx
   import { useAuth } from '../context/AuthContext';

   function WelcomeCard() {
     const { user, isAuthenticated } = useAuth();
     
     if (!isAuthenticated) return <p>Please log in.</p>;
     return <p>Welcome back, {user.name}!</p>
   }
   ```

---

## 7. Dashboard Logic
The Dashboard (`/dashboard`) is a complex, data-heavy page. Here is how it keeps everything organized:

* **Tab Navigation**: It uses a `<Tabs>` component (from shadcn/ui) to prevent the user from scrolling endlessly. Clicking "My Donations", "My Requests", or "Settings" instantly flips the displayed content without changing the URL.
* **Data Hydration**: When the Dashboard mounts, it pulls data from the global Contexts (`useDonations()`, `useCommunity()`) and filters them down to items owned by the currently logged-in user.
* **Example**:
  ```tsx
  const { donations } = useDonations();
  const { user } = useAuth();
  // We only want to show the donations THIS user created
  const myDonations = donations.filter(d => d.donor.name === user.name);
  ```

---

## 8. User Role Logic
Unlike traditional apps that separate users into rigid roles immediately during signup, this platform uses a dynamic "Unified Role" approach.

* A standard account (`role: 'user'`) can both donate items and request items.
* An administrator account (`role: 'admin'`) is used for platform modification.
* To lock a page to admins only, the `ProtectedRoute` component accepts a role prop:
  ```tsx
  <ProtectedRoute allowedRole="admin">
    <AdminDashboard />
  </ProtectedRoute>
  ```
  If regular users access this, the app detects their role mismatch and redirects them back to `/`.

---

## 9. Styling Decisions
The platform relies entirely on **Tailwind CSS**. If you've only used traditional CSS (`style.css`), this will look different. You do not write CSS files; instead, you apply utility classes directly to the HTML.

* Regular CSS:
  ```css
  .my-button { display: flex; align-items: center; padding: 1rem; background: blue; border-radius: 4px; }
  ```
* Tailwind CSS:
  ```tsx
  <button className="flex items-center p-4 bg-blue-500 rounded-md">
  ```
This makes development incredibly fast and prevents "CSS bloat" (where your CSS files grow forever because developers are afraid to delete old classes).

---

## 10. How Arabic RTL is Implemented
Building RTL (Right-to-Left) applications involves two major considerations: the HTML direction and the CSS spacing.

1. **HTML & Context**: We use a custom `LanguageContext.tsx`. When a user toggles the language to Arabic, it executes:
   ```javascript
   document.documentElement.dir = 'rtl';
   document.documentElement.lang = 'ar';
   ```
2. **Logical CSS Properties**: With Tailwind, we do not use "Left" or "Right" modifiers, because "Right" in English is "Left" in Arabic. Instead, we use `start` and `end`.
   * **Do not use**: `ml-4` (Margin Left). In Arabic, the margin would stay on the left side, pushing the text into the wrong space.
   * **Use this**: `ms-4` (Margin Start). In English, 'start' is the left side. In Arabic, the browser knows 'start' is the right side, so it automatically flips the margin!

---

## 11. How Responsiveness is Handled
The app is entirely "Mobile-First". This means the default Tailwind classes you write apply to cell phones. To make things change on a Desktop, you use responsive prefixes like `md:` (medium screen/tablet) or `lg:` (large screen/desktop).

**Example**: A grid of donations that is a single column on mobile, but grows to 3 columns on a laptop.
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {donations.map(donation => <Card />)}
</div>
```

---

## 12. How to Edit and Maintain the Project Later
If you want to add a brand new page (for example, an "About Us" page), here are the exact steps you follow:

1. **Create the File**: Go to `src/app/pages/` and create `About.tsx`.
2. **Build the Component**: 
   ```tsx
   export function About() {
     return <div className="container mx-auto py-10"><h1>About Us</h1></div>
   }
   ```
3. **Register the Route**: Open `src/app/routes.tsx`. Inside the `children` of the Main Layout, add:  
   `{ path: 'about', Component: About },`
4. **Add to Navbar**: Open `src/app/components/Navbar.tsx`. Find the `navItems` array and append your new page:
   ```tsx
   { name: t('nav.about') || 'من نحن', path: '/about', icon: Info },
   ```
5. **Run the App**: Open your terminal and run `npm run dev`. Navigate to `http://localhost:5173/about` to see your changes in real time.

---

## 13. Future Improvements (For the Next Developer)
Right now, the app is a powerful front-end shell, but all data lives in the browser's temporary memory (`localStorage` and React Context). When moving to a production environment, the next developer should focus on:

1. **Database Migration**: Remove Context state logic and hook up a database like PostgreSQL or MongoDB. The `addDonation()` function should be converted into `fetch('/api/donations', { method: 'POST', body: ... })`. Next.js or Vite + Express are great choices here.
2. **Real Authentication**: Replace the mock `AuthContext` with a robust service like Firebase, Supabase, or Auth0 to handle real passwords and email verifications securely.
3. **Asset Hosting**: Currently, uploaded images are stored as Base64 data strings in the browser. You need to connect an S3 bucket or Cloudinary to host image files dynamically.
4. **WebSockets**: The Community feed would greatly benefit from `Socket.io` or Pusher, allowing new posts and chat messages to appear instantly without requiring the user to refresh the page.
