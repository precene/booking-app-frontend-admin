# 977Cinema Admin Dashboard Guidelines

## Project Scope

- Highest-priority rule: do not edit, patch, format, or otherwise modify the backend project. The backend may be inspected only as a read-only source of API contract truth.
- Work only on the admin dashboard app inside `booking-admin`.
- Do not inspect, modify, or depend on `booking-customer` unless the user explicitly asks for it.
- This app is for managing the 977Cinema platform: movies, cities, venues, seating layouts, show timings, bookings, customers, payments, admin users, and dashboard reporting.

## Feature-Based Structure

- Organize code by feature.
- Each feature should keep its own related files together:

```text
features/
  feature-name/
    components/
    middleware/
    pages/
    validations/
    types/
    utils/
    store/
    services/
```

- `components/`: UI components specific to the feature.
- `middleware/`: feature-specific route guards, middleware-style helpers, and access-control checks.
- `pages/`: route-level screens for the feature.
- `validations/`: Zod schemas and feature validation rules.
- `types/`: TypeScript domain types, DTOs, request types, and response types.
- `utils/`: feature-specific helpers, mappers, and formatters.
- `store/`: Zustand state related to the feature.
- `services/`: API functions tied to the feature.
- Keep shared, reusable app-wide code in `shared/`.
- Keep route files in `routes/`, and have them import feature pages.

## API And State

- Use Axios for HTTP requests through the shared API client.
- Use the shared API client for centralized behavior such as base URL, cookie credentials, and response interceptors.
- The backend API is mounted under `/api/v1`; set `VITE_API_BASE_URL` accordingly, such as `http://localhost:<backend-port>/api/v1`.
- The backend uses HttpOnly cookie sessions, so `apiClient` must send `withCredentials: true`.
- Do not add bearer-token Authorization headers unless the backend auth contract changes.
- Use Axios interceptors for global API concerns such as handling `401` responses and forcing logout when the admin session expires.
- Use Zustand for global client state such as auth state, token, logout behavior, sidebar state, and other app-level state.
- TanStack Query can be added later for server-state concerns such as caching, loading states, pagination, refetching, and mutations.
- Feature services should expose clean API methods such as `moviesApi.list()`, `moviesApi.get(id)`, `moviesApi.create(payload)`, and `moviesApi.update(id, payload)`.

## Backend Contract

- Keep frontend API services, DTOs, and validation schemas aligned with `C:\Users\Pratik\Documents\Backend\booking-app-backend\src`.
- Backend source folders of interest:
  - `src/db/schema.ts` for database columns, ids, enums, nullability, and timestamps.
  - `src/modules/*/*.router.ts` for route paths, HTTP methods, auth middleware, and mounted behavior.
  - `src/modules/*/*.schemas.ts` for request body/query/param validation.
  - `src/modules/*/*.service.ts` for returned field names and response payload contents.
- Backend success responses use `{ data: ... }`.
- Backend error responses use `{ error: { code, message, details? } }`.
- Backend paginated list payloads use `{ items, page, limit, total }`.
- Existing mounted API routes:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/me`
  - `GET /api/v1/admin/users`
  - `GET /api/v1/admin/users/:id`
  - `PATCH /api/v1/admin/users/:id/role`
  - `PATCH /api/v1/admin/users/:id/active`
  - `GET /api/v1/admin/movies`
  - `POST /api/v1/admin/movies`
  - `GET /api/v1/admin/movies/:id`
  - `PATCH /api/v1/admin/movies/:id`
  - `DELETE /api/v1/admin/movies/:id`
- Admin movie APIs require the `catalog:manage` permission.
- Admin users list requires `users:list`; admin user detail/role/active changes require `users:manage`.
- Backend ids are UUID strings, not numbers.
- Backend date/time values should be treated as ISO strings in the frontend.
- Use Luxon for date-related validation, parsing, comparison, and formatting unless built-in `Date` provides the right simple UI/calendar operation.
- Movie fields must match the backend names: `title`, `overview`, `posterUrl`, `trailerUrl`, `durationMinutes`, `ageRating`, `genre`, `releaseDate`, `active`, `createdAt`, and `updatedAt`.

## Routing And Auth Protection

- Use TanStack Router `beforeLoad` to decide whether a route is auth-protected.
- Group protected admin routes under the pathless `_protected` route.
- Group public routes under the pathless `_public` route.
- Protected admin route groups must use the shared auth guard, currently `requireAuth`.
- Public route groups that should be hidden from signed-in admins, such as the login flow, should use the shared redirect guard, currently `redirectAuthenticatedAdmin`.
- Put middleware and route guards inside the respective feature `middleware/` folder, such as `features/auth/middleware`.
- Do not put route-protection checks inside page components when `beforeLoad` can handle them.
- Keep route files in `routes/`, and import feature pages and route guards from their feature folders.

## Styling

- Use Tailwind CSS for styling throughout the app.
- Focus only on light mode. Do not add dark theme variants, dark-mode tokens, or dark-mode-specific styling unless the user explicitly asks for dark mode later.
- Use CSS theme tokens such as `primary`, `secondary`, `teal`, and other shared tokens for centralized theming.
- Prefer Tailwind utility classes for component and layout styling.
- Create custom CSS only when it is needed to achieve a specific UI style that is awkward or unsuitable with Tailwind utilities.
- If a style is global, such as scrollbar styling, app background, selection color, or base document styling, add it to the global stylesheet.
- If a style is local to a component or page, use Tailwind CSS instead of global CSS.
- Keep the admin UI restrained, clear, and work-focused: compact spacing, clean forms, readable tables, subtle borders, and color used for meaning.

## UI Components

- Use the shared shadcn-style components in `src/shared/components/ui` for common interface elements.
- Prefer Radix-based shared components for behavior-heavy UI such as dialogs, dropdown menus, selects, popovers, tabs, checkboxes, labels, tooltips, and autocomplete/command experiences.
- Use TanStack Table for admin data-table behavior such as row models, sorting, filtering, pagination, selection, and column visibility.
- Do not hand-roll complex accessible primitives when a shared UI component or Radix primitive already exists.
- Keep shared UI components Tailwind-first, token-based, and light-mode-only.

## Coding Style

- Follow the current login page style as the reference for imports, component organization, and JSX formatting.
- Order imports in groups separated by blank lines:
  1. React and third-party package imports.
  2. Feature-relative imports such as `../store`, `../validations`, and `../types`.
  3. Shared alias imports from `#/shared`.
- Keep type imports explicit with `type`, including mixed React imports such as `useState, type SubmitEvent`.
- Prefer feature-relative imports inside the same feature folder.
- Prefer `#/shared/...` imports for shared components, utilities, services, and types.
- Define page-local types near the imports, then constants, then the page component.
- Inside page components, keep `useState` declarations first, router hooks after local state, and store selectors/actions after router hooks when practical.
- Define small page event handlers as named functions before the JSX return.
- Use early returns in submit handlers for validation failure.
- Keep JSX readable with blank lines between logical UI blocks.
- Put Tailwind classes directly on elements and shared components; keep class strings readable and let `oxfmt` handle ordering/formatting.
- Use `aria-invalid` and `aria-describedby` for form error states.
- Use shared validation utilities such as `getFormValidationErrors` instead of page-local validation-error mappers.
