# Dog Breed Browser — Status Kanban

This board reflects the current truth of the delivered solution rather than the original implementation plan.

## Done

### Core assessment requirements

- React frontend built for browsing dog breeds
- Dog CEO breed list fetched on app startup
- API response transformed into a frontend-friendly breed list
- Breed search/filter implemented with case-insensitive partial matching
- Breed selection state implemented
- Random breed image loading implemented
- Loading and error states implemented for breed and image requests
- Clear component and hook separation implemented

### Delivered product enhancements

- Nx monorepo structure created
- NestJS backend added for favorites persistence
- Shared `@cloudsmiths/types` library added
- Authentication flow integrated with DummyJSON
- Session persistence and token refresh implemented
- Favorites save/remove workflow implemented
- Dedicated favorites gallery tab implemented
- Modal image preview implemented
- Refresh action for breed images implemented
- Response caching added for breeds and favorites
- In-memory caching added for breed images
- Retry handling added for Dog CEO rate limiting
- File-based local persistence added via `data/favorites.json`
- TypeORM persistence layer added for favorites
- PostgreSQL local development support added via Docker Compose
- Favorites storage selection added via `FAVORITES_STORAGE`
- Backend `.env` loading added via `dotenv`
- Local Postgres host port moved to `5431` to avoid clashes with existing local databases

### Quality and validation

- Frontend tests added for services, utilities, and components
- Backend tests added for favorites service
- Shared library tests added
- Coverage reporting enabled
- Integration-style frontend tests added for login, browsing, search-empty-state, and favorites flows
- README updated to document workspace usage
- Spec updated to describe delivered scope accurately

---

## Done, But Worth Noting

- The original brief described a frontend-only browser, but the delivered app now requires authentication and a local backend to access the full experience.
- The original out-of-scope areas of authentication and persistence were implemented as stretch improvements.
- Frontend auth and favorites base URLs are now configurable via documented environment variables.
- The backend now supports either the legacy JSON file store or local Postgres without changing API behavior.
- Deployment beyond local use will still benefit from stronger database setup practices such as migrations and managed environment configuration.

---

## Nice to Have / Future Improvements

- Add browser-level end-to-end tests against a running deployed stack
- Add proper database migrations for the Postgres-backed favorites store
- Add richer deployment automation and environment-specific operational documentation

---

## Not Planned Right Now

- SSR or framework migration
- Complex multi-page routing
- Enterprise accessibility audit
- Cloud deployment automation for this assessment submission
