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

function ordinal(value: number) {
  const remainder = value % 100;
  if (remainder >= 11 && remainder <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
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
  const authority = sourceAuthority(source);

  if (source.state === 'live') return `${authority} live`;
  if (source.state === 'cached') return `Cached ${authority} snapshot`;
  return `${authority} manual record`;
}

function sourceAuthority(source: SourceStamp) {
  return source.authority === 'sleeper'
    ? 'Sleeper'
    : source.authority.replace('-', ' ');
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
  const openingPick = viewerSlot ? pickLabel(1, viewerSlot) : null;
  const nextPick = viewerSlot && draft.rounds > 1 ? pickLabel(2, viewerSlot) : null;
  const selectionsBeforeOpening = viewerSlot ? viewerSlot - 1 : null;
  const selectionsBeforeNextPick = viewerSlot ? draft.teams - 1 : null;
  const nextOverall = viewerSlot ? draft.teams + viewerSlot : null;
  const orderAuthority = sourceAuthority(draft.source);
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
            {draft.rounds} rounds. One fixed lane. {totalPicks} decisions before the season gets loud.
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
        {viewerFranchise
          && viewerSlot
          && openingPick
          && nextPick
          && selectionsBeforeOpening !== null
          && selectionsBeforeNextPick !== null
          && nextOverall !== null ? (
          <section
            className="draft-strategy"
            role="region"
            aria-label={`${openingPick} decision window`}
          >
            <header className="draft-strategy-heading">
              <div>
                <span className="draft-micro-label">Your board position</span>
                <h2>The turn at {openingPick}</h2>
              </div>
              <p>
                You see {selectionsBeforeOpening} selections. Then the room gets{' '}
                {selectionsBeforeNextPick} chances to reshape the board before you return.
              </p>
            </header>

            <div className="draft-strategy-grid">
              <div className="draft-decision-mark">
                <span>Your opening decision</span>
                <strong>{openingPick}</strong>
                <small>{viewerFranchise.franchiseName}</small>
              </div>

              <div className="draft-decision-math">
                <dl>
                  <div>
                    <dt>Board visibility</dt>
                    <dd>{selectionsBeforeOpening} selections before {openingPick}</dd>
                  </div>
                  <div>
                    <dt>Your return</dt>
                    <dd>{nextPick} · {ordinal(nextOverall)} overall</dd>
                  </div>
                  <div>
                    <dt>Exposure</dt>
                    <dd>{selectionsBeforeNextPick} selections before {nextPick}</dd>
                  </div>
                </dl>

                <section
                  className="draft-tier-runway"
                  role="region"
                  aria-label="Tier drop-off runway"
                >
                  <div className="draft-tier-runway-heading">
                    <div>
                      <span className="draft-micro-label">Tier drop-off runway</span>
                      <h3>{openingPick} → {nextPick}</h3>
                    </div>
                    <span>{selectionsBeforeNextPick} picks at risk</span>
                  </div>
                  <div className="draft-runway-track" aria-hidden="true">
                    <span className="is-now">{openingPick}</span>
                    <span className="is-exposure" />
                    <span className="is-return">{nextPick}</span>
                  </div>
                  <p>
                    <strong>
                      A tier with {selectionsBeforeNextPick} or fewer acceptable names can be
                      exhausted before {nextPick}.
                    </strong>{' '}
                    No player tiers are published in this snapshot; test that threshold against
                    your own Sleeper queue.
                  </p>
                </section>
              </div>
            </div>

            <section className="draft-viewer-lane" role="region" aria-label="Your draft lane">
              <div className="draft-section-kicker">
                <span>Fixed linear lane</span>
                <strong>{viewerFranchise.franchiseName}</strong>
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
              <p>Same slot every round · no snake reversal</p>
            </section>
          </section>
        ) : session.kind === 'public' ? (
          <section className="draft-public-brief" role="region" aria-label="Member draft view">
            <LockKeyhole size={24} aria-hidden="true" />
            <div>
              <span className="draft-micro-label">Member strategy layer</span>
              <h2>Your decision geometry stays private</h2>
              <p>
                Sign in to map the wait between your picks, see manager identities, and isolate your
                fixed lane.
              </p>
            </div>
          </section>
        ) : (
          <section className="draft-public-brief" role="region" aria-label="Member draft view">
            <LockKeyhole size={24} aria-hidden="true" />
            <div>
              <span className="draft-micro-label">Member strategy layer</span>
              <h2>Draft lane pending</h2>
              <p>Your signed-in Sleeper identity is not matched to a Round 1 roster yet.</p>
            </div>
          </section>
        )}

        <section className="draft-inputs" role="region" aria-label="Draft decision inputs">
          <header>
            <span className="draft-micro-label">Known inputs / honest gaps</span>
            <h2>What this board can—and cannot—tell you</h2>
          </header>
          <div className="draft-inputs-grid">
            <article>
              <span>01</span>
              <div>
                <h3>Tier / drop-off</h3>
                <strong>Not in snapshot</strong>
                <p>No player rankings or candidate tiers are published here. Bring your own board.</p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Best fit</h3>
                <strong>Inventory boundary</strong>
                <p>Position-level rosters are not published here, so positional needs remain unmodeled.</p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Availability</h3>
                <strong>Live in Sleeper</strong>
                <p>Confirm the live player pool in Sleeper before every selection.</p>
              </div>
            </article>
          </div>
          <aside className="draft-execution-note" aria-labelledby="draft-execution-title">
            <Clock3 size={18} aria-hidden="true" />
            <p>
              <strong id="draft-execution-title">Read-only companion.</strong>{' '}
              Submit, queue, trade, and finalize every pick in Sleeper.
            </p>
            <a href={sleeperLeagueUrl} target="_blank" rel="noreferrer">
              Open Sleeper league <ExternalLink size={15} aria-hidden="true" />
            </a>
          </aside>
        </section>

        <section className="draft-round" role="region" aria-label="Round 1 draft order">
          <div className="draft-round-heading">
            <div>
              <span className="draft-micro-label">Verified order · roster lens</span>
              <h2>Round 1 intelligence</h2>
            </div>
            <p>
              <span>Pick provenance</span>
              <strong>{orderAuthority} · {titleCase(draft.source.state)} snapshot</strong>
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
                  <div className="draft-pick-owner">
                    <span className="draft-pick-number">{pickLabel(1, entry.slot)}</span>
                    <div className="draft-pick-identity">
                      <DraftIdentity
                        entry={entry}
                        franchise={franchise}
                        revealManager={session.kind === 'member'}
                      />
                    </div>
                    {isViewer && <span className="draft-you-label">Your decision</span>}
                  </div>
                  <div className="draft-roster-lens">
                    <p>
                      <span>Roster lens</span>
                      <strong>
                        {franchise ? `${franchise.playerCount} players` : 'Count not published'}
                      </strong>
                    </p>
                    <p>
                      <span>Need signal</span>
                      <strong>Positional needs not published</strong>
                    </p>
                  </div>
                  <div className="draft-pick-source">
                    <span>{orderAuthority} draft order</span>
                    <small>Trade provenance unavailable</small>
                  </div>
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
