import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppErrorBoundary } from '../components/AppErrorBoundary.jsx';
import { SiteFooter } from './SiteFooter.jsx';
import { SiteHeader } from './SiteHeader.jsx';
import styles from './Layout.module.css';

export function Layout() {
  const { pathname } = useLocation();
  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main" className="container">
        {/* Keyed by path: a crash on one page is cleared by navigating elsewhere. */}
        <AppErrorBoundary key={pathname}>
          <Suspense fallback={<p role="status" className="sr-only">Loading</p>}>
            <Outlet />
          </Suspense>
        </AppErrorBoundary>
      </main>
      <SiteFooter />
    </div>
  );
}
