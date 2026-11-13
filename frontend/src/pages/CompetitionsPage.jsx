import { Link } from 'react-router-dom';
import { competitionsApi } from '../api';
import { AsyncBoundary } from '../components/AsyncBoundary.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { SafeImage } from '../components/SafeImage.jsx';
import { projectPath } from '../config/routes.js';
import { ProjectCard } from '../features/projects/ProjectCard.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useQuery } from '../hooks/useQuery.js';
import { splitParagraphs } from '../lib/format.js';
import styles from './CompetitionsPage.module.css';

export default function CompetitionsPage() {
  usePageTitle('Competitions');
  const query = useQuery(['competitions'], ({ signal }) => competitionsApi.list({ signal }));

  return (
    <>
      <PageHeader title="Competitions" intro="Entries to open design competitions." />
      <AsyncBoundary query={query} emptyMessage="No competition entries have been added yet.">
        {(competitions) => (
          <ul className={styles.list}>
            {competitions.map((competition) => (
              <li key={competition.id}>
                <article className={styles.entry}>
                  <SafeImage className={styles.image} src={competition.image} alt={competition.name} />
                  <div>
                    {/* The project is shown once: the title links to its page instead of a second card below */}
                    <h2>
                      {competition.project_detail ? (
                        <Link to={projectPath(competition.project_detail.slug)}>{competition.name}</Link>
                      ) : competition.name}
                    </h2>
                    {splitParagraphs(competition.description).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                </article>
                {competition.awards?.length > 0 && (
                  <section className={styles.awards} aria-label={`Award-winning projects in ${competition.name}`}>
                    <h3>Winning projects</h3>
                    <div className={styles.awardGrid}>
                      {competition.awards.map((award) => (
                        <div key={award.id}>
                          <p className={styles.prize}>{award.prize}</p>
                          <ProjectCard project={award.project} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </li>
            ))}
          </ul>
        )}
      </AsyncBoundary>
    </>
  );
}
