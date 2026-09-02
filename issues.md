# Issues

## Movies RBF Review

### P2: Movie Search Label Does Not Match Backend Behavior

- Frontend says the movie can be searched by title only.
- Backend `q` search currently matches both movie title and overview.
- Impact: a title search can return movies whose title does not match the search text.
- Frontend reference: `src/features/movies/pages/Movies.tsx`
- Backend reference: `src/modules/movies/movies.service.ts`
- Future fix: either update backend search to title-only or change frontend copy/filter behavior to reflect title and overview search.

### P2: Release Date Future-Only Rule Is Frontend-Only

- Frontend blocks past release dates and disables past date selection.
- Backend only coerces `releaseDate` to a date and does not enforce future-only dates.
- Impact: clients bypassing the admin frontend can create or update movies with past release dates.
- Frontend reference: `src/features/movies/validations/movieValidation.ts`, `src/features/movies/components/MovieForm.tsx`
- Backend reference: `src/modules/movies/movies.schemas.ts`
- Future fix: if future-only release dates are a true business rule, enforce it in the backend too.

### P3: Poster And Cover Image Fields Are Not URL-Validated

- Frontend requires `posterUrl` and `coverImage`, but does not validate URL format.
- Backend also only checks non-empty/max length for these fields.
- Trailer URL is validated correctly.
- Impact: invalid poster or cover image values can be saved, causing broken previews/catalog images.
- Frontend reference: `src/features/movies/validations/movieValidation.ts`
- Backend reference: `src/modules/movies/movies.schemas.ts`
- Future fix: validate poster and cover image fields as URLs on both frontend and backend.

### P3: Some Movies UI Text Does Not Follow Title Case

- Examples include `Release date`, `Age rating`, `Last updated`, `Not set`, and loading messages.
- Impact: functional behavior is unaffected, but UI copy is inconsistent with project preference.
- Frontend reference: `src/features/movies/pages/MovieDetailsPage.tsx`, `src/features/movies/utils/movieFormatters.ts`
- Future fix: update Movies UI labels and common movie formatter fallback text to Title Case.

## Cities RBF Review

### P2: City Search Label Does Not Match Backend Behavior

- Frontend says the city can be searched by name only.
- Backend `q` search currently matches both city name and slug.
- Impact: a name search can return cities whose name does not match the search text.
- Frontend reference: `src/features/cities/pages/CitiesPage.tsx`
- Backend reference: `src/modules/catalog/catalog.service.ts`
- Future fix: either update backend search to name-only or change frontend copy/filter behavior to reflect name and slug search.

### P2: Backend Allows Venues To Be Created Under Inactive Cities

- Frontend blocks inactive city assignment in venue creation/edit flows.
- Backend `createVenue` only checks that the city exists, not that it is active.
- Impact: clients bypassing the admin frontend can create venues under inactive cities.
- Frontend reference: `src/features/venues/pages/CreateVenuePage.tsx`, `src/features/venues/pages/EditVenuePage.tsx`
- Backend reference: `src/modules/catalog/catalog.service.ts`
- Future fix: if inactive cities should not be assignable to venues, enforce active city checks in backend venue create/update logic.

### P3: City Timezone UI May Overpromise Backend Behavior

- Frontend displays timezone as read-only backend metadata.
- Cities page copy refers to resolved timezones.
- Backend currently defaults missing city timezone to `Europe/London`.
- Impact: UI copy may imply backend derives the correct timezone from the city name even when backend may still be using the default.
- Frontend reference: `src/features/cities/pages/CitiesPage.tsx`
- Backend reference: `src/modules/catalog/catalog.service.ts`
- Future fix: either make backend resolve timezone from city name or adjust UI copy to describe timezone as backend-provided metadata.

### P3: Some Cities UI Text Does Not Follow Title Case

- Examples include `City name`, `Active city`, `Search by name`, `Last updated`, loading messages, and empty-state messages.
- Impact: functional behavior is unaffected, but UI copy is inconsistent with project preference.
- Frontend reference: `src/features/cities/components/CityForm.tsx`, `src/features/cities/pages/CitiesPage.tsx`, `src/features/cities/pages/CityDetailsPage.tsx`, `src/features/cities/utils/cityFormatters.ts`
- Future fix: update Cities UI labels and common city formatter fallback text to Title Case.

## Coupons RBF Review

### P2: Fixed Amount Coupon Currency Is Hard-Coded In Frontend

- Frontend formats fixed amount coupons as NPR.
- Backend default currency is currently GBP.
- Impact: admin users can see a different currency from the one used by booking and payment calculations.
- Frontend reference: `src/features/coupons/utils/couponFormatters.ts`
- Backend reference: `src/config/env.ts`
- Future fix: either expose backend currency to the frontend or align frontend formatting with backend configuration.

### P2: Expired Coupons Can Be Hard To Edit

- Frontend rejects past `validUntil` dates when updating coupons.
- Existing expired coupons can load with a past `validUntil` value.
- Backend allows updating coupon active state, valid until date, and max uses without this frontend-only restriction.
- Impact: admin users may be blocked from deactivating or adjusting an expired coupon unless they first clear or move the end date.
- Frontend reference: `src/features/coupons/validations/couponValidation.ts`, `src/features/coupons/components/CouponEditForm.tsx`
- Backend reference: `src/modules/promo-codes/promo-codes.service.ts`
- Future fix: allow existing expired coupon edits where the admin is deactivating the coupon or intentionally changing unrelated editable fields.

### P2: Max Uses Can Be Set Below Current Uses

- Frontend only validates `maxUses` as at least `1`.
- Backend directly applies the new `maxUses` value.
- Impact: a coupon can end up with `currentUses` greater than `maxUses`, creating confusing admin state and validation behavior.
- Frontend reference: `src/features/coupons/components/CouponEditForm.tsx`, `src/features/coupons/validations/couponValidation.ts`
- Backend reference: `src/modules/promo-codes/promo-codes.service.ts`
- Future fix: prevent `maxUses` from being set below `currentUses` on both frontend and backend.

### P3: Promo Code Route Params Are Not Zod-Validated In Backend

- Backend has a `promoCodeIdParam` schema, but the admin detail and update routes use `req.params.id` directly.
- Impact: malformed ids still reach service logic instead of failing at the router validation boundary.
- Backend reference: `src/modules/promo-codes/promo-codes.router.ts`, `src/modules/promo-codes/promo-codes.schemas.ts`
- Future fix: validate promo code route params consistently before calling service functions.

### P3: Some Coupon UI Text Does Not Follow Title Case

- Examples include `Loading coupons...`, `No coupons found.`, and sentence copy containing `discount codes`.
- Impact: functional behavior is unaffected, but UI copy is inconsistent with project preference.
- Frontend reference: `src/features/coupons/pages/CouponsPage.tsx`
- Future fix: update Coupons UI labels, loading text, and empty-state copy to Title Case where appropriate.
