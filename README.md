# Cloudsmiths Dog Breed Browser Monorepo

This repository is now an Nx workspace containing:

- `apps/frontend` (`@cloudsmiths/frontend`): the React + Vite dog breed browser
- `apps/backend` (`@cloudsmiths/backend`): a NestJS API for persisting favorite breeds

The frontend still fulfills the original assessment requirements from `docs/spec.md` and now also supports saving/removing favorite breeds through the backend.

## Workspace structure

```text
apps/
  frontend/        # React SPA powered by Vite
  backend/         # NestJS API with file-based persistence
libs/
  types/           # Shared TypeScript types used across apps (@cloudsmiths/types)
docs/              # spec and kanban reference docs
```

## Prerequisites

- Node.js 20+
- npm 10+

## Install dependencies

```bash
npm install
```

## Run the apps

Start the favorites API:

```bash
npm run dev:api
```

In another terminal, start the frontend:

```bash
npm run dev:frontend
```

App URLs:

- Frontend: `http://localhost:4200`
- Favorites API: `http://localhost:3333`

If needed, you can point the frontend at a different API URL with:

```bash
VITE_FAVORITES_API_URL=http://localhost:3333 npm run dev:frontend
```

## Available scripts

```bash
npm run dev            # start the frontend through Nx
npm run dev:frontend   # start the Vite frontend
npm run dev:api        # start the favorites backend in watch mode
npm run build          # build all Nx projects
npm run build:frontend # build the frontend only
npm run build:api      # compile the backend only
npm run lint           # lint all Nx projects
npm run preview        # preview the frontend production build
```

## Favorites API

The backend persists favorites in `data/favorites.json` at the workspace root and exposes:

- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/:breed`

Example POST payload:

```json
{
  "breed": "beagle",
  "label": "Beagle"
}
```

## Validation

The workspace has been validated with:

```bash
npm run build
npm run lint
```
