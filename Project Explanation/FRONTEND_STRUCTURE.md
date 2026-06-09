# Frontend Structure

The frontend is a modern React application utilizing Vite as the bundler.

## 1. Core Technologies
* **Framework:** React 19
* **Bundler:** Vite
* **Styling:** Tailwind CSS v4, Radix UI primitives, Material UI (MUI 7)
* **Routing:** React Router v7
* **Language:** TypeScript (`.tsx`, `.ts`)

## 2. Directory Layout (`src/app/`)
* **`components/`**: Reusable UI elements (e.g., `Navbar`, `Footer`, `ProtectedRoute`). Many UI primitives are inspired by shadcn/ui.
* **`context/`**: React Context providers.
  * `AuthContext.tsx`: Manages user session, login/logout, and Google OAuth state.
  * `LanguageContext.tsx`: Manages LTR/RTL layout switching and localization mapping.
* **`pages/`**: Route-level components. Organized logically by feature:
  * `auth/`: Login, Signup, OTP, Pending Review screens.
  * `community/`: Feed and post creation.
  * `messages/`: Chat interface.
  * Root level: `Home`, `Donations`, `Dashboard`, `AdminDashboard`, `CharityDashboard`.
* **`services/`**: API helper wrappers (primarily used for legacy mock data or specialized external calls).
* **`utils/`**: Utility functions.
  * `api.ts`: Configures the global Axios instance. It sets the `VITE_API_URL` base and uses an interceptor to attach the JWT from `localStorage`.
* **`hooks/`**: Custom React hooks (e.g., `useCampaigns`, `useVolunteerOpportunities`) for encapsulating data fetching logic.
* **`i18n/`**: Localization files (`en.json`, `ar.json`).

## 3. Application Flow
1. **Entry Point:** `src/main.tsx` renders the `<App />` component.
2. **Providers:** Inside `main.tsx`, the app is wrapped in `<LanguageProvider>` and `<AuthProvider>`.
3. **Routing:** `src/app/routes.tsx` uses `createBrowserRouter` to define the tree.
   * `AuthLayout`: Wraps authentication pages without the main navbar.
   * `Layout`: Wraps public pages with the main navbar and footer.
   * `<ProtectedRoute>`: A component wrapper that checks `AuthContext` state and redirects to `/login` if unauthorized, or checks `role`/`user_type` for restricted pages.

## 4. Internationalization & Theme
* The app supports English and Arabic. The `LanguageContext` toggles the HTML `dir` attribute between `ltr` and `rtl`.
* Styling heavily relies on Tailwind CSS classes. A `DESIGN.md` file in the root dictates the design token specifications.
