import { useEffect } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import { useTeam } from '../hooks/useContent.js'

function Roster({ team }) {
  if (team.length < 2) return null
  return (
    <Reveal className="container roster" delay={60}>
      <span className="mono roster__label">The team</span>
      <ul className="roster__list">
        {team.map((p, i) => (
          <li key={p.id}>
            <a href={`#person-${p.slug || p.id}`} className="roster__item">
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="roster__name">{p.name}</span>
              <span className="roster__role">{p.designation}</span>
            </a>
          </li>
        ))}
      </ul>
    </Reveal>
  )
}

function Facts({ person }) {
  const rows = [
    ['Role', person.designation],
    ['Experience', person.experience],
    ['Qualifications', person.qualifications],
    ['Focus', person.specialization],
    ['Based in', person.location],
  ].filter(([, value]) => value)

  if (!rows.length) return null

  return (
    <dl className="person__facts">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Person({ person, index }) {
  const flip = index % 2 === 1
  const initial = (person.name || '?').charAt(0).toUpperCase()

  const links = [
    person.email && { label: person.email, href: `mailto:${person.email}` },
    person.phoneNo && { label: person.phoneNo, href: `tel:${person.phoneNo.replace(/\s/g, '')}` },
    person.linkedin && { label: 'LinkedIn', href: person.linkedin, external: true },
    person.website && { label: 'Website', href: person.website, external: true },
  ].filter(Boolean)

  return (
    <Reveal
      as="article"
      id={`person-${person.slug || person.id}`}
      className={`person ${flip ? 'person--flip' : ''}`}
    >
      <div className="person__portrait">
        {person.photo ? (
          <img src={person.photo} alt={`${person.name}, ${person.designation}`} loading={index < 2 ? 'eager' : 'lazy'} />
        ) : (
          <div className="person__placeholder" aria-hidden="true">{initial}</div>
        )}
      </div>

      <div className="person__body">
        <p className="person__index mono">
          {String(index + 1).padStart(2, '0')} <i /> {person.designation}
        </p>
        <h2 className="person__name">{person.name}</h2>
        {person.tagline && <p className="person__tagline">{person.tagline}</p>}

        <Facts person={person} />

        {person.bioParagraphs.length > 0 && (
          <div className="person__bio">
            {person.bioParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}

        {person.expertise.length > 0 && (
          <div className="person__expertise">
            <span className="label">Areas of expertise</span>
            <ul>
              {person.expertise.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {links.length > 0 && (
          <div className="person__links">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                {...(l.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {l.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </Reveal>
  )
}

export default function Team() {
  const { team, loading } = useTeam()

  useEffect(() => {
    document.title = 'Our Professionals — Layers of Time'
  }, [])

  return (
    <>
      <PageHeader
        index="06"
        eyebrow="People"
        title={
          <>
            Our Profes<em>sionals.</em>
          </>
        }
        aside={
          <>
            <span className="mono">Studio</span>
            <span>{String(team.length).padStart(2, '0')} {team.length === 1 ? 'member' : 'members'}</span>
          </>
        }
      >
        The people behind the work — architects, designers and thinkers who share a belief that
        buildings should age as gracefully as the cities they belong to.
      </PageHeader>

      {loading ? (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>Loading…</div>
      ) : !team.length ? (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--muted)' }}>
          No team members yet.
        </div>
      ) : (
        <>
          <Roster team={team} />
          <div className="container people">
            {team.map((person, i) => (
              <Person key={person.id} person={person} index={i} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
