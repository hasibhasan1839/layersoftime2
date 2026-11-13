import { Link, NavLink } from 'react-router-dom';
import { NAV_ITEMS, ROUTES } from '../config/routes.js';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to={ROUTES.home} className={styles.brand}>Layers of Time</Link>
        <nav aria-label="Main">
          <ul className={styles.nav}>
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} className={styles.link}>{label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
