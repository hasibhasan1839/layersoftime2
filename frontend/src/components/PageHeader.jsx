import styles from './PageHeader.module.css';

export function PageHeader({ title, intro }) {
  return (
    <header className={styles.header}>
      <h1>{title}</h1>
      {intro && <p className={styles.intro}>{intro}</p>}
    </header>
  );
}
