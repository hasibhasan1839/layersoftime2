import { Link } from 'react-router-dom';
import { projectsApi } from '../api';
import { AsyncBoundary } from '../components/AsyncBoundary.jsx';
import { ROUTES } from '../config/routes.js';
import { StrataHero } from '../features/projects/StrataHero.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useQuery } from '../hooks/useQuery.js';
import styles from './HomePage.module.css';

export default function HomePage() {
  usePageTitle();
  const query = useQuery(['projects'], ({ signal }) => projectsApi.list({ signal }));

  return (
    <>
      <header className={styles.intro}>
        <h1>Buildings, read in layers</h1>
        <p>A Dhaka studio working across architecture, drawing, photography and interior design.</p>
      </header>
      <AsyncBoundary query={query} emptyMessage="No projects have been published yet.">
        {(projects) => <StrataHero projects={projects} />}
      </AsyncBoundary>
      <p className={styles.more}>
        <Link to={ROUTES.projects}>See all projects</Link>
      </p>
    </>
  );
}
