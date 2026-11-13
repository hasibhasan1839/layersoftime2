import { Link, useParams } from 'react-router-dom';
import { projectsApi } from '../api';
import { AsyncBoundary } from '../components/AsyncBoundary.jsx';
import { Gallery } from '../components/Gallery.jsx';
import { ROUTES } from '../config/routes.js';
import { getProjectGalleryItems } from '../features/projects/projectImages.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useQuery } from '../hooks/useQuery.js';
import { splitParagraphs } from '../lib/format.js';
import styles from './ProjectDetailPage.module.css';

function ProjectDetail({ project }) {
  usePageTitle(project.name);
  const facts = [
    ['Type', project.project_type],
    ['Storeys', project.storeys],
    ['Status', project.status_display],
  ].filter(([, value]) => value);

  return (
    <article>
      <header className={styles.header}>
        <h1>{project.name}</h1>
        {project.summary && <p className={styles.summary}>{project.summary}</p>}
        <dl className={styles.facts}>
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </header>
      <div className={styles.body}>
        {splitParagraphs(project.description).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <Gallery items={getProjectGalleryItems(project)} showCaptions={false} />
    </article>
  );
}

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const query = useQuery(['project', slug], ({ signal }) => projectsApi.getBySlug(slug, { signal }));

  return (
    <>
      <p className={styles.back}><Link to={ROUTES.projects}>All projects</Link></p>
      <AsyncBoundary query={query}>{(project) => <ProjectDetail project={project} />}</AsyncBoundary>
    </>
  );
}
