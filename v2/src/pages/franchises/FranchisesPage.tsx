import { useState, type CSSProperties } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  History,
  LockKeyhole,
  Shield,
  Trophy,
  Users,
} from 'lucide-react';

import type { ViewerSession } from '../../App';
import type { ContractPlayer } from '../../data/contractLedger';
import {
  sleeperAvatarUrl,
  type FranchiseSnapshot,
  type HomeSnapshot,
} from '../../data/currentLeague';
import {
  buildFranchiseDossier,
  type FranchiseDossier,
  type PositionRoomKey,
} from '../../domain/franchiseDossier';
import type { DraftPickOwnership } from '../../domain/picks';
import type { LeagueTransaction } from '../../domain/transactions';
import './FranchisesPage.css';

export interface FranchisesPageProps {
  snapshot: HomeSnapshot;
  session: ViewerSession;
  contracts?: ContractPlayer[];
  transactions?: LeagueTransaction[];
  tradedPicks?: DraftPickOwnership[];
}

const positionRoomLabels: Record<PositionRoomKey, string> = {
  QB: 'Quarterbacks',
  RB: 'Running backs',
  WR: 'Wide receivers',
  TE: 'Tight ends',
  DEF: 'Defenses',
  OTHER: 'Other roster spots',
  UNMATCHED: 'Contract records to match',
};

function FranchiseEmblem({
  franchise,
  showPortrait,
}: {
  franchise: FranchiseSnapshot;
  showPortrait: boolean;
}) {
  if (showPortrait && franchise.avatarId) {
    return (
      <img
        src={sleeperAvatarUrl(franchise.avatarId)}
        alt={`${franchise.managerDisplayName} portrait`}
      />
    );
  }

  return (
    <span
      className="franchise-card-emblem"
      aria-label={`${franchise.franchiseName} emblem`}
      style={{ '--club-accent': franchise.accent } as CSSProperties}
    >
      {franchise.monogram}
    </span>
  );
}

function FranchiseDirectory({
  snapshot,
  session,
  selectedRosterId,
  onSelect,
}: {
  snapshot: HomeSnapshot;
  session: ViewerSession;
  selectedRosterId: number | null;
  onSelect: (rosterId: number) => void;
}) {
  const memberView = session.kind === 'member';

  return (
    <ol className="franchise-directory" aria-label="League franchises">
      {snapshot.franchises.map((franchise) => {
        const ownFranchise = memberView && franchise.ownerUserId === session.userId;
        const selected = selectedRosterId === franchise.rosterId;
        const pick = snapshot.draft.order.find(
          (entry) => entry.rosterId === franchise.rosterId,
        )?.slot;

        return (
          <li key={franchise.rosterId}>
            <article
              className={`franchise-card${ownFranchise ? ' is-viewer' : ''}${selected ? ' is-selected' : ''}`}
              aria-label={`${franchise.franchiseName} franchise`}
              style={{ '--club-accent': franchise.accent } as CSSProperties}
            >
              <div className="franchise-card-topline">
                <span>Club {String(franchise.rosterId).padStart(2, '0')}</span>
                {ownFranchise && <em>Your franchise</em>}
              </div>
              <div className="franchise-card-identity">
                <FranchiseEmblem franchise={franchise} showPortrait={memberView} />
                <div>
                  <h2>{franchise.franchiseName}</h2>
                  {memberView && (
                    <>
                      <span>Manager</span>
                      <strong>{franchise.managerDisplayName}</strong>
                    </>
                  )}
                </div>
              </div>
              <dl>
                <div><dt>Roster</dt><dd>{franchise.playerCount} players</dd></div>
                <div>
                  <dt>Opening pick</dt>
                  <dd>{pick ? `1.${String(pick).padStart(2, '0')}` : 'Pending'}</dd>
                </div>
              </dl>
              {memberView && (
                <button
                  type="button"
                  aria-label={`Select ${franchise.franchiseName}`}
                  aria-pressed={selected}
                  onClick={() => onSelect(franchise.rosterId)}
                >
                  {selected ? 'Dossier open' : 'Open dossier'}
                </button>
              )}
            </article>
          </li>
        );
      })}
    </ol>
  );
}

function franchiseNameByRoster(snapshot: HomeSnapshot, rosterId: number) {
  return snapshot.franchises.find((franchise) => franchise.rosterId === rosterId)?.franchiseName
    ?? `Roster ${rosterId}`;
}

function DossierMasthead({ dossier }: { dossier: FranchiseDossier }) {
  const titleCount = dossier.finishes.filter((finish) => finish.result === 'Champion').length;

  return (
    <section
      className="franchise-dossier-hero"
      aria-label="Franchise identity"
      style={{ '--club-accent': dossier.franchise.accent } as CSSProperties}
    >
      <div className="franchise-dossier-portrait">
        <FranchiseEmblem franchise={dossier.franchise} showPortrait />
      </div>
      <div className="franchise-dossier-title">
        <span>Club {String(dossier.franchise.rosterId).padStart(2, '0')} · Member dossier</span>
        <h1>{dossier.franchise.franchiseName} franchise dossier</h1>
        <p>Managed by {dossier.franchise.managerDisplayName}</p>
      </div>
      <dl>
        <div><dt>Opening pick</dt><dd>{dossier.openingPick ? `1.${String(dossier.openingPick).padStart(2, '0')}` : 'Pending'}</dd></div>
        <div><dt>Roster</dt><dd>{dossier.franchise.playerCount}</dd></div>
        <div><dt>Verified titles</dt><dd>{titleCount}</dd></div>
      </dl>
    </section>
  );
}

function ContractPressure({ dossier }: { dossier: FranchiseDossier }) {
  return (
    <section className="franchise-pressure" aria-labelledby="contract-pressure-heading">
      <div className="franchise-section-heading">
        <div>
          <span><Clock3 size={15} /> Contract runway</span>
          <h2 id="contract-pressure-heading">Contract pressure report</h2>
        </div>
        <small>Evidence, not a roster grade</small>
      </div>
      <dl>
        <div data-state="urgent"><dt>1-year decisions</dt><dd>{dossier.runway.oneYear}</dd></div>
        <div><dt>Two-year watch</dt><dd>{dossier.runway.twoYear}</dd></div>
        <div><dt>Long control</dt><dd>{dossier.runway.longControl}</dd></div>
        <div data-state="unknown"><dt>Unmatched</dt><dd>{dossier.runway.unknown}</dd></div>
      </dl>
      <p>
        One-year players are ordinary-extension decisions. An exemption may renegotiate any
        contract regardless of years remaining.
      </p>
    </section>
  );
}

function PositionRooms({ dossier }: { dossier: FranchiseDossier }) {
  const rooms = (Object.entries(dossier.positionRooms) as Array<
    [PositionRoomKey, FranchiseDossier['positionRooms'][PositionRoomKey]]
  >).filter(([, players]) => players.length > 0);

  return (
    <section className="franchise-position-rooms" aria-labelledby="position-rooms-heading">
      <div className="franchise-section-heading">
        <div>
          <span><Users size={15} /> Sleeper ownership × contract ledger</span>
          <h2 id="position-rooms-heading">Roster position rooms</h2>
        </div>
        <small>{dossier.franchise.playerIds.length} Sleeper roster IDs</small>
      </div>
      {rooms.length ? (
        <div className="position-room-grid">
          {rooms.map(([room, players]) => (
            <article className="position-room" key={room}>
              <header><h3>{positionRoomLabels[room]}</h3><span>{players.length}</span></header>
              <div role="table" aria-label={`${positionRoomLabels[room]} contracts`}>
                {players.map((player) => (
                  <div
                    className={`position-room-player${room === 'UNMATCHED' ? ' is-unmatched' : ''}`}
                    role="row"
                    key={player.sleeperPlayerId}
                  >
                    <span className="contract-position" role="cell">{player.position}</span>
                    <div role="cell">
                      <strong>{player.playerName}</strong>
                      <small>
                        {room === 'UNMATCHED'
                          ? `Sleeper ID ${player.sleeperPlayerId}`
                          : `${player.nflTeam} · ${player.authority === 'manager-correction' ? 'Corrected' : 'Sheet'}`}
                      </small>
                    </div>
                    <span role="cell">{player.tag ? 'Franchise' : '—'}</span>
                    <span role="cell">{player.exemption ? `Exm ${player.exemption}` : '—'}</span>
                    <strong
                      className="contract-years"
                      data-state={player.yearsRemaining === 1 ? 'expiring' : player.yearsRemaining ? 'active' : 'unknown'}
                      role="cell"
                    >
                      {player.yearsRemaining ? `${player.yearsRemaining}Y` : '—'}
                    </strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="franchise-roster-empty">
          Current Sleeper ownership has not loaded for this franchise. Contract ownership is not
          inferred from the Sheet&apos;s stale fantasy-team column.
        </p>
      )}
    </section>
  );
}

function DraftCapital({ dossier, snapshot }: { dossier: FranchiseDossier; snapshot: HomeSnapshot }) {
  return (
    <section className="franchise-capital" aria-labelledby="draft-capital-heading">
      <div className="franchise-section-heading">
        <div>
          <span><BadgeCheck size={15} /> Original ownership preserved</span>
          <h2 id="draft-capital-heading">Draft capital ledger</h2>
        </div>
      </div>
      <div className="franchise-capital-columns">
        <div>
          <h3><ArrowDownLeft size={16} /> Incoming</h3>
          {dossier.picks.incoming.length ? dossier.picks.incoming.map((pick) => (
            <article key={`in-${pick.season}-${pick.round}-${pick.originalRosterId}`}>
              <strong>{pick.season} Round {pick.round}</strong>
              <span>via {franchiseNameByRoster(snapshot, pick.originalRosterId)}</span>
            </article>
          )) : <p>No transferred picks currently recorded.</p>}
        </div>
        <div>
          <h3><ArrowUpRight size={16} /> Outgoing</h3>
          {dossier.picks.outgoing.length ? dossier.picks.outgoing.map((pick) => (
            <article key={`out-${pick.season}-${pick.round}-${pick.currentOwnerRosterId}`}>
              <strong>{pick.season} Round {pick.round}</strong>
              <span>held by {franchiseNameByRoster(snapshot, pick.currentOwnerRosterId)}</span>
            </article>
          )) : <p>No original picks held elsewhere.</p>}
        </div>
      </div>
    </section>
  );
}

function VerifiedMovement({ dossier }: { dossier: FranchiseDossier }) {
  return (
    <section className="franchise-movement" aria-labelledby="franchise-movement-heading">
      <div className="franchise-section-heading">
        <div>
          <span><History size={15} /> Sleeper completed transactions</span>
          <h2 id="franchise-movement-heading">Verified roster movement</h2>
        </div>
      </div>
      {dossier.movements.length ? (
        <ol>
          {dossier.movements.map((transaction) => (
            <li key={transaction.id}>
              <time dateTime={transaction.createdAt}>
                {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
                  new Date(transaction.createdAt),
                )}
              </time>
              <div>
                <strong>{transaction.id}</strong>
                <span>
                  {transaction.type} · {Object.keys(transaction.adds).length} adds ·{' '}
                  {transaction.draftPicks.length} picks
                </span>
              </div>
            </li>
          ))}
        </ol>
      ) : <p>No completed Sleeper transaction in the loaded record touches this roster.</p>}
    </section>
  );
}

function VerifiedHistory({ dossier }: { dossier: FranchiseDossier }) {
  return (
    <section className="franchise-history" aria-labelledby="franchise-history-heading">
      <div className="franchise-section-heading">
        <div>
          <span><Trophy size={15} /> Sleeper-era finishes</span>
          <h2 id="franchise-history-heading">Verified franchise history</h2>
        </div>
      </div>
      {dossier.finishes.length ? (
        <ol>
          {[...dossier.finishes].sort((left, right) => right.season - left.season).map((finish) => (
            <li key={`${finish.season}-${finish.result}`}>
              <Trophy size={19} aria-hidden="true" />
              <strong>{finish.season} {finish.result}</strong>
            </li>
          ))}
        </ol>
      ) : <p>No championship-game finish appears in the verified 2021–2025 record.</p>}
    </section>
  );
}

export function FranchisesPage({
  snapshot,
  session,
  contracts = [],
  transactions = [],
  tradedPicks = [],
}: FranchisesPageProps) {
  const memberView = session.kind === 'member';
  const viewerFranchise = memberView
    ? snapshot.franchises.find((franchise) => franchise.ownerUserId === session.userId)
    : undefined;
  const [selectedRosterId, setSelectedRosterId] = useState(
    viewerFranchise?.rosterId ?? snapshot.franchises[0]?.rosterId ?? 1,
  );
  const dossier = memberView
    ? buildFranchiseDossier({
        snapshot,
        rosterId: selectedRosterId,
        contracts,
        transactions,
        tradedPicks,
      })
    : null;

  return (
    <div className="franchises-page">
      <header className="franchises-hero">
        <div>
          <span><Users size={17} /> Twelve clubs. One group chat.</span>
          <h1>The Franchises</h1>
          <p>
            {memberView
              ? 'Open any club’s roster, contract runway, pick ledger, movement, and verified history.'
              : 'Club identity stays public. Manager and roster intelligence stays inside the Dozen.'}
          </p>
        </div>
        <div className="franchise-privacy-state">
          {memberView ? <Shield size={22} /> : <LockKeyhole size={22} />}
          <strong>{memberView ? 'Member dossiers' : 'Public directory'}</strong>
          <small>{memberView ? 'Private league intelligence unlocked' : 'Manager details protected'}</small>
        </div>
      </header>

      {dossier && (
        <>
          <FranchiseDirectory
            snapshot={snapshot}
            session={session}
            selectedRosterId={selectedRosterId}
            onSelect={setSelectedRosterId}
          />
          <DossierMasthead dossier={dossier} />
          <ContractPressure dossier={dossier} />
          <PositionRooms dossier={dossier} />
          <div className="franchise-dossier-grid">
            <DraftCapital dossier={dossier} snapshot={snapshot} />
            <VerifiedMovement dossier={dossier} />
          </div>
          <VerifiedHistory dossier={dossier} />
        </>
      )}

      {!memberView && (
        <FranchiseDirectory
          snapshot={snapshot}
          session={session}
          selectedRosterId={null}
          onSelect={() => undefined}
        />
      )}
    </div>
  );
}
