import styles from './BreedSearch.module.css'

interface BreedSearchProps {
  query: string
  onQueryChange: (value: string) => void
}

export function BreedSearch({ query, onQueryChange }: BreedSearchProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>Search breeds</span>
      <input
        className={styles.input}
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Try husky, boxer, dalmatian..."
      />
    </label>
  )
}
