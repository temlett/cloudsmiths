import { useEffect, useState } from "react";

import { AuthPanel } from "./components/AuthPanel";
import { BreedList } from "./components/BreedList";
import { BreedSearch } from "./components/BreedSearch";
import { DogImageGallery } from "./components/DogImageGallery";
import { ErrorState } from "./components/ErrorState";
import { FavoritesGallery } from "./components/FavoritesGallery";
import { LoadingState } from "./components/LoadingState";
import { PageLayout } from "./components/PageLayout";
import { useBreedImages } from "./hooks/useBreedImages";
import { useBreeds } from "./hooks/useBreeds";
import { useFavorites } from "./hooks/useFavorites";
import {
  clearStoredSession,
  getValidAccessSession,
  hydrateAuthSession,
  loginWithCredentials,
} from "./services/auth";
import type { BreedOption, FavoriteImage } from "@cloudsmiths/types";
import type { AuthSession } from "@cloudsmiths/types";
import styles from "./App.module.css";

function App() {
  const [query, setQuery] = useState("");
  const [selectedBreed, setSelectedBreed] = useState<BreedOption | null>(null);
  const [activeTab, setActiveTab] = useState<"browse" | "favorites">("browse");
  const [enlargedImage, setEnlargedImage] = useState<{
    imageUrl: string;
    label: string;
  } | null>(null);
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [isAuthBootstrapping, setIsAuthBootstrapping] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { breeds, isLoading, error } = useBreeds();
  const {
    favorites,
    favoriteImageUrls,
    isLoading: favoritesLoading,
    isUpdating: favoritesUpdating,
    loadError: favoritesLoadError,
    updateError: favoritesUpdateError,
    toggleFavorite,
  } = useFavorites();
  const {
    images,
    isLoading: imagesLoading,
    error: imagesError,
    refreshImages,
  } = useBreedImages(selectedBreed?.value ?? null);

  const filteredBreeds = breeds.filter((breed) =>
    breed.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const session = await hydrateAuthSession();

      if (!isMounted) {
        return;
      }

      setAuthSession(session);
      setIsAuthBootstrapping(false);
    }

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!authSession) {
      return undefined;
    }

    const currentSession = authSession;
    let isMounted = true;
    const timeoutId = window.setTimeout(
      () => {
        void scheduleRefresh();
      },
      Math.max(currentSession.expiresAt - Date.now() - 30_000, 0),
    );

    async function scheduleRefresh() {
      try {
        const nextSession = await getValidAccessSession(currentSession);

        if (isMounted && nextSession !== currentSession) {
          setAuthSession(nextSession);
        }
      } catch (refreshError) {
        if (!isMounted) {
          return;
        }

        clearStoredSession();
        setAuthSession(null);
        setAuthError(
          refreshError instanceof Error
            ? refreshError.message
            : "Your session expired. Please sign in again.",
        );
      }
    }

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [authSession]);

  useEffect(() => {
    if (!enlargedImage) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setEnlargedImage(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enlargedImage]);

  function openFavoriteBreed(favorite: FavoriteImage) {
    const breedOption =
      breeds.find((breed) => breed.value === favorite.breed) ?? null;

    if (!breedOption) {
      return;
    }

    setSelectedBreed(breedOption);
    setActiveTab("browse");
  }

  async function handleLogin(credentials: {
    username: string;
    password: string;
  }) {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const session = await loginWithCredentials(
        credentials.username.trim(),
        credentials.password,
      );
      setAuthSession(session);
    } catch (loginError) {
      setAuthError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in with those credentials.",
      );
    } finally {
      setIsAuthenticating(false);
    }
  }

  function handleLogout() {
    clearStoredSession();
    setAuthSession(null);
    setAuthError(null);
  }

  return (
    <PageLayout
      title="Browse dog breeds"
      description="Authenticate with DummyJSON, explore dog breeds, and keep favorite images backed by the local API."
      headerAction={
        authSession ? (
          <AuthPanel
            user={authSession.user}
            isAuthenticating={false}
            authError={null}
            onSubmit={handleLogin}
            onLogout={handleLogout}
          />
        ) : null
      }
    >
      <div className={styles.shell}>
        {!authSession ? (
          <AuthPanel
            user={null}
            isAuthenticating={isAuthenticating || isAuthBootstrapping}
            authError={authError}
            onSubmit={handleLogin}
            onLogout={handleLogout}
          />
        ) : null}

        {!authSession ? (
          <section className={styles.authGate}>
            <p className={styles.helperText}>
              Sign in to unlock the dog browser. Your password is only sent to
              DummyJSON for authentication and is never stored locally.
            </p>
          </section>
        ) : null}

        {authSession ? (
          <>
            <div
              className={styles.tabs}
              role="tablist"
              aria-label="Dog browser sections"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "browse"}
                className={`${styles.tab} ${activeTab === "browse" ? styles.tabActive : ""}`.trim()}
                onClick={() => setActiveTab("browse")}
              >
                Dog search
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "favorites"}
                className={`${styles.tab} ${activeTab === "favorites" ? styles.tabActive : ""}`.trim()}
                onClick={() => setActiveTab("favorites")}
              >
                Favorites gallery{" "}
                {favorites.length > 0 ? `(${favorites.length})` : ""}
              </button>
            </div>

            {activeTab === "browse" ? (
              <>
                <div>
                  <BreedSearch query={query} onQueryChange={setQuery} />
                </div>
                <div className={styles.panelGrid}>
                  <aside className={styles.panel}>
                    <div className={styles.breedListScroll}>
                      {isLoading ? (
                        <LoadingState label="Loading breeds..." />
                      ) : error ? (
                        <ErrorState message={error} />
                      ) : filteredBreeds.length === 0 ? (
                        <div
                          className={styles.emptyState}
                          role="status"
                          aria-live="polite"
                        >
                          <div className={styles.emptyStateContent}>
                            <h2 className={styles.emptyStateTitle}>
                              No breeds match “{query.trim()}”
                            </h2>
                            <p className={styles.helperText}>
                              Try a broader search or clear the filter to browse
                              every available breed.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <BreedList
                          breeds={filteredBreeds}
                          selectedBreed={selectedBreed?.value ?? null}
                          onSelect={setSelectedBreed}
                        />
                      )}
                    </div>
                  </aside>

                  <section className={styles.galleryPanel}>
                    {!selectedBreed ? (
                      <div className={styles.emptyState}>
                        <p>Select a breed to load its gallery.</p>
                      </div>
                    ) : imagesLoading ? (
                      <LoadingState
                        label={`Loading ${selectedBreed.label} images...`}
                      />
                    ) : imagesError ? (
                      <ErrorState message={imagesError} />
                    ) : (
                      <DogImageGallery
                        breedName={selectedBreed.label}
                        images={images}
                        favoriteImageUrls={favoriteImageUrls}
                        isFavoritePending={favoritesUpdating}
                        onImageSelect={(imageUrl) => {
                          setEnlargedImage({
                            imageUrl,
                            label: selectedBreed.label,
                          });
                        }}
                        onRefresh={() => {
                          void refreshImages();
                        }}
                        onToggleFavorite={(imageUrl) => {
                          void toggleFavorite({
                            breed: selectedBreed.value,
                            label: selectedBreed.label,
                            imageUrl,
                          });
                        }}
                      />
                    )}
                  </section>
                </div>
              </>
            ) : (
              <section className={styles.favoritesSection}>
                <div className={styles.favoritesContent}>
                  {favoritesLoading ? (
                    <LoadingState label="Loading favorites..." />
                  ) : null}

                  {favoritesLoadError ? (
                    <ErrorState
                      message={favoritesLoadError}
                      hint="Start the backend API or check the configured favorites base URL."
                    />
                  ) : null}

                  {favoritesUpdateError ? (
                    <ErrorState
                      message={favoritesUpdateError}
                      hint="The favorites list is still available. Try the action again in a moment."
                    />
                  ) : null}

                  {!favoritesLoading && !favoritesLoadError ? (
                    <FavoritesGallery
                      favorites={favorites}
                      isUpdating={favoritesUpdating}
                      onImageSelect={(favorite) => {
                        setEnlargedImage({
                          imageUrl: favorite.imageUrl,
                          label: favorite.label,
                        });
                      }}
                      onOpenBreed={openFavoriteBreed}
                      onRemove={(favoriteId) => {
                        const favorite = favorites.find(
                          (item) => item.id === favoriteId,
                        );
                        if (!favorite) {
                          return;
                        }
                        void toggleFavorite(favorite);
                      }}
                    />
                  ) : null}
                </div>
              </section>
            )}

            {enlargedImage ? (
              <div
                className={styles.modalBackdrop}
                role="presentation"
                onClick={() => setEnlargedImage(null)}
              >
                <div
                  className={styles.modal}
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Expanded image of ${enlargedImage.label}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className={styles.modalClose}
                    onClick={() => setEnlargedImage(null)}
                    aria-label="Close image preview"
                  >
                    ✕
                  </button>
                  <img
                    className={styles.modalImage}
                    src={enlargedImage.imageUrl}
                    alt={`${enlargedImage.label} dog enlarged preview`}
                  />
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </PageLayout>
  );
}

export default App;
