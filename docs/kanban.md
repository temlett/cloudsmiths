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
- Frontend auth and favorites base URLs are now configurable via documented Vite environment variables.
- Deployment beyond local use will likely need a proper persistent datastore instead of file-backed storage.

---

## Nice to Have / Future Improvements

- Add browser-level end-to-end tests against a running deployed stack
- Replace file-backed favorites persistence with database-backed storage for shared environments
- Add richer deployment automation and environment-specific operational documentation

---

## Not Planned Right Now

- SSR or framework migration
- Complex multi-page routing
- Production-grade database persistence
- Enterprise accessibility audit
- Cloud deployment automation for this assessment submission
