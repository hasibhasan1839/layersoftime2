import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="container not-found">
      <span className="mono">404</span>
      <h1 className="display">
        This page hasn’t <em>been built yet.</em>
      </h1>
      <Link to="/" className="btn btn--accent">
        Back to home <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}
