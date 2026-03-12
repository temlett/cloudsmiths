import type { BreedOption } from '@cloudsmiths/types'
import { BreedListItem } from '../BreedListItem'

import styles from './BreedList.module.css'

interface BreedListProps {
  breeds: BreedOption[]
  selectedBreed: string | null
  favoriteBreeds: Set<string>
  isFavoritePending: boolean
  onSelect: (breed: BreedOption) => void
  onToggleFavorite: (breed: BreedOption) => void
}

export function BreedList({
  breeds,
  selectedBreed,
  favoriteBreeds,
  isFavoritePending,
  onSelect,
  onToggleFavorite,
}: BreedListProps) {
  return (
    <ul className={styles.list}>
      {breeds.map((breed) => (
        <BreedListItem
          key={breed.id}
          breed={breed}
          isSelected={breed.value === selectedBreed}
          isFavorite={favoriteBreeds.has(breed.value)}
          isFavoritePending={isFavoritePending}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </ul>
  )
}
