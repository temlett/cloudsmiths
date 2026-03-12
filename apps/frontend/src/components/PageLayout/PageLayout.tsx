import type { PropsWithChildren, ReactNode } from "react";

import styles from "./PageLayout.module.css";

interface PageLayoutProps extends PropsWithChildren {
  title: string;
  description: string;
  headerAction?: ReactNode;
}

export function PageLayout({
  title,
  description,
  headerAction,
  children,
}: PageLayoutProps) {
  return (
    <main className={styles.page}>
      <header className={styles.heroWrap}>
        {headerAction ? (
          <div className={styles.headerAction}>{headerAction}</div>
        ) : null}
        <div className={styles.hero}>
          <p className={styles.eyebrow}>Cloudsmiths Dog Browser</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>
      </header>
      <section className={styles.content}>{children}</section>
    </main>
  );
}
