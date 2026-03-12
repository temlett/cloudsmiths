import type { FavoriteImage } from "@cloudsmiths/types";

import styles from "./FavoritesGallery.module.css";

interface FavoritesGalleryProps {
  favorites: FavoriteImage[];
  isUpdating: boolean;
  onImageSelect: (favorite: FavoriteImage) => void;
  onRemove: (favoriteId: string) => void;
  onOpenBreed: (favorite: FavoriteImage) => void;
}

export function FavoritesGallery({
  favorites,
  isUpdating,
  onImageSelect,
  onRemove,
  onOpenBreed,
}: FavoritesGalleryProps) {
  if (favorites.length === 0) {
    return <p className={styles.empty}>No favorite images saved yet.</p>;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Favorites gallery</h2>
        <p className={styles.copy}>{favorites.length} saved images</p>
      </div>
      <div className={styles.grid}>
        {favorites.map((favorite) => (
          <article key={favorite.id} className={styles.card}>
            <button
              type="button"
              className={styles.imageButton}
              onClick={() => onImageSelect(favorite)}
              aria-label={`View ${favorite.label} image larger`}
              title={`View ${favorite.label} image larger`}
            >
              <img
                className={styles.image}
                src={favorite.imageUrl}
                alt={`${favorite.label} dog`}
                loading="lazy"
              />
              <span className={`${styles.tooltip} ${styles.imageTooltip}`}>
                View larger
              </span>
            </button>
            <button
              type="button"
              className={styles.action}
              disabled={isUpdating}
              onClick={() => onRemove(favorite.id)}
              aria-label={`Remove ${favorite.label} image from favorites`}
              title={`Remove ${favorite.label} image from favorites`}
            >
              ✕
              <span className={`${styles.tooltip} ${styles.iconTooltip}`}>
                Remove favorite
              </span>
            </button>
            <button
              type="button"
              className={styles.browseAction}
              onClick={() => onOpenBreed(favorite)}
              aria-label={`Open ${favorite.label} in breed browser`}
              title={`Open ${favorite.label} in breed browser`}
            >
              ↗
              <span className={`${styles.tooltip} ${styles.iconTooltip}`}>
                Open breed
              </span>
            </button>
            <div className={styles.meta}>
              <strong>{favorite.label}</strong>
              <span>{favorite.breed}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
