import styles from './DogImageGallery.module.css'

interface DogImageGalleryProps {
  breedName: string
  images: string[]
  isFavorite?: boolean
}

export function DogImageGallery({ breedName, images, isFavorite = false }: DogImageGalleryProps) {
  return (
    <section className={styles.gallerySection}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{breedName}</h2>
          <p className={styles.favoriteCopy}>{isFavorite ? 'Saved to favorites' : 'Not in favorites yet'}</p>
        </div>
        <p className={styles.copy}>{images.length} images available</p>
      </div>
      <div className={styles.grid}>
        {images.slice(0, 12).map((image) => (
          <img
            key={image}
            className={styles.image}
            src={image}
            alt={`${breedName} dog`}
            loading="lazy"
          />
        ))}
      </div>
    </section>
  )
}
