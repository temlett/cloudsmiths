# Dog Breed Browser — Delivered Specification

## Summary

This project began as a React app for browsing dog breeds from the Dog CEO API. The current solution extends the original brief and is implemented as an Nx monorepo with:

- a React + Vite frontend
- a NestJS backend for persisting favorite images
- a shared TypeScript types library
- automated tests across frontend, backend, and shared types

Current live URL:

- https://cloudsmiths.jono.me/

The original requirements are covered, and several additional improvements are included as well.

---

## Original Requirements: Status

### Required capabilities

| Requirement                        | Status  | Notes                                                                                   |
| ---------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| Load dog breeds from an API        | ✅ Done | Breeds are fetched from Dog CEO on startup.                                             |
| Search/filter breeds               | ✅ Done | Case-insensitive filtering with partial matches.                                        |
| Select a breed                     | ✅ Done | Breed list supports selection and active styling.                                       |
| View 3 random images for the breed | ✅ Done | Three random images are requested per breed via the API service.                        |
| Show loading states                | ✅ Done | Loading states exist for breeds and breed images.                                       |
| Show error states                  | ✅ Done | Friendly error messages are rendered for breed/image loading failures.                  |
| Clean, readable structure          | ✅ Done | Componentized frontend, service layer, custom hooks, shared types, and modular backend. |
| README explains setup              | ✅ Done | README updated to reflect actual workspace setup and developer workflow.                |

### Conclusion on scope coverage

Nothing essential from the original brief appears to be missing.

---

## What Was Added Beyond the Original Brief

The solution includes several improvements that were outside the original scope or were natural follow-on enhancements.

### 1. Authentication

- Sign-in flow backed by DummyJSON auth endpoints
- Session persistence in browser session storage
- Session hydration on app load
- Automatic token refresh before expiry
- Logout support
- Auth-gated access to the dog browser UI

### 2. Favorites persistence

- Users can save specific dog images as favorites
- Users can remove favorites
- Favorites are persisted through a local NestJS backend
- Backend supports either file-backed persistence or Postgres-backed persistence
- Legacy file storage remains available via environment configuration
- Local Postgres development is supported via Docker Compose
- Backend environment variables are loaded from a local `.env` file
- Hosted Postgres deployment can use Supabase via `DATABASE_URL`
- Favorites are viewable in a dedicated gallery tab
- Users can jump from a saved favorite back into the breed browser

### 3. Monorepo architecture

- Nx workspace with separate frontend and backend applications
- Shared `@cloudsmiths/types` library for cross-app type safety
- Centralized scripts for running, building, linting, and testing the workspace

### 4. Resilience and UX enhancements

- Client-side caching for breed list responses
- Short-lived caching for favorites responses
- In-memory image caching by breed
- Retry handling for Dog CEO rate limiting (`429`)
- Refresh action for loading a fresh set of breed images
- Enlarged image modal with Escape-to-close support
- Lazy-loaded gallery/favorites images
- Explicit favorites loading and update error UI
- Clearer empty state when breed search returns no matches
- Configurable frontend environment variables for auth and favorites APIs

### 6. Hosted delivery

- Public deployment is available at `https://cloudsmiths.jono.me/`
- The live site is running on Google Cloud Run
- Frontend is served as a production Vite build behind Nginx
- Backend is deployed for the persisted favorites workflow
- Hosted persistence is designed around a Postgres connection via `DATABASE_URL`

### 5. Testing

- Frontend service/component/utility tests
- Backend service tests
- Shared library tests
- Coverage output for all projects
- Integration-style frontend tests covering login, browse, and favorites flows

---

## Delivered Functional Specification

### Authentication

As a user, I can sign in with valid DummyJSON credentials before accessing the app.

Acceptance:

- login form is shown when unauthenticated
- authentication errors are surfaced to the user
- authenticated session is restored when possible
- expired sessions are refreshed automatically when possible

### Browse breeds

As an authenticated user, I can view a list of dog breeds loaded from Dog CEO.

Acceptance:

- breed list loads on app startup
- API response is transformed into frontend-friendly options
- breeds are displayed in a selectable list

### Search breeds

As an authenticated user, I can filter the breed list using a search field.

Acceptance:

- filtering is case-insensitive
- partial matches are supported
- clearing the search restores the full list

### Select breed and view images

As an authenticated user, I can select a breed and see a gallery of random images.

Acceptance:

- selecting a breed triggers an image request
- three random images are requested from Dog CEO
- the gallery renders the currently loaded set
- users can explicitly refresh images for the selected breed

### Save favorite images

As an authenticated user, I can save and remove individual images as favorites.

Acceptance:

- each image card shows a favorite toggle
- favorited images are visually distinguishable
- toggling a favorite persists via the backend API
- duplicate favorites are prevented on the backend

### Browse favorites

As an authenticated user, I can view saved favorites in a dedicated gallery.

Acceptance:

- favorites tab shows saved images
- favorites can be enlarged
- favorites can be removed
- favorites can reopen the related breed in the browse tab
- favorites loading and mutation failures are shown directly in the favorites view

### Feedback and failure handling

As an authenticated user, I receive clear UI feedback during loading and failure states.

Acceptance:

- loading states exist for breed list and breed image fetches
- error states are shown when breed/image requests fail
- authentication failures are shown clearly
- the UI remains stable when API requests fail

---

## Technical Specification

### Frontend

- React 19
- Vite 8
- TypeScript
- CSS Modules
- Hooks-based state management

Key frontend modules:

- `useBreeds` for breed loading
- `useBreedImages` for selected-breed gallery loading and caching
- `useFavorites` for reading/updating favorite images
- `services/dogApi.ts` for Dog CEO and favorites API integration
- `services/auth.ts` for DummyJSON authentication/session handling

### Backend

- NestJS 11
- TypeORM-based persistence abstraction
- File-based persistence to `data/favorites.json`
- Optional PostgreSQL persistence
- Environment-based storage selection via `FAVORITES_STORAGE`
- Local environment loading via `dotenv`
- Hosted database connection via `DATABASE_URL`
- REST API under `/api/favorites`

Local development notes:

- `docker-compose.yml` provides a local Postgres instance
- local Postgres is mapped to host port `5431`
- `.env.example` documents the default backend variables
- `.github/workflows/deploy-gcp.yml` provides CI/CD for Cloud Run deployments

Endpoints:

- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/:id`

### Shared library

- `libs/types` exports dog, favorite, and auth domain types

---

## Architecture Notes

### Frontend application

- `apps/frontend`
- auth-gated SPA experience
- tabbed UI for browse/favorites flows
- modal image preview

### Backend application

- `apps/backend`
- focused favorites persistence API
- deduplicates favorites by image URL
- sorts favorites by creation time descending
- supports switching between file and Postgres storage without changing the API contract

### Shared types

- `libs/types`
- keeps contracts aligned across frontend and backend

---

## Non-Functional Outcomes

### Code quality

- clear separation between UI, hooks, services, and shared types
- monorepo organization improves maintainability
- reusable types reduce duplication and drift

### Developer experience

- simple npm scripts for common tasks
- isolated frontend/backend builds and tests
- coverage reports available locally
- local backend configuration is centralized in `.env`
- local Postgres can be started with Docker Compose when database-backed persistence is desired
- a GitHub Actions workflow is available for deploying frontend and backend to GCP Cloud Run

### UX improvements over baseline

- authentication gate and session continuity
- favorites workflow across sessions on the same local environment
- image preview modal
- refreshable galleries
- caching to reduce unnecessary API requests
- public hosted environment for trying the app

---

## Known Differences from the Original Brief

These are not gaps, but intentional scope changes:

1. **Authentication is now required** before using the browser.
2. **The project is no longer frontend-only**; it includes a local backend service.
3. **The app includes persistent favorites**, which were originally out of scope.
4. **The repository uses Nx**, rather than a single standalone Vite app.
5. **Favorites persistence can now run on Postgres**, while retaining the original local file option for compatibility.
6. **The project is prepared for hosted deployment**, using Supabase Postgres and GCP Cloud Run.

---

## Remaining Gaps / Nice-to-Haves

No critical requirement gaps were identified relative to the original scope.

Possible future enhancements if desired:

- add browser-level end-to-end tests against a running app stack
- add database migrations instead of relying on TypeORM schema synchronization for local database setup
- add deeper operational monitoring/observability notes for the hosted deployment

---

## Definition of Done

This solution is complete for the implemented scope because:

- original breed-browsing assessment requirements are satisfied
- added authentication flow is working and documented
- favorites persistence is working and documented
- frontend, backend, and shared types are tested
- developer setup instructions are documented in the README
