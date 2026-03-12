import type { BreedOption } from '@cloudsmiths/types'

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
      <div className={`${styles.item} ${isSelected ? styles.selected : ''}`.trim()}>
        <button className={styles.selectButton} type="button" onClick={() => onSelect(breed)}>
          <span>{breed.label}</span>
          <span className={styles.meta}>{breed.subBreeds.length} sub-breeds</span>
        </button>
      </div>
    </li>
  )
}
