import type { PropsWithChildren } from 'react'

import styles from './PageLayout.module.css'

interface PageLayoutProps extends PropsWithChildren {
  title: string
  description: string
}

export function PageLayout({ title, description, children }: PageLayoutProps) {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Cloudsmiths Dog Browser</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </header>
      <section className={styles.content}>{children}</section>
    </main>
  )
}
