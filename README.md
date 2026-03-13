# Cloudsmiths Dog Breed Browser Monorepo

This repository contains my Dog Breed Browser solution.

## Live site

- https://cloudsmiths.jono.me/

Current hosted status:

- frontend is live at the URL above
- backend-backed favorites flow is deployed
- the live site is running on Google Cloud Run
- the current production deployment reflects the current state of the app

What is included:

- `apps/frontend` (`@cloudsmiths/frontend`) — a React + Vite single-page app
- `apps/backend` (`@cloudsmiths/backend`) — a NestJS API for persistent favorites
- `libs/types` (`@cloudsmiths/types`) — shared TypeScript contracts for both apps

The finished solution satisfies the original breed-browsing brief and adds:

- authentication via DummyJSON
- persistent favorite image storage
- an Nx monorepo structure
- shared types and automated tests
- configurable frontend auth and favorites API base URLs

For the current product truth, see:

- `docs/spec.md`
- `docs/kanban.md`

## What new developers should know first

This is no longer a frontend-only Vite app.

To use the full solution locally, you need to run **both** applications:

1. the backend API on port `3333`
2. the frontend app on port `4200`

You also need valid DummyJSON credentials to sign in before you can use the dog browser UI.

## Features at a glance

- sign in and restore session
- browse dog breeds from Dog CEO
- search/filter breed names
- load three random images for a selected breed
- refresh the current breed gallery
- save and remove favorite images
- browse favorites in a separate gallery tab
- reopen a saved favorite's breed in the main browser

## Tech stack

- Nx
- React 19
- Vite 8
- NestJS 11
- TypeORM
- PostgreSQL
- TypeScript
- Vitest
- CSS Modules

## Workspace structure

```text
apps/
  frontend/        # React SPA powered by Vite
  backend/         # NestJS API with file or Postgres persistence
libs/
  types/           # Shared TypeScript types used across apps
docs/              # Living specification and kanban/status docs
data/              # Local persisted favorites data
```

## Prerequisites

- Node.js 20+
- npm 10+

## Installation

```bash
npm install
cp .env.example .env
```

To use local Postgres persistence, start the database container:

```bash
docker compose up -d postgres
```

## Quick start

### 1. Start the backend

```bash
npm run dev:backend
```

This starts the NestJS favorites API at:

- `http://localhost:3333`

By default the backend keeps using the existing file-backed storage. To switch to Postgres locally, start it with:

```bash
FAVORITES_STORAGE=postgres npm run dev:backend
```

The backend can connect either through `DATABASE_URL` or through the individual `POSTGRES_*` variables. For local Docker usage, the default `POSTGRES_*` values match `docker-compose.yml`.

The local Docker mapping uses host port `5431` to avoid clashes with other Postgres instances already using `5432`.

### 2. Start the frontend

In a second terminal:

```bash
npm run dev:frontend
```

This starts the frontend at:

- `http://localhost:4200`

### 3. Sign in

Open the frontend and authenticate with valid DummyJSON credentials.

The app uses DummyJSON for login and token refresh, and keeps the active session in browser session storage.

## Environment configuration

The backend automatically loads environment variables from a local `.env` file via `dotenv`, so the usual local setup is to copy `.env.example` to `.env` and edit values there as needed.

For hosted Postgres providers such as Supabase, set:

```bash
FAVORITES_STORAGE=postgres
DATABASE_URL=postgresql://...
DATABASE_SSL=true
```

For local Docker Compose Postgres, keep `DATABASE_URL` empty and use the `POSTGRES_*` variables instead.

The frontend talks to the local favorites API by default:

- `http://localhost:3333`

If you need to point the frontend somewhere else, override the API base URL when starting it:

```bash
BACKEND_API_URL=http://localhost:3333 npm run dev:frontend
```

You can also override the auth provider base URL:

```bash
AUTH_BASE_URL=https://dummyjson.com/auth npm run dev:frontend
```

You can combine both when needed:

```bash
BACKEND_API_URL=http://localhost:3333 \
AUTH_BASE_URL=https://dummyjson.com/auth \
npm run dev:frontend
```

## Common scripts

```bash
npm run dev            # start the frontend through Nx
npm run dev:frontend   # start the Vite frontend
npm run dev:backend        # start the favorites backend in watch mode
npm run build          # build all Nx projects
npm run build:frontend # build the frontend only
npm run build:api      # build the backend only
npm run lint           # lint all Nx projects
npm run test           # run all tests with coverage
npm run preview        # preview the frontend production build
```

## How the app is organized

### Frontend

Important areas in `apps/frontend`:

- `src/App.tsx` — main authenticated application flow
- `src/components/` — presentational UI components
- `src/hooks/` — stateful app logic for breeds, images, and favorites
- `src/services/dogApi.ts` — Dog CEO + favorites API access
- `src/services/auth.ts` — DummyJSON login/session management
- `src/utils/breedTransform.ts` — Dog CEO response normalization

### Backend

Important areas in `apps/backend`:

- `src/favorites/favorites.controller.ts` — REST endpoints
- `src/favorites/favorites.service.ts` — business logic
- `src/favorites/favorites.store.ts` — file persistence layer
- `src/favorites/favorites-postgres.repository.ts` — Postgres persistence layer

Favorites can be stored either in:

- `data/favorites.json` when `FAVORITES_STORAGE=file`
- Postgres when `FAVORITES_STORAGE=postgres`

### Shared types

Shared contracts live in:

- `libs/types/src`

This keeps frontend/backend request and response shapes aligned.

## API reference

### Favorites API

Base URL:

- `http://localhost:3333/api/favorites`

Endpoints:

- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/:id`

Example `POST` payload:

```json
{
  "breed": "beagle",
  "label": "Beagle",
  "imageUrl": "https://images.dog.ceo/breeds/beagle/n02088364_11136.jpg"
}
```

Notes:

- favorites are deduplicated by `imageUrl`
- delete operates on the favorite `id`, not the breed name

## Testing and validation

Recommended validation commands:

```bash
npm run build
npm run lint
npm run test
```

## Deployment

This repo includes a GitHub Actions workflow at `.github/workflows/deploy-gcp.yml` that deploys:

- the NestJS backend to **Google Cloud Run**
- the Vite frontend to **Google Cloud Run** as a static site served by Nginx
- Postgres persistence through **Supabase** using `DATABASE_URL`

### Current deployed environment

The application is currently deployed and publicly reachable at:

- https://cloudsmiths.jono.me/

This is the primary live URL for the project.

The live site is currently hosted on **Google Cloud Run**.

### Required GitHub secrets

- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT_EMAIL`
- `SUPABASE_DATABASE_URL`

### Recommended GitHub repository variables

- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GAR_LOCATION`
- `GAR_REPOSITORY`
- `BACKEND_SERVICE_NAME`
- `FRONTEND_SERVICE_NAME`
- `FRONTEND_BACKEND_API_URL`
- `FRONTEND_AUTH_BASE_URL`

### Deployment notes

- `SUPABASE_DATABASE_URL` should be the Supabase pooled/direct Postgres connection string.
- Cloud Run injects `PORT`; the backend already respects it.
- The workflow builds and pushes Docker images to Artifact Registry before deploying both services.
- For Supabase, SSL should remain enabled in hosted environments.

### First-time dev bootstrap for GCP

If you have created a fresh GCP project and want to bootstrap the deployment prerequisites before moving to Terraform, use:

```bash
bash infra/dev/bootstrap-gcp.sh
```

See `infra/dev/README.md` for the required environment variables, what the script creates, and which GitHub secrets/variables you must set afterwards.

## Team quality automation

This repository now includes guardrails that help enforce the coding standards:

- `Husky` local hooks to stop low-quality changes before they leave a developer machine
- a pull request GitHub Actions workflow that validates every PR targeting `main`

### Local hooks

- `pre-commit` runs `npm run lint`
- `pre-push` runs `npm run test && npm run build`

After pulling these changes, run:

```bash
npm install
```

That will execute the `prepare` script and activate Husky hooks locally.

### Pull request workflow

The workflow at `.github/workflows/pull-request-quality.yml` runs on PRs into `main` and:

- installs dependencies with `npm ci`
- lints the workspace
- runs the full test suite
- builds the workspace
- uploads coverage artifacts for review/debugging.

The repository includes tests for:

- frontend services/components/utilities
- backend favorites service
- shared types library

## Coverage reports

Running tests writes HTML coverage reports into `coverage/`.

Typical report locations:

- `coverage/frontend/index.html`
- `coverage/backend/index.html`
- `coverage/types/index.html`

Open them on macOS with:

```bash
open coverage/frontend/index.html
open coverage/backend/index.html
open coverage/types/index.html
```

## Known behavior and caveats

- Authentication is required before the browser UI becomes available.
- The favorites experience depends on the backend running locally.
- Favorites persistence can use either the legacy local file store or local Postgres.
- The favorites tab now shows explicit loading, load-error, and update-error states.

## Deployment notes

For non-local environments, the main requirements are:

1. deploy the frontend as a static Vite build
2. deploy the NestJS backend as a long-running HTTP service
3. provide a writable persistent volume for file storage or configure a database connection
4. set environment-specific frontend values for:
   - `BACKEND_API_URL`
   - `AUTH_BASE_URL`
5. ensure CORS is configured correctly between the deployed frontend and backend

For assessment/local use, file-backed persistence is still available. For shared or production-like environments, Postgres is the better default.

## Suggested onboarding path for new developers

1. Run `npm install`
2. Start the backend with `npm run dev:backend`
3. Start the frontend with `npm run dev:frontend`
4. Read `docs/spec.md` for delivered scope
5. Read `docs/kanban.md` for current status and future ideas
6. Review `apps/frontend/src/App.tsx` to understand the main user flow
7. Review `apps/backend/src/favorites` to understand persistence

## Current project status

The implemented functionality covers the original requirements and extends them with additional features.

The main improvements beyond the brief are authentication, persistent favorites, shared types, caching, retry handling, and broader automated testing.

Additional improvements implemented in this solution:

- explicit favorites loading and update error UI
- clearer no-results breed search empty state
- configurable auth and backend frontend environment variables
- integration-style frontend coverage for login, browse, and favorites flows

Quality workflow improvements in this repo:

- Husky pre-commit and pre-push hooks for local quality gates
- a GitHub Actions PR workflow that runs lint, test, and build checks for changes targeting `main`

Current state:

- live deployment is available
- documentation reflects the current architecture rather than the original frontend-only brief
- the implemented scope is documented in this repository
