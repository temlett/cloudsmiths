import styles from "./DogImageGallery.module.css";

interface DogImageGalleryProps {
  breedName: string;
  images: string[];
  favoriteImageUrls: Set<string>;
  isFavoritePending?: boolean;
  onImageSelect: (imageUrl: string) => void;
  onRefresh: () => void;
  onToggleFavorite: (imageUrl: string) => void;
}

export function DogImageGallery({
  breedName,
  images,
  favoriteImageUrls,
  isFavoritePending = false,
  onImageSelect,
  onRefresh,
  onToggleFavorite,
}: DogImageGalleryProps) {
  return (
    <section className={styles.gallerySection}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{breedName}</h2>
          <p className={styles.favoriteCopy}>
            Select specific images to save to favorites
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.refreshButton}
            type="button"
            onClick={onRefresh}
          >
            Refresh images
          </button>
          <p className={styles.copy}>{images.length} images available</p>
        </div>
      </div>
      <div className={styles.grid}>
        {images.slice(0, 12).map((image) => (
          <article key={image} className={styles.card}>
            <button
              className={styles.imageButton}
              type="button"
              onClick={() => onImageSelect(image)}
              aria-label={`View ${breedName} image larger`}
              title={`View ${breedName} image larger`}
            >
              <img
                className={styles.image}
                src={image}
                alt={`${breedName} dog`}
                loading="lazy"
              />
              <span className={`${styles.tooltip} ${styles.imageTooltip}`}>
                View larger
              </span>
            </button>
            <button
              className={`${styles.favoriteButton} ${favoriteImageUrls.has(image) ? styles.favoriteActive : ""}`.trim()}
              type="button"
              disabled={isFavoritePending}
              onClick={() => onToggleFavorite(image)}
              title={
                favoriteImageUrls.has(image)
                  ? `Remove ${breedName} image from favorites`
                  : `Save ${breedName} image to favorites`
              }
              aria-label={
                favoriteImageUrls.has(image)
                  ? `Remove ${breedName} image from favorites`
                  : `Save ${breedName} image to favorites`
              }
            >
              {favoriteImageUrls.has(image) ? "★" : "☆"}
              <span className={`${styles.tooltip} ${styles.iconTooltip}`}>
                {favoriteImageUrls.has(image)
                  ? "Remove favorite"
                  : "Add favorite"}
              </span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
