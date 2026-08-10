import { Archive, CalendarDays, CheckCircle2, FileWarning, Landmark } from 'lucide-react';

import type { HomeSnapshot } from '../../data/currentLeague';
import type { SourceStamp } from '../../domain/source';
import './LeagueOfficePage.css';

export interface LeagueOfficePageProps {
  snapshot: HomeSnapshot;
}

const sourceHierarchy = [
  {
    rank: '01',
    name: 'Sleeper',
    scope: 'League settings, users, rosters, draft metadata, draft order, and transactions.',
  },
  {
    rank: '02',
    name: 'Commissioner overlays',
    scope: 'Current contracts, exemptions, dues, rules, and commissioner corrections.',
  },
  {
    rank: '03',
    name: 'Historical corrections',
    scope: 'Explicit, versioned corrections to the league record.',
  },
  {
    rank: '04',
    name: '2022 constitution',
    scope: 'Legacy context only. It does not outrank current league data or current rulings.',
  },
] as const;

function sourceLabel(source: SourceStamp) {
  const authority = {
    sleeper: 'Sleeper',
    commissioner: 'Commissioner',
    'historical-correction': 'Historical correction',
    legacy: 'Legacy',
  }[source.authority];
  return `${authority} · ${source.state}`;
}

function snapshotTimestamp(source: SourceStamp) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
    timeZoneName: 'short',
  }).format(new Date(source.fetchedAt));
}

export function LeagueOfficePage({ snapshot }: LeagueOfficePageProps) {
  return (
    <div className="office-page">
      <header className="office-hero">
        <div>
          <span className="office-kicker"><Landmark size={17} /> Commissioner desk</span>
          <h1>League Office</h1>
          <p>
            Deadlines, data authority, and governing context—published with the source attached.
          </p>
        </div>
        <dl className="office-season-card">
          <div><dt>Season</dt><dd>{snapshot.season}</dd></div>
          <div><dt>League status</dt><dd>{snapshot.status.replaceAll('_', ' ')}</dd></div>
          <div><dt>Data state</dt><dd>{snapshot.source.state}</dd></div>
          <div><dt>Snapshot</dt><dd>{snapshotTimestamp(snapshot.source)}</dd></div>
        </dl>
      </header>

      <div className="office-layout">
        <section className="office-card office-sources" aria-labelledby="source-hierarchy-heading">
          <div className="office-card-heading">
            <div>
              <span>Trust order</span>
              <h2 id="source-hierarchy-heading">Source authority</h2>
            </div>
            <CheckCircle2 size={25} aria-hidden="true" />
          </div>
          <ol aria-label="Source authority hierarchy">
            {sourceHierarchy.map((source) => (
              <li key={source.rank}>
                <span>{source.rank}</span>
                <div>
                  <strong>{source.name}</strong>
                  <p>{source.scope}</p>
                </div>
                {source.rank === '04' && <em>Legacy</em>}
              </li>
            ))}
          </ol>
        </section>

        <section className="office-card office-deadlines" aria-labelledby="current-deadlines-heading">
          <div className="office-card-heading">
            <div>
              <span>League calendar</span>
              <h2 id="current-deadlines-heading">Current deadlines</h2>
            </div>
            <CalendarDays size={25} aria-hidden="true" />
          </div>
          <div className="office-deadline-list">
            {snapshot.deadlines.map((deadline) => (
              <article key={deadline.id}>
                <div className="office-date-block" aria-label={`${deadline.month} ${deadline.day}`}>
                  <small>{deadline.month}</small>
                  <strong>{deadline.day}</strong>
                </div>
                <div className="office-deadline-copy">
                  <span>{deadline.flag}</span>
                  <h3>{deadline.name}</h3>
                  <p>{deadline.detail}</p>
                </div>
                <small className="office-source-chip" data-authority={deadline.source.authority}>
                  {sourceLabel(deadline.source)}
                </small>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="office-legacy" aria-labelledby="legacy-constitution-heading">
        <div className="office-legacy-icon" aria-hidden="true"><Archive size={28} /></div>
        <div>
          <span><FileWarning size={14} /> Legacy reference</span>
          <h2 id="legacy-constitution-heading">2022 Constitution <em>Legacy</em></h2>
          <p>
            Preserved for historical context only. The 2022 document is not current authority for
            present-day rules, deadlines, contracts, or disputes.
          </p>
        </div>
        <strong>Read with caution</strong>
      </section>
    </div>
  );
}
