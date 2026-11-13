import { Link } from 'react-router-dom';
import { SafeImage } from '../../components/SafeImage.jsx';
import { projectPath } from '../../config/routes.js';
import styles from './StrataHero.module.css';

const MAX_COURSES = 5;

/** Project covers stacked as horizontal courses; the one under the pointer or focus opens up. */
export function StrataHero({ projects }) {
  return (
    <ol className={styles.strata} aria-label="Selected projects">
      {projects.slice(0, MAX_COURSES).map((project) => (
        <li key={project.id} className={styles.course}>
          <Link to={projectPath(project.slug)} className={styles.link}>
            <SafeImage className={styles.image} src={project.image} alt="" loading="eager" />
            <span className={styles.label}>
              <span className={styles.name}>{project.name}</span>
              <span className={styles.meta}>{project.project_type}</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
