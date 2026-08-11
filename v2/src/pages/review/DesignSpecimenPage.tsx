import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  Award,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GitBranch,
  Radio,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  WifiOff,
  X,
} from 'lucide-react';

import type { ViewerSession } from '../../App';
import type { ContractPlayer } from '../../data/contractLedger';
import {
  type FranchiseSnapshot,
  type HomeSnapshot,
} from '../../data/currentLeague';
import './design-specimen.css';

interface DesignSpecimenPageProps {
  snapshot: HomeSnapshot;
  session: ViewerSession;
  contracts: readonly ContractPlayer[];
}

const playerImageUrl = (playerId: string, full = false) =>
  `https://sleepercdn.com/content/nfl/players/${full ? '' : 'thumb/'}${playerId}.jpg`;

const managerPortraitUrl = (avatarId: string) =>
  `https://sleepercdn.com/avatars/${avatarId}`;

function playerInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function PlayerPortrait({
  player,
  size = 'row',
}: {
  player: ContractPlayer;
  size?: 'hero' | 'slot' | 'row';
}) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="spec-player-portrait" data-size={size} data-position={player.position}>
      {!failed ? (
        <img
          src={playerImageUrl(player.sleeperPlayerId, size === 'hero')}
          alt={`${player.playerName} headshot`}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="spec-player-fallback" role="img" aria-label={`${player.playerName} missing portrait`}>
          <b>{playerInitials(player.playerName)}</b>
          <small>{player.position}</small>
        </span>
      )}
    </span>
  );
}

function FranchiseEmblem({ franchise }: { franchise: FranchiseSnapshot }) {
  return (
    <span
      className="spec-franchise-emblem"
      style={{ '--spec-accent': franchise.accent } as React.CSSProperties}
      aria-label={`${franchise.franchiseName} emblem`}
    >
      <small>HD</small>
      <strong>{franchise.monogram}</strong>
      <em>12</em>
    </span>
  );
}

function ContractClock({ player, compact = false }: { player: ContractPlayer; compact?: boolean }) {
  const years = player.yearsRemaining;
  return (
    <span className="spec-contract-clock" data-urgent={years === 1 || undefined} data-compact={compact || undefined}>
      <strong>{years ?? '—'}</strong>
      <small>{years === 1 ? 'year' : 'years'}</small>
    </span>
  );
}

function PublicReviewGate() {
  return (
    <section className="spec-public-gate" aria-labelledby="review-gate-title">
      <ShieldCheck size={30} />
      <span>Private design review</span>
      <h1 id="review-gate-title">Member review surface</h1>
      <p>The specimen contains manager, roster, and contract examples and is available only inside the league.</p>
      <a href="#/">Return home <ArrowRight size={16} /></a>
    </section>
  );
}

export function DesignSpecimenPage({
  snapshot,
  session,
  contracts,
}: DesignSpecimenPageProps) {
  const [dossierPlayer, setDossierPlayer] = useState<ContractPlayer | null>(null);
  const dossierDialogRef = useRef<HTMLElement | null>(null);
  const dossierCloseRef = useRef<HTMLButtonElement | null>(null);
  const dossierTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!dossierPlayer) {
      dossierTriggerRef.current?.focus();
      return;
    }

    dossierCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setDossierPlayer(null);
        return;
      }

      if (event.key !== 'Tab' || !dossierDialogRef.current) return;
      const focusable = Array.from(
        dossierDialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dossierPlayer]);

  if (session.kind !== 'member') return <PublicReviewGate />;

  const openDossier = (player: ContractPlayer, event: ReactMouseEvent<HTMLButtonElement>) => {
    dossierTriggerRef.current = event.currentTarget;
    setDossierPlayer(player);
  };

  const franchise =
    snapshot.franchises.find((item) => item.ownerUserId === session.userId) ??
    snapshot.franchises[0];
  const franchiseContracts = contracts.filter(
    (player) => player.sheetFantasyTeam.trim().toLowerCase() === franchise.franchiseName.toLowerCase(),
  );
  const primaryPlayer =
    franchiseContracts.find((player) => /patrick mahomes/i.test(player.playerName)) ??
    franchiseContracts[0] ??
    null;
  const receivers = franchiseContracts.filter((player) => player.position.toUpperCase() === 'WR');
  const secondaryPlayer =
    receivers.find((player) => /a\.?j\.? brown/i.test(player.playerName)) ??
    receivers[0] ??
    null;
  const thirdPlayer =
    receivers.find((player) => /matthew golden/i.test(player.playerName)) ??
    receivers.find((player) => player !== secondaryPlayer) ??
    null;
  const exceptionPlayer =
    franchiseContracts.find((player) => player.authority === 'manager-correction') ?? null;
  const exemptionActionPlayer =
    franchiseContracts.find((player) => /kenneth walker/i.test(player.playerName)) ??
    exceptionPlayer ??
    secondaryPlayer;
  const viewerPick = snapshot.draft.order.find((pick) => pick.rosterId === franchise.rosterId);
  const coach = snapshot.franchises.find((item) => item.franchiseName === 'Coach') ?? snapshot.franchises[10];
  const deadline = snapshot.deadlines[0];
  const story = snapshot.wire[0];

  return (
    <div className="design-specimen">
      <section className="specimen-masthead" aria-labelledby="specimen-title">
        <div className="specimen-edition">
          <span>G1 · System specimen</span>
          <span>August 2026</span>
        </div>
        <div className="specimen-title-lockup">
          <div>
            <span className="specimen-kicker"><i /> Contract dynasty, custom made</span>
            <h1 id="specimen-title">The Twelve,<br /><em>in one visual language.</em></h1>
            <p>Players first. Decisions close. League history everywhere it belongs.</p>
          </div>
          <div className="specimen-harambe" aria-hidden="true">
            <span>12</span>
            <img src="/assets/harambe-letterman.png" alt="" />
          </div>
          <aside className="specimen-franchise-lockup" aria-label={`${franchise.franchiseName} franchise lockup`}>
            <div className="specimen-manager-portrait">
              {franchise.avatarId ? (
                <img src={managerPortraitUrl(franchise.avatarId)} alt={`${franchise.managerDisplayName} portrait`} />
              ) : (
                <UserRound aria-label="Manager portrait unavailable" />
              )}
              <span><Award size={13} /> 2024 champ</span>
            </div>
            <div className="specimen-franchise-name">
              <FranchiseEmblem franchise={franchise} />
              <div>
                <small>My franchise</small>
                <strong>{franchise.franchiseName}</strong>
                <span>{franchise.managerDisplayName}</span>
              </div>
            </div>
            <div className="specimen-next-pick">
              <span>On deck</span>
              <strong>1.{String(viewerPick?.slot ?? 0).padStart(2, '0')}</strong>
              <small>Round one · pick {viewerPick?.slot ?? '—'}</small>
            </div>
          </aside>
        </div>
        <div className="specimen-ticker" aria-label="Specimen principles">
          <span>Player-first rosters</span>
          <span>Contract-aware decisions</span>
          <span>The real trophy</span>
          <span>Built for these 12 guys</span>
        </div>
      </section>

      <section
        className="specimen-section specimen-roster-language"
        role="region"
        aria-labelledby="roster-language-title"
      >
        <header className="specimen-section-heading">
          <span>01 · Franchise language</span>
          <h2 id="roster-language-title">Franchise identity and player dossier</h2>
          <p>One projected lineup slot, one compact row, one deeper layer—without turning the roster into a spreadsheet.</p>
        </header>

        {primaryPlayer ? (
          <div className="specimen-player-stage">
            <div className="specimen-feature-player">
              <div className="specimen-feature-photo">
                <span className="specimen-position-mark">QB<span>15</span></span>
                <PlayerPortrait player={primaryPlayer} size="hero" />
              </div>
              <div className="specimen-feature-copy">
                <div className="specimen-player-id">
                  <span>{primaryPlayer.nflTeam} · {primaryPlayer.position}</span>
                  <h3>{primaryPlayer.playerName}</h3>
                  <small>Projected starter · Week 1</small>
                </div>
                <div className="specimen-contract-band">
                  <ContractClock player={primaryPlayer} />
                  <div>
                    <span>Contract through</span>
                    <strong>{primaryPlayer.yearsRemaining ? 2026 + primaryPlayer.yearsRemaining - 1 : 'Unresolved'}</strong>
                  </div>
                  <div>
                    <span>Acquired</span>
                    <strong>Startup draft</strong>
                  </div>
                  <span className="specimen-tag">Core QB</span>
                </div>
                <button
                  className="specimen-lineup-slot"
                  type="button"
                  onClick={(event) => openDossier(primaryPlayer, event)}
                  aria-label={`Open ${primaryPlayer.playerName} quick dossier`}
                >
                  <span className="specimen-slot-label">QB</span>
                  <PlayerPortrait player={primaryPlayer} size="slot" />
                  <span>
                    <strong>{primaryPlayer.playerName}</strong>
                    <small>{primaryPlayer.nflTeam} · vs LV · 12:00</small>
                  </span>
                  <ContractClock player={primaryPlayer} compact />
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <aside className="specimen-roster-stack" aria-label="Compact roster and contract notation">
              <div className="specimen-stack-heading">
                <span>Receiver room</span>
                <strong>3 starters</strong>
              </div>
              {[secondaryPlayer, thirdPlayer].filter((player): player is ContractPlayer => Boolean(player)).map((player) => (
                <button type="button" className="specimen-roster-row" key={player.sleeperPlayerId} onClick={(event) => openDossier(player, event)}>
                  <PlayerPortrait player={player} size="row" />
                  <span>
                    <strong>{player.playerName}</strong>
                    <small>{player.position} · {player.nflTeam}</small>
                  </span>
                  {player.tag && <em>Tag</em>}
                  {player.exemption && <em>Exm {player.exemption}</em>}
                  <ContractClock player={player} compact />
                </button>
              ))}
              {exceptionPlayer && (
                <div className="specimen-authority-exception" role="note">
                  <AlertTriangle size={17} />
                  <div>
                    <strong>Manager correction overrides Sheet</strong>
                    <span>
                      {exceptionPlayer.playerName} · {exceptionPlayer.exemption
                        ? 'exemption declaration controls the displayed term.'
                        : 'direct manager correction controls the displayed term.'}
                    </span>
                  </div>
                </div>
              )}
              <div className="specimen-dossier-peek">
                <div>
                  <span>Player dossier</span>
                  <strong>Ownership trail</strong>
                </div>
                <div className="specimen-mini-timeline" aria-label="Player ownership trail preview">
                  <span>Startup</span><i /><span>A.Woods</span><i /><span>2026</span>
                </div>
                <a href={primaryPlayer ? `#/players/${primaryPlayer.sleeperPlayerId}` : '#/franchises'}>
                  Full history <ArrowRight size={14} />
                </a>
              </div>
            </aside>
          </div>
        ) : (
          <div className="specimen-contract-loading" role="status">
            <span className="specimen-loader" />
            <div><strong>Joining the private contract ledger</strong><span>Player primitives appear when member data is ready.</span></div>
          </div>
        )}
      </section>

      <section
        className="specimen-section specimen-market-language"
        role="region"
        aria-labelledby="market-language-title"
      >
        <header className="specimen-section-heading specimen-heading-dark">
          <span>02 · Decision surfaces</span>
          <h2 id="market-language-title">Draft and trade system</h2>
          <p>The board is spatial. Trade assets live in team lanes. Pick lineage never becomes a footnote.</p>
        </header>

        <div className="specimen-market-grid">
          <article className="specimen-draft-board" aria-label="Draft cell and available player specimens">
            <div className="specimen-subhead">
              <div><span>2026 Draft</span><strong>Round 1 · live board language</strong></div>
              <em>Pre-draft</em>
            </div>
            <div className="specimen-pick-cells">
              <div className="specimen-pick-cell is-mine">
                <span>1.03</span>
                <FranchiseEmblem franchise={franchise} />
                <strong>{franchise.franchiseName}</strong>
                <small>Original owner</small>
              </div>
              <div className="specimen-pick-cell">
                <span>1.09</span>
                <FranchiseEmblem franchise={coach} />
                <strong>{coach.franchiseName}</strong>
                <small>Original owner</small>
              </div>
              <div className="specimen-pick-card">
                <span>My next turn</span>
                <strong>2.03</strong>
                <small>12 selections after 1.03</small>
              </div>
            </div>
            <div className="specimen-available-list" role="table" aria-label="Available player rows">
              <div role="row" className="specimen-player-pool-heading">
                <span role="columnheader">Available pool</span><span role="columnheader">Pos</span><span role="columnheader">Market</span>
              </div>
              {[
                ['Jadarian Price', 'RB', '58'],
                ['Carnell Tate', 'WR', '26'],
                ['Jordyn Tyson', 'WR', '42'],
              ].map(([name, position, market], index) => (
                <div role="row" className="specimen-available-row" key={name}>
                  <span role="cell"><b>{index + 1}</b><strong>{name}</strong><small>Rookie · 21</small></span>
                  <span role="cell">{position}</span>
                  <span role="cell">#{market} <small>secondary</small></span>
                </div>
              ))}
            </div>
          </article>

          <article className="specimen-trade-builder" aria-label="Trade team lanes, routing, and asset tree specimens">
            <div className="specimen-subhead">
              <div><span>Private proposal</span><strong>Two-team lane · not sent</strong></div>
              <em>Draft</em>
            </div>
            <div className="specimen-trade-lanes">
              <div className="specimen-team-lane">
                <header><FranchiseEmblem franchise={franchise} /><span><strong>{franchise.franchiseName}</strong><small>Sends</small></span></header>
                <div className="specimen-trade-asset"><span>QB</span><strong>Patrick Mahomes</strong><small>4 years</small></div>
                <div className="specimen-trade-asset"><span>WR</span><strong>Matthew Golden</strong><small>Contract on file</small></div>
                <div className="specimen-trade-asset specimen-pick-asset"><span>1</span><strong>2026 1.03</strong><small>Original: A.Woods</small></div>
              </div>
              <div className="specimen-routing-line" aria-label="Assets route between teams">
                <ArrowRight /><ArrowLeftRight /><ArrowRight />
              </div>
              <div className="specimen-team-lane">
                <header><FranchiseEmblem franchise={coach} /><span><strong>{coach.franchiseName}</strong><small>Sends</small></span></header>
                <div className="specimen-trade-asset"><span>WR</span><strong>CeeDee Lamb</strong><small>Contract on file</small></div>
                <div className="specimen-trade-asset"><span>RB</span><strong>Bucky Irving</strong><small>2 years</small></div>
              </div>
            </div>
            <div className="specimen-asset-tree">
              <GitBranch size={17} />
              <div><span>Pick lineage</span><strong>2026 1.03</strong></div>
              <span>A.Woods</span><ArrowRight size={14} /><span>Proposal lane</span>
            </div>
          </article>
        </div>
      </section>

      <section
        className="specimen-section specimen-broadcast-language"
        role="region"
        aria-labelledby="broadcast-language-title"
      >
        <header className="specimen-section-heading">
          <span>03 · League pulse</span>
          <h2 id="broadcast-language-title">Game day and league editorial</h2>
          <p>Broadcast shorthand for the live league, publication craft for everything worth remembering.</p>
        </header>
        <div className="specimen-broadcast-grid">
          <article className="specimen-scoreboard" aria-label="Matchup scorebug and standings row">
            <div className="specimen-scorebug-top"><Radio size={15} /><span>Sunday · pregame</span><em>Week 1</em></div>
            <div className="specimen-scorebug-team">
              <FranchiseEmblem franchise={franchise} /><span><strong>{franchise.franchiseName}</strong><small>0–0</small></span><b>—</b>
            </div>
            <div className="specimen-scorebug-team">
              <FranchiseEmblem franchise={coach} /><span><strong>{coach.franchiseName}</strong><small>0–0</small></span><b>—</b>
            </div>
            <div className="specimen-scorebug-note"><Clock3 size={14} /> First window · Sun 12:00 CT</div>
            <div className="specimen-standings-row">
              <span>1</span><FranchiseEmblem franchise={franchise} /><strong>{franchise.franchiseName}</strong><small>0–0</small><em>PF —</em>
            </div>
          </article>

          <article className="specimen-wire" aria-label="League Wire story specimen">
            <div className="specimen-wire-image"><img src="/assets/league-wire-draft.webp" alt="Draft-night editorial artwork" /><span>12</span></div>
            <div className="specimen-wire-copy">
              <span><Sparkles size={14} /> {story.kicker}</span>
              <h3>{story.headline}</h3>
              <p>{story.summary}</p>
              <a href="#/draft">Open board <ArrowRight size={14} /></a>
            </div>
          </article>

          <article className="specimen-calendar" aria-label="Calendar deadline specimen">
            <div className="specimen-calendar-icon"><CalendarDays size={19} /><span>League calendar</span></div>
            <time>
              <small>{deadline.month}</small>
              <strong>{deadline.day}</strong>
            </time>
            <div><span>Next deadline</span><strong>{deadline.name}</strong><small>{deadline.detail}</small></div>
            <em>{deadline.flag}</em>
          </article>

          <article className="specimen-trophy" aria-label="Trophy, banner, award, and manager badge specimens">
            <img src="/assets/real-trophy-studio-v1.png" alt="Harambe's Dozen championship trophy" />
            <div className="specimen-champion-banner"><Trophy size={18} /><span>2024 champion</span><strong>A.Woods</strong></div>
            <div className="specimen-award-row"><Award size={18} /><span><strong>League honor</strong><small>Banner raised · Records Vault</small></span></div>
          </article>
        </div>
      </section>

      <section
        className="specimen-section specimen-state-language"
        role="region"
        aria-labelledby="state-language-title"
      >
        <header className="specimen-section-heading specimen-heading-dark">
          <span>04 · Trust and workflow</span>
          <h2 id="state-language-title">State and workflow language</h2>
          <p>Normal data stays quiet. Exceptions explain themselves. Official actions feel like league paperwork, not app settings.</p>
        </header>
        <div className="specimen-workflow-grid">
          <form className="specimen-office-form" onSubmit={(event) => event.preventDefault()}>
            <div className="specimen-form-heading"><FileCheck2 size={20} /><span><strong>Exemption declaration</strong><small>League Office · official action</small></span><em>Draft</em></div>
            <label>Player<select defaultValue={exemptionActionPlayer?.playerName ?? ''}><option>{exemptionActionPlayer?.playerName ?? 'Select player'}</option></select></label>
            <label>Renegotiated term<div className="specimen-years-input"><button type="button">−</button><input aria-label="Renegotiated contract years" defaultValue="5" /><button type="button">+</button><span>years</span></div></label>
            <div className="specimen-rule-note"><ShieldCheck size={16} /><span>An exemption may renegotiate any contract, regardless of years remaining.</span></div>
            <button type="submit" className="specimen-review-action">Review declaration <ArrowRight size={16} /></button>
          </form>

          <div className="specimen-state-board" aria-label="Approval and system state specimens">
            <div className="specimen-state approval"><Clock3 /><span><strong>Pending approval</strong><small>Commissioner docket · #004</small></span><button type="button">Review</button></div>
            <div className="specimen-state conflict"><AlertTriangle /><span><strong>Contract conflict</strong><small>Manager correction overrides Sheet</small></span><em>Admin</em></div>
            <div className="specimen-state stale"><Radio /><span><strong>Scores still available</strong><small>Cached · 18 minutes old</small></span><button type="button">Details</button></div>
            <div className="specimen-state empty"><ArrowDown /><span><strong>Quiet market</strong><small>No active blocks · open an infamous trade</small></span><a href="#/trades">Case files</a></div>
            <div className="specimen-state loading"><span className="specimen-loader" /><span><strong>Joining league data</strong><small>Roster and contract records</small></span></div>
            <div className="specimen-state error"><WifiOff /><span><strong>Sleeper unavailable</strong><small>Last verified snapshot remains visible</small></span><button type="button">Retry</button></div>
            <div className="specimen-state success"><CheckCircle2 /><span><strong>Saved to review queue</strong><small>No roster move has been made</small></span><Check /></div>
          </div>
        </div>
      </section>

      <div className="specimen-footer-note">
        <span>HD12 · G1</span>
        <strong>One system before eight routes.</strong>
        <small>Review surface · not production navigation</small>
      </div>

      {dossierPlayer && (
        <div className="specimen-dialog-backdrop" role="presentation" onMouseDown={() => setDossierPlayer(null)}>
          <section
            ref={dossierDialogRef}
            className="specimen-dossier-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="specimen-dossier-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button ref={dossierCloseRef} type="button" onClick={() => setDossierPlayer(null)} aria-label="Close player dossier"><X /></button>
            <PlayerPortrait player={dossierPlayer} size="hero" />
            <div className="specimen-dialog-copy">
              <span>{dossierPlayer.position} · {dossierPlayer.nflTeam}</span>
              <h2 id="specimen-dossier-title">{dossierPlayer.playerName} dossier</h2>
              <div className="specimen-dialog-contract"><ContractClock player={dossierPlayer} /><span><small>Acquired via startup draft</small><strong>{franchise.franchiseName}</strong></span></div>
              <div className="specimen-dialog-timeline"><i /><span>Startup</span><i /><span>Current roster</span><i /><span>Contract clock</span></div>
              <a href={`#/players/${dossierPlayer.sleeperPlayerId}`}>Full dossier <ArrowRight size={16} /></a>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
