import { useEffect, useState } from "react";

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
import type { BreedOption, FavoriteImage } from "@cloudsmiths/types";
import styles from "./App.module.css";

function App() {
  const [query, setQuery] = useState("");
  const [selectedBreed, setSelectedBreed] = useState<BreedOption | null>(null);
  const [activeTab, setActiveTab] = useState<"browse" | "favorites">("browse");
  const [enlargedImage, setEnlargedImage] = useState<{
    imageUrl: string;
    label: string;
  } | null>(null);
  const { breeds, isLoading, error } = useBreeds();
  const {
    favorites,
    favoriteImageUrls,
    isUpdating: favoritesUpdating,
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

  return (
    <PageLayout
      title="Browse dog breeds"
      description="Explore dog breeds, view three random images, and persist your favorite breeds through the new backend API."
    >
      <div className={styles.shell}>
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
      </div>
    </PageLayout>
  );
}

export default App;
