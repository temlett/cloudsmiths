import styles from './DogImageGallery.module.css'

interface DogImageGalleryProps {
  breedName: string
  images: string[]
}

export function DogImageGallery({ breedName, images }: DogImageGalleryProps) {
  return (
    <section className={styles.gallerySection}>
      <div className={styles.header}>
        <h2 className={styles.title}>{breedName}</h2>
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
