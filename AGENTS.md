# 977Cinema Admin Dashboard Guidelines

## Scope

- Highest-priority rule: never edit, patch, format, or otherwise modify the backend. Inspect `C:\Users\Pratik\Documents\Backend\booking-app-backend\src` only as a read-only API/database contract.
- Work only inside `booking-admin`. Do not inspect or modify `booking-customer` unless explicitly asked.
- Never start the dev server on your own. Run `pnpm dev` or any equivalent local server only when the user explicitly asks.
- Never install dependencies or libraries on your own. If a dependency is needed, name the package and let the user install it manually.
- This admin app manages movies, cities, venues, seating layouts, showtimes, bookings, customers, payments, coupons, admin users, and related dashboard workflows.

## Structure

- Organize by feature:

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

- Keep reusable code in `shared/`, route files in `routes/`, and feature route guards in the relevant `middleware/` folder.

## Backend Contract

- Keep frontend services, DTOs, and Zod schemas aligned with backend `db/schema.ts`, `modules/*/*.router.ts`, `modules/*/*.schemas.ts`, and `modules/*/*.service.ts`.
- Backend responses use `{ data: ... }`; errors use `{ error: { code, message, details? } }`; paginated lists use `{ items, page, limit, total }`.
- Backend ids are UUID strings. Backend date/time values are ISO strings.
- The API is mounted under `/api/v1`; configure `VITE_API_BASE_URL` accordingly.
- Use Axios through shared `apiClient` with `withCredentials: true` for HttpOnly cookie sessions.
- Do not add bearer-token auth unless the backend contract changes.
- Use Axios interceptors for global API behavior such as forced logout on `401`.
- Use Luxon for date/time validation, parsing, comparison, and formatting unless a built-in `Date` operation is clearly sufficient.
- Feature API services should expose clean methods such as `list`, `get`, `create`, `update`, and `delete` where supported by the backend.

## State And Routing

- Use Zustand for global client state such as auth, logout behavior, sidebar state, and other app-level state.
- Use TanStack Router `beforeLoad` for route protection.
- Group protected admin routes under `_protected`; group public routes under `_public`.
- Protected routes should use `requireAuth`; public auth routes such as login should use `redirectAuthenticatedAdmin`.
- Do not put route-protection checks inside page components when `beforeLoad` can handle them.
- TanStack Query may be added later for server state such as caching, pagination, refetching, and mutations.

## UI And Styling

- Use Tailwind CSS throughout and focus only on light mode.
- Use centralized CSS tokens such as `primary`, `secondary`, `teal`, and shared theme tokens.
- Add custom CSS only when Tailwind is unsuitable; global styles belong in the global stylesheet, local styles belong in component classes.
- Use shared shadcn-style/Radix components from `src/shared/components/ui` for common UI primitives.
- Use TanStack Table for admin data tables.
- Do not hand-roll complex accessible primitives when a shared component or Radix primitive exists.
- Keep the admin UI restrained, clear, and work-focused: compact spacing, readable tables/forms, subtle borders, and color used for meaning.
- Use Title Case for page titles, section/card titles, form labels, button text, table headers, badges, and similar short UI labels.
- Use normal sentence case for subtitles, helper text, descriptions, empty-state explanations, and other sentence-style copy.

## Coding Style

- Follow the current login page style for imports, component organization, and JSX formatting.
- Import order: React/third-party, feature-relative imports, then `#/shared` imports.
- Use explicit `type` imports, including mixed imports such as `useState, type SubmitEvent`.
- Prefer feature-relative imports within a feature and `#/shared/...` for shared code.
- Define page-local types near imports, then constants, then the page component.
- In page components, keep local state first, router hooks next, and store selectors/actions after that when practical.
- Use named event handlers before JSX returns and early returns for validation failures.
- Use `aria-invalid` and `aria-describedby` for form error states.
- Use shared validation helpers such as `getFormValidationErrors`; avoid page-local error mappers.
- Let `oxfmt` handle formatting; do not add Prettier.

## RBF Reviews

- `Do RBF` means review frontend/backend alignment for the requested section.
- Check business logic, frontend behavior/validation/services, backend routes/schemas/database/services, bugs, missing states, API mismatches, security, performance, scalability, and maintainability.
- Backend is read-only: report backend issues clearly for the backend developer, never edit backend files.
- Each finding must state priority (`P0`, `P1`, `P2`, `P3`), area (`Frontend` or `Backend`), and fix location (`Frontend` or `Backend`). Use `P0` for critical blockers, `P1` for high priority, `P2` for medium priority, and `P3` for low priority.
- Present findings first, ordered by severity with file/line references when available, then assumptions/notes/fix suggestions.
- Also write RBF findings to `issues.md` at the project root for future tracking.
- Write each `issues.md` finding in Trello-style format: card title as `P0/P1/P2/P3 Area: Finding Title`, then `Area`, `Fix Location`, `Description`, `Suggested Fix`, and `Affected Files`. Do not add a separate priority section because priority is already in the title.
- In `issues.md`, do not write full absolute paths. Use relevant paths only and prefix them with `..`, for example `..\booking-app\booking-admin\src\features\auth\pages\LoginPage.tsx`. This protects user privacy and keeps paths useful for developers who store the frontend/backend projects in different local directories.
- Do not create, update, or move Trello cards unless explicitly asked.
