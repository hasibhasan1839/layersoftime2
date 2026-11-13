import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader.jsx';
import { ROUTES } from '../config/routes.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function NotFoundPage() {
  usePageTitle('Page not found');
  return (
    <>
      <PageHeader title="Page not found" intro="That address does not match any page on this site." />
      <p><Link to={ROUTES.home}>Go to the home page</Link></p>
    </>
  );
}
