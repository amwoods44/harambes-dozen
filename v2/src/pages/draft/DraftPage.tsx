import type { CSSProperties } from 'react';
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LockKeyhole,
} from 'lucide-react';

import {
  sleeperAvatarUrl,
  type FranchiseSnapshot,
  type HomeSnapshot,
} from '../../data/currentLeague';
import type { DraftOrderEntry } from '../../domain/draft';
import type { SourceStamp } from '../../domain/source';
import './draft-page.css';

export type DraftViewerSession =
  | { kind: 'public' }
  | { kind: 'member'; userId: string; role?: 'member' | 'admin' };

export interface DraftPageProps {
  snapshot: HomeSnapshot;
  session: DraftViewerSession;
}

const centralDateTime = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/Chicago',
  timeZoneName: 'short',
});

const centralDraftTime = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/Chicago',
  timeZoneName: 'short',
});

function pickLabel(round: number, slot: number) {
  return `${round}.${String(slot).padStart(2, '0')}`;
}

function titleCase(value: string) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : 'Pending';
}

function initials(name: string, rosterId: number) {
  const monogram = name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

  return monogram || `R${rosterId}`;
}

function sourceLabel(source: SourceStamp) {
  const authority = source.authority === 'sleeper'
    ? 'Sleeper'
    : source.authority.replace('-', ' ');

  if (source.state === 'live') return `${authority} live`;
  if (source.state === 'cached') return `Cached ${authority} snapshot`;
  return `${authority} manual record`;
}

function DraftIdentity({
  entry,
  franchise,
  revealManager,
}: {
  entry: DraftOrderEntry;
  franchise?: FranchiseSnapshot;
  revealManager: boolean;
}) {
  const managerName = entry.managerDisplayName || franchise?.managerDisplayName || null;
  const avatarId = entry.avatarId || franchise?.avatarId || null;
  const accent = franchise?.accent || '#71808a';
  const monogram = franchise?.monogram || initials(entry.franchiseName, entry.rosterId);

  return (
    <>
      {revealManager && avatarId && managerName ? (
        <img
          className="draft-pick-avatar"
          src={sleeperAvatarUrl(avatarId)}
          alt={`${managerName} Sleeper avatar`}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span
          className="draft-pick-monogram"
          aria-hidden="true"
          style={{ '--draft-accent': accent } as CSSProperties}
        >
          {monogram}
        </span>
      )}
      <span className="draft-pick-name">
        <strong>{entry.franchiseName || `Roster ${entry.rosterId}`}</strong>
        {revealManager && managerName && <small>{managerName}</small>}
      </span>
    </>
  );
}

function DraftSource({ source }: { source: SourceStamp }) {
  return (
    <p className="draft-source" data-state={source.state}>
      <span className="draft-source-dot" aria-hidden="true" />
      {sourceLabel(source)} ·{' '}
      <time dateTime={source.fetchedAt}>{centralDateTime.format(new Date(source.fetchedAt))}</time>
    </p>
  );
}

export function DraftPage({ snapshot, session }: DraftPageProps) {
  const { draft } = snapshot;
  const order = [...draft.order].sort((left, right) => left.slot - right.slot);
  const viewerFranchise = session.kind === 'member'
    ? snapshot.franchises.find((franchise) => franchise.ownerUserId === session.userId)
    : undefined;
  const viewerEntry = viewerFranchise
    ? order.find((entry) => entry.rosterId === viewerFranchise.rosterId)
    : undefined;
  const viewerSlot = viewerEntry?.slot;
  const totalPicks = draft.rounds * draft.teams;
  const hasCompleteOrder = order.length === draft.teams;
  const sleeperLeagueUrl = `https://sleeper.com/leagues/${snapshot.leagueId}`;

  return (
    <div className="draft-page">
      <header className="draft-page-hero">
        <div className="draft-page-hero-copy">
          <p className="draft-page-eyebrow">
            <CheckCircle2 size={16} aria-hidden="true" />
            {snapshot.leagueName} · Order locked
          </p>
          <h1>
            <span>{draft.season}</span>
            Draft board
          </h1>
          <p className="draft-page-deck">
            Eight rounds. One fixed lane. Ninety-six decisions before the season gets loud.
          </p>
        </div>
        <div className="draft-page-hero-number" aria-hidden="true">{draft.rounds}</div>
        <DraftSource source={draft.source} />
      </header>

      <section className="draft-context" aria-label={`${draft.season} draft context`}>
        <div className="draft-start">
          <span className="draft-context-icon" aria-hidden="true"><CalendarDays size={22} /></span>
          <div>
            <span className="draft-micro-label">Draft night · Central time</span>
            <time dateTime={draft.startsAt}>{centralDraftTime.format(new Date(draft.startsAt))}</time>
          </div>
        </div>
        <dl className="draft-facts">
          <div><dt>Format</dt><dd>{titleCase(draft.type)}</dd></div>
          <div><dt>Rounds</dt><dd>{draft.rounds} rounds</dd></div>
          <div><dt>Field</dt><dd>{draft.teams} clubs</dd></div>
          <div><dt>Board</dt><dd>{totalPicks} picks</dd></div>
        </dl>
      </section>

      <div className="draft-page-body">
        <div className="draft-page-callouts">
          {viewerFranchise && viewerSlot ? (
            <section className="draft-viewer-lane" role="region" aria-label="Your draft lane">
              <div className="draft-section-kicker">
                <span>Your draft lane</span>
                <strong>{viewerFranchise.franchiseName}</strong>
              </div>
              <div className="draft-viewer-lead">
                <span>Opening draft slot</span>
                <strong>{String(viewerSlot).padStart(2, '0')}</strong>
              </div>
              <ol aria-label="Your picks by round">
                {Array.from({ length: draft.rounds }, (_, index) => {
                  const round = index + 1;
                  return (
                    <li key={round}>
                      <span>R{round}</span>
                      <strong>{pickLabel(round, viewerSlot)}</strong>
                    </li>
                  );
                })}
              </ol>
              <p>Linear draft: your slot stays fixed in every round.</p>
            </section>
          ) : session.kind === 'public' ? (
            <section className="draft-public-card" role="region" aria-label="Member draft view">
              <LockKeyhole size={22} aria-hidden="true" />
              <div>
                <span className="draft-micro-label">Member view</span>
                <h2>Your lane stays private</h2>
                <p>Sign in to see your eight-pick lane and manager identities.</p>
              </div>
            </section>
          ) : (
            <section className="draft-public-card" role="region" aria-label="Member draft view">
              <LockKeyhole size={22} aria-hidden="true" />
              <div>
                <span className="draft-micro-label">Member view</span>
                <h2>Draft lane pending</h2>
                <p>Your signed-in Sleeper identity is not matched to a Round 1 roster yet.</p>
              </div>
            </section>
          )}

          <aside className="draft-execution-card" aria-labelledby="draft-execution-title">
            <span className="draft-context-icon" aria-hidden="true"><Clock3 size={22} /></span>
            <div>
              <span className="draft-micro-label">Execution surface</span>
              <h2 id="draft-execution-title">Picks happen in Sleeper</h2>
              <p>
                This board is a read-only league companion. Submit, queue, trade, and finalize every
                selection in Sleeper.
              </p>
              <a href={sleeperLeagueUrl} target="_blank" rel="noreferrer">
                Open Sleeper league <ExternalLink size={15} aria-hidden="true" />
              </a>
            </div>
          </aside>
        </div>

        <section className="draft-round" role="region" aria-label="Round 1 draft order">
          <div className="draft-round-heading">
            <div>
              <span className="draft-micro-label">On the board</span>
              <h2>Round 1 order</h2>
            </div>
            <p>
              <span>First overall</span>
              <strong>{order[0]?.franchiseName || 'Pending from Sleeper'}</strong>
            </p>
          </div>

          {!hasCompleteOrder && (
            <p className="draft-order-notice" role="status">
              Sleeper returned {order.length} of {draft.teams} Round 1 slots. Showing the verified
              portion of the order.
            </p>
          )}

          <ol className="draft-order-list">
            {order.map((entry) => {
              const franchise = snapshot.franchises.find(
                (candidate) => candidate.rosterId === entry.rosterId,
              );
              const isViewer = Boolean(viewerFranchise && viewerFranchise.rosterId === entry.rosterId);

              return (
                <li className={isViewer ? 'is-viewer' : undefined} key={`${entry.slot}-${entry.rosterId}`}>
                  <span className="draft-pick-number">{pickLabel(1, entry.slot)}</span>
                  <DraftIdentity
                    entry={entry}
                    franchise={franchise}
                    revealManager={session.kind === 'member'}
                  />
                  {isViewer && <span className="draft-you-label">Your pick</span>}
                  <ArrowUpRight className="draft-pick-arrow" size={16} aria-hidden="true" />
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
