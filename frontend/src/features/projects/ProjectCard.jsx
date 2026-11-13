import { Link } from 'react-router-dom';
import { SafeImage } from '../../components/SafeImage.jsx';
import { projectPath } from '../../config/routes.js';
import styles from './ProjectCard.module.css';

export function ProjectCard({ project }) {
  return (
    <article>
      <Link to={projectPath(project.slug)} className={styles.card}>
        <SafeImage className={styles.image} src={project.image} alt="" />
        <h2 className={styles.name}>{project.name}</h2>
        {project.summary && <p className={styles.summary}>{project.summary}</p>}
        <p className={styles.meta}>
          {[
            project.project_type,
            project.storeys,
            project.status_display,
            project.in_competition && 'Competition entry', // set by the "Show in: Competition" button in the admin
          ].filter(Boolean).map((fact) => (
            <span key={fact}>{fact}</span>
          ))}
        </p>
      </Link>
    </article>
  );
}
