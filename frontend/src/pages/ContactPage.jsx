import { contactApi } from '../api';
import { AsyncBoundary } from '../components/AsyncBoundary.jsx';
import { ContactDetails } from '../components/ContactDetails.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useQuery } from '../hooks/useQuery.js';

export default function ContactPage() {
  usePageTitle('Contact');
  const query = useQuery(['contact'], ({ signal }) => contactApi.get({ signal }));

  return (
    <>
      <PageHeader title="Contact" intro="For commissions, collaborations and questions, write or call the studio." />
      <AsyncBoundary query={query} emptyMessage="Contact details have not been published yet.">
        {(contact) => <ContactDetails contact={contact} />}
      </AsyncBoundary>
    </>
  );
}
