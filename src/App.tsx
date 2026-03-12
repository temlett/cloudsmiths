import { useState } from 'react'

import { BreedList } from './components/BreedList'
import { BreedSearch } from './components/BreedSearch'
import { DogImageGallery } from './components/DogImageGallery'
import { ErrorState } from './components/ErrorState'
import { LoadingState } from './components/LoadingState'
import { PageLayout } from './components/PageLayout'
import { useBreedImages } from './hooks/useBreedImages'
import { useBreeds } from './hooks/useBreeds'
import type { BreedOption } from './types/dog'
import styles from './App.module.css'

function App() {
  const [query, setQuery] = useState('')
  const [selectedBreed, setSelectedBreed] = useState<BreedOption | null>(null)
  const { breeds, isLoading, error } = useBreeds()
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
      description="A starter structure for the Cloudsmiths challenge with feature folders, reusable UI pieces, and room for the API flow."
    >
      <div className={styles.shell}>
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
                onSelect={setSelectedBreed}
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
              <DogImageGallery breedName={selectedBreed.label} images={images} />
            )}
          </section>
        </div>
      </div>
    </PageLayout>
  )
}

export default App
