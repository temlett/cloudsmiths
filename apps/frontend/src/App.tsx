import { useState } from 'react'

import { BreedList } from './components/BreedList'
import { BreedSearch } from './components/BreedSearch'
import { DogImageGallery } from './components/DogImageGallery'
import { ErrorState } from './components/ErrorState'
import { LoadingState } from './components/LoadingState'
import { PageLayout } from './components/PageLayout'
import { useBreedImages } from './hooks/useBreedImages'
import { useBreeds } from './hooks/useBreeds'
import { useFavorites } from './hooks/useFavorites'
import type { BreedOption } from '@cloudsmiths/types'
import styles from './App.module.css'

function App() {
  const [query, setQuery] = useState('')
  const [selectedBreed, setSelectedBreed] = useState<BreedOption | null>(null)
  const { breeds, isLoading, error } = useBreeds()
  const {
    favorites,
    favoriteBreeds,
    isLoading: favoritesLoading,
    isUpdating: favoritesUpdating,
    error: favoritesError,
    toggleFavorite,
  } = useFavorites()
  const {
    images,
    isLoading: imagesLoading,
    error: imagesError,
  } = useBreedImages(selectedBreed?.value ?? null)

  const filteredBreeds = breeds.filter((breed) =>
    breed.label.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <PageLayout
      title="Browse dog breeds"
      description="Explore dog breeds, view three random images, and persist your favorite breeds through the new backend API."
    >
      <div className={styles.shell}>
        <div>
          <p className={styles.helperText}>
            {favoritesLoading
              ? 'Loading favorites...'
              : favorites.length > 0
                ? 'Favorites'
                : 'No favorites saved yet. Use the star button to save one.'}
          </p>
          {favorites.length > 0 ? (
            <div className={styles.favoritesSummary}>
              {favorites.map((favorite) => (
                <span key={favorite.breed} className={styles.favoriteChip}>
                  {favorite.label}
                </span>
              ))}
            </div>
          ) : null}
          {favoritesError ? <ErrorState message={favoritesError} /> : null}
        </div>
        <div className={styles.panelGrid}>
          <aside className={styles.panel}>
            <BreedSearch query={query} onQueryChange={setQuery} />
            {isLoading ? (
              <LoadingState label="Loading breeds..." />
            ) : error ? (
              <ErrorState message={error} />
            ) : (
              <BreedList
                breeds={filteredBreeds}
                selectedBreed={selectedBreed?.value ?? null}
                favoriteBreeds={favoriteBreeds}
                isFavoritePending={favoritesUpdating}
                onSelect={setSelectedBreed}
                onToggleFavorite={(breed) => {
                  void toggleFavorite(breed)
                }}
              />
            )}
          </aside>

          <section className={styles.galleryPanel}>
            {!selectedBreed ? (
              <div className={styles.emptyState}>
                <p>Select a breed to load its gallery.</p>
              </div>
            ) : imagesLoading ? (
              <LoadingState label={`Loading ${selectedBreed.label} images...`} />
            ) : imagesError ? (
              <ErrorState message={imagesError} />
            ) : (
              <DogImageGallery
                breedName={selectedBreed.label}
                images={images}
                isFavorite={favoriteBreeds.has(selectedBreed.value)}
              />
            )}
          </section>
        </div>
      </div>
    </PageLayout>
  )
}

export default App
