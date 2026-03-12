import styles from './LoadingState.module.css'

interface LoadingStateProps {
  label?: string
}

export function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <div className={styles.loading} aria-live="polite">
      <span className={styles.dot} />
      <span>{label}</span>
    </div>
  )
}
