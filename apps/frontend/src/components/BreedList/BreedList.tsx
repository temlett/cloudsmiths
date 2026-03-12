import type { BreedOption } from '@cloudsmiths/types'
import { BreedListItem } from '../BreedListItem'

import styles from './BreedList.module.css'

interface BreedListProps {
  breeds: BreedOption[]
  selectedBreed: string | null
  onSelect: (breed: BreedOption) => void
}

export function BreedList({
  breeds,
  selectedBreed,
  onSelect,
}: BreedListProps) {
  return (
    <ul className={styles.list}>
      {breeds.map((breed) => (
        <BreedListItem
          key={breed.id}
          breed={breed}
          isSelected={breed.value === selectedBreed}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}
