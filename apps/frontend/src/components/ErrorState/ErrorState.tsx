import styles from './ErrorState.module.css'

interface ErrorStateProps {
  message: string
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className={styles.error} role="alert">
      <h2 className={styles.title}>Something went wrong</h2>
      <p className={styles.message}>{message}</p>
      <p className={styles.nudge}>Is the backend running?</p>
    </div>
  )
}
