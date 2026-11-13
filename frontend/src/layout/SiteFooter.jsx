import { contactApi } from '../api';
import { ContactDetails } from '../components/ContactDetails.jsx';
import { QueryStatus, useQuery } from '../hooks/useQuery.js';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  const { status, data: contact } = useQuery(['contact'], ({ signal }) => contactApi.get({ signal }));

  return (
    <footer className={styles.footer}>
      <div className="container">
        {/* The footer is non-essential: if the contact request fails, show nothing rather than an error. */}
        {status === QueryStatus.SUCCESS && contact && <ContactDetails contact={contact} />}
      </div>
    </footer>
  );
}
