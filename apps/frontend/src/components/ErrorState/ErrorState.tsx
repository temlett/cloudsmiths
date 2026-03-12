import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  message: string;
  hint?: string;
}

export function ErrorState({
  message,
  hint = "Is the backend running?",
}: ErrorStateProps) {
  return (
    <div className={styles.error} role="alert">
      <h2 className={styles.title}>Something went wrong</h2>
      <p className={styles.message}>{message}</p>
      <p className={styles.nudge}>{hint}</p>
    </div>
  );
}
