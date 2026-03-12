import type { BreedOption } from '../../types/dog'

import styles from './BreedListItem.module.css'

interface BreedListItemProps {
  breed: BreedOption
  isSelected: boolean
  onSelect: (breed: BreedOption) => void
}

export function BreedListItem({
  breed,
  isSelected,
  onSelect,
}: BreedListItemProps) {
  return (
    <li>
      <button
        className={`${styles.item} ${isSelected ? styles.selected : ''}`.trim()}
        type="button"
        onClick={() => onSelect(breed)}
      >
        <span>{breed.label}</span>
        <span className={styles.meta}>{breed.subBreeds.length} sub-breeds</span>
      </button>
    </li>
  )
}
