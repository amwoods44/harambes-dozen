import { useMemo, useState, type CSSProperties } from 'react';
import { ArrowRight, BadgeCheck, LockKeyhole, Shield, Users } from 'lucide-react';

import type { ViewerSession } from '../../App';
import type { ContractPlayer } from '../../data/contractLedger';
import { sleeperAvatarUrl, type FranchiseSnapshot, type HomeSnapshot } from '../../data/currentLeague';
import './FranchisesPage.css';

export interface FranchisesPageProps {
  snapshot: HomeSnapshot;
  session: ViewerSession;
  contracts?: ContractPlayer[];
}

function FranchiseEmblem({ franchise, showPortrait }: { franchise: FranchiseSnapshot; showPortrait: boolean }) {
  if (showPortrait && franchise.avatarId) {
    return <img src={sleeperAvatarUrl(franchise.avatarId)} alt={`${franchise.managerDisplayName} portrait`} />;
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

export function FranchisesPage({ snapshot, session, contracts = [] }: FranchisesPageProps) {
  const isMember = session.kind === 'member';
  const viewerFranchise = isMember
    ? snapshot.franchises.find((franchise) => franchise.ownerUserId === session.userId)
    : undefined;
  const [selectedRosterId, setSelectedRosterId] = useState(
    viewerFranchise?.rosterId ?? snapshot.franchises[0]?.rosterId ?? 1,
  );
  const selectedFranchise = snapshot.franchises.find(
    (franchise) => franchise.rosterId === selectedRosterId,
  );
  const contractsById = useMemo(
    () => new Map(contracts.map((player) => [player.sleeperPlayerId, player])),
    [contracts],
  );
  const selectedPlayers = useMemo(
    () => selectedFranchise?.playerIds
      .map((playerId) => contractsById.get(playerId))
      .filter((player) => player !== undefined) ?? [],
    [contractsById, selectedFranchise],
  );

  return (
    <div className="franchises-page">
      <header className="franchises-hero">
        <div>
          <span><Users size={17} /> Twelve clubs. One group chat.</span>
          <h1>The Franchises</h1>
          <p>The league directory keeps club identity public and manager identity member-only.</p>
        </div>
        <div className="franchise-privacy-state">
          {isMember ? <Shield size={22} /> : <LockKeyhole size={22} />}
          <strong>{isMember ? 'Member directory' : 'Public directory'}</strong>
          <small>{isMember ? 'Manager details unlocked' : 'Manager details protected'}</small>
        </div>
      </header>

      {isMember && selectedFranchise && (
        <section className="franchise-roster-panel" aria-label="Selected franchise roster">
          <div className="franchise-roster-heading">
            <div>
              <span><BadgeCheck size={14} /> Sleeper ownership × contract ledger</span>
              <h2>{selectedFranchise.franchiseName} roster</h2>
              <p>
                {selectedPlayers.length} contracted players matched by Sleeper player ID ·{' '}
                {selectedPlayers.filter((player) => player.authority === 'manager-correction').length}{' '}
                manager corrections
              </p>
            </div>
            <strong>{selectedPlayers.filter((player) => player.yearsRemaining === 1).length} expiring</strong>
          </div>
          {selectedFranchise.playerIds.length > 0 ? (
            <div className="contract-roster-table" role="table" aria-label={`${selectedFranchise.franchiseName} contracts`}>
              {selectedFranchise.playerIds.map((playerId) => {
                const player = contractsById.get(playerId);
                if (!player) return (
                  <div className="contract-roster-row is-unmatched" role="row" key={playerId}>
                    <strong role="cell">Sleeper player {playerId}</strong>
                    <span role="cell">Contract record not matched</span>
                  </div>
                );
                return (
                  <div className="contract-roster-row" role="row" key={playerId}>
                    <span className="contract-position" role="cell">{player.position}</span>
                    <div role="cell"><strong>{player.playerName}</strong><small>{player.nflTeam}</small></div>
                    <span role="cell">{player.tag && player.tag.toLowerCase() !== 'true' ? player.tag : player.tag ? 'Franchise' : '—'}</span>
                    <span role="cell">{player.exemption ? `Exm ${player.exemption}` : '—'}</span>
                    <strong className="contract-years" data-state={player.yearsRemaining === 1 ? 'expiring' : player.yearsRemaining ? 'active' : 'unknown'} role="cell">
                      {player.yearsRemaining ? `${player.yearsRemaining}Y` : '—'}
                    </strong>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="franchise-roster-empty">
              Live Sleeper ownership has not loaded for this cached preview. Contract values are not
              assigned using the Sheet&apos;s stale fantasy-team column.
            </p>
          )}
        </section>
      )}

      <ol className="franchise-directory" aria-label="League franchises">
        {snapshot.franchises.map((franchise) => {
          const ownFranchise = isMember && franchise.ownerUserId === session.userId;
          const pick = snapshot.draft.order.find((entry) => entry.rosterId === franchise.rosterId)?.slot;
          return (
            <li key={franchise.rosterId}>
              <article
                className={ownFranchise ? 'franchise-card is-viewer' : 'franchise-card'}
                aria-label={`${franchise.franchiseName} franchise`}
                style={{ '--club-accent': franchise.accent } as CSSProperties}
              >
                <div className="franchise-card-topline">
                  <span>Club {String(franchise.rosterId).padStart(2, '0')}</span>
                  {ownFranchise && <em>Your franchise</em>}
                </div>
                <div className="franchise-card-identity">
                  <FranchiseEmblem franchise={franchise} showPortrait={isMember} />
                  <div>
                    <h2>{franchise.franchiseName}</h2>
                    {isMember && <><span>Manager</span><strong>{franchise.managerDisplayName}</strong></>}
                  </div>
                </div>
                <dl>
                  <div><dt>Roster</dt><dd>{franchise.playerCount} players</dd></div>
                  <div><dt>Opening pick</dt><dd>{pick ? `1.${String(pick).padStart(2, '0')}` : 'Pending'}</dd></div>
                </dl>
                {isMember && (
                  <button type="button" onClick={() => setSelectedRosterId(franchise.rosterId)}>
                    View roster <ArrowRight size={15} />
                  </button>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
