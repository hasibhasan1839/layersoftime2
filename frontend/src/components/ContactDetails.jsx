import { toTelHref } from '../lib/format.js';
import styles from './ContactDetails.module.css';

/** The studio's address, email and phone, shared by the Contact page and the footer. */
export function ContactDetails({ contact }) {
  return (
    <dl className={styles.list}>
      <div>
        <dt>Address</dt>
        <dd>{contact.address}</dd>
      </div>
      <div>
        <dt>Email</dt>
        <dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd>
      </div>
      <div>
        <dt>Phone</dt>
        <dd><a href={toTelHref(contact.phone_no)}>{contact.phone_no}</a></dd>
      </div>
    </dl>
  );
}
