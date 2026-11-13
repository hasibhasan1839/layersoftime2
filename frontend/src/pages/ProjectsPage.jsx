import { projectsApi } from '../api';
import { AsyncBoundary } from '../components/AsyncBoundary.jsx';
import { CategoryBrowser } from '../components/CategoryBrowser.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { ProjectCard } from '../features/projects/ProjectCard.jsx';
import { getProjectStatus } from '../features/projects/projectImages.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useQuery } from '../hooks/useQuery.js';
import styles from './ProjectsPage.module.css';

export default function ProjectsPage() {
  usePageTitle('Projects');
  const query = useQuery(['projects'], ({ signal }) => projectsApi.list({ signal }));

  return (
    <>
      <PageHeader title="Projects" intro="Built and proposed work, from first concept to completion." />
      <AsyncBoundary query={query} emptyMessage="No projects have been published yet.">
        {(projects) => (
          <CategoryBrowser items={projects} getCategory={getProjectStatus} filterLabel="Filter projects by status">
            {(visible) => (
              <div className={styles.grid}>
                {visible.map((project) => <ProjectCard key={project.id} project={project} />)}
              </div>
            )}
          </CategoryBrowser>
        )}
      </AsyncBoundary>
    </>
  );
}
