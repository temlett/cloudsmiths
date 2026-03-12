import type { BreedOption } from '@cloudsmiths/types'

import styles from './BreedListItem.module.css'

interface BreedListItemProps {
  breed: BreedOption
  isSelected: boolean
  isFavorite: boolean
  isFavoritePending: boolean
  onSelect: (breed: BreedOption) => void
  onToggleFavorite: (breed: BreedOption) => void
}

export function BreedListItem({
  breed,
  isSelected,
  isFavorite,
  isFavoritePending,
  onSelect,
  onToggleFavorite,
}: BreedListItemProps) {
  return (
    <li>
      <div className={`${styles.item} ${isSelected ? styles.selected : ''}`.trim()}>
        <button className={styles.selectButton} type="button" onClick={() => onSelect(breed)}>
          <span>{breed.label}</span>
          <span className={styles.meta}>{breed.subBreeds.length} sub-breeds</span>
        </button>
        <button
          className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteActive : ''}`.trim()}
          type="button"
          onClick={() => onToggleFavorite(breed)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Remove ${breed.label} from favorites` : `Add ${breed.label} to favorites`}
          disabled={isFavoritePending}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>
    </li>
  )
}
