import {
  ArrowUpRight,
  BadgeCheck,
  ExternalLink,
  FileSearch,
  GitBranch,
  Repeat2,
} from 'lucide-react';

import type { HomeSnapshot } from '../../data/currentLeague';
import type { DraftPickOwnership } from '../../domain/picks';
import type { LeagueTransaction } from '../../domain/transactions';
import './TradesPage.css';

export interface TradesPageProps {
  snapshot: HomeSnapshot;
  transactions?: readonly LeagueTransaction[];
  tradedPicks?: readonly DraftPickOwnership[];
}

interface TransactionPickReference {
  season: number | null;
  round: number | null;
  originalRosterId: number | null;
  previousOwnerRosterId: number | null;
  currentOwnerRosterId: number | null;
}

interface FranchiseFootprint {
  rosterId: number;
  deals: number;
  playersIn: number;
  playersOut: number;
  acquiredPicks: number;
  originalPicksElsewhere: number;
}

function rosterName(snapshot: HomeSnapshot, rosterId: number) {
  return (
    snapshot.franchises.find((franchise) => franchise.rosterId === rosterId)?.franchiseName ??
    `Roster ${rosterId}`
  );
}

function sourceSummary(snapshot: HomeSnapshot) {
  return snapshot.source.state === 'live' ? 'Sleeper live' : 'Sleeper cached snapshot';
}

function optionalNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }
  return null;
}

function transactionPickReference(value: unknown): TransactionPickReference | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const pick = {
    season: optionalNumber(record.season),
    round: optionalNumber(record.round),
    originalRosterId: optionalNumber(record.roster_id),
    previousOwnerRosterId: optionalNumber(record.previous_owner_id),
    currentOwnerRosterId: optionalNumber(record.owner_id),
  };

  return Object.values(pick).some((item) => item !== null) ? pick : null;
}

function transactionPickReferences(transaction: LeagueTransaction) {
  return transaction.draftPicks
    .map(transactionPickReference)
    .filter((pick): pick is TransactionPickReference => pick !== null);
}

function transactionRosterIds(transaction: LeagueTransaction) {
  const rosterIds = new Set(transaction.rosterIds);
  Object.values(transaction.adds).forEach((rosterId) => rosterIds.add(rosterId));
  Object.values(transaction.drops).forEach((rosterId) => rosterIds.add(rosterId));
  if (rosterIds.size === 0) {
    transactionPickReferences(transaction).forEach((pick) => {
      if (pick.previousOwnerRosterId !== null) rosterIds.add(pick.previousOwnerRosterId);
      if (pick.currentOwnerRosterId !== null) rosterIds.add(pick.currentOwnerRosterId);
    });
  }
  return [...rosterIds];
}

function participantLine(snapshot: HomeSnapshot, transaction: LeagueTransaction) {
  const rosterIds = transaction.rosterIds.length > 0
    ? transaction.rosterIds
    : transactionRosterIds(transaction);
  const names = [...new Set(rosterIds.map((rosterId) => rosterName(snapshot, rosterId)))];
  if (names.length === 0) return 'Roster assignment unavailable';
  if (names.length === 1) return names[0];
  if (names.length === 2) return names.join(' ↔ ');
  return `${names.slice(0, -1).join(', ')} & ${names.at(-1)}`;
}

function transactionDate(createdAt: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
    timeZoneName: 'short',
  }).format(new Date(createdAt));
}

function transactionType(type: string) {
  return type.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function playerReviewCount(transaction: LeagueTransaction) {
  return new Set([...Object.keys(transaction.adds), ...Object.keys(transaction.drops)]).size;
}

function ledgerRead(transaction: LeagueTransaction) {
  const players = playerReviewCount(transaction);
  const picks = transaction.draftPicks.length;
  if (players > 0 && picks > 0) return 'Player movement and draft capital changed hands.';
  if (players > 0) return 'The roster changed; contract terms still require the commissioner ledger.';
  if (picks > 0) return 'The future-pick ledger changed without a player move in this record.';
  return 'Sleeper confirms the transaction, but this normalized record exposes no player or pick assets.';
}

function transactionPickLine(snapshot: HomeSnapshot, pick: TransactionPickReference) {
  const label = pick.season !== null && pick.round !== null
    ? `${pick.season} R${pick.round}`
    : 'Draft-pick asset';
  const from = pick.previousOwnerRosterId ?? pick.originalRosterId;
  if (from !== null && pick.currentOwnerRosterId !== null) {
    return `${label} · ${rosterName(snapshot, from)} → ${rosterName(snapshot, pick.currentOwnerRosterId)}`;
  }
  return `${label} · ownership detail incomplete in this transaction payload`;
}

function ownershipPath(snapshot: HomeSnapshot, pick: DraftPickOwnership) {
  const rosterIds = [
    pick.originalRosterId,
    pick.previousOwnerRosterId,
    pick.currentOwnerRosterId,
  ].filter((rosterId, index, all) => index === 0 || rosterId !== all[index - 1]);
  return rosterIds.map((rosterId) => rosterName(snapshot, rosterId)).join(' → ');
}

function buildFootprints(
  snapshot: HomeSnapshot,
  transactions: readonly LeagueTransaction[],
  picks: readonly DraftPickOwnership[],
) {
  const byRoster = new Map<number, FranchiseFootprint>();
  const footprint = (rosterId: number) => {
    const existing = byRoster.get(rosterId);
    if (existing) return existing;
    const created: FranchiseFootprint = {
      rosterId,
      deals: 0,
      playersIn: 0,
      playersOut: 0,
      acquiredPicks: 0,
      originalPicksElsewhere: 0,
    };
    byRoster.set(rosterId, created);
    return created;
  };

  transactions.forEach((transaction) => {
    transactionRosterIds(transaction).forEach((rosterId) => {
      footprint(rosterId).deals += 1;
    });
    Object.values(transaction.adds).forEach((rosterId) => {
      footprint(rosterId).playersIn += 1;
    });
    Object.values(transaction.drops).forEach((rosterId) => {
      footprint(rosterId).playersOut += 1;
    });
  });

  picks.forEach((pick) => {
    if (!pick.transferred) return;
    footprint(pick.currentOwnerRosterId).acquiredPicks += 1;
    footprint(pick.originalRosterId).originalPicksElsewhere += 1;
  });

  const franchiseOrder = new Map(
    snapshot.franchises.map((franchise, index) => [franchise.rosterId, index]),
  );
  return [...byRoster.values()].sort(
    (left, right) =>
      right.deals - left.deals ||
      right.playersIn + right.playersOut - (left.playersIn + left.playersOut) ||
      (franchiseOrder.get(left.rosterId) ?? 99) - (franchiseOrder.get(right.rosterId) ?? 99),
  );
}

export function TradesPage({
  snapshot,
  transactions = [],
  tradedPicks = [],
}: TradesPageProps) {
  const completedTransactions = [...transactions]
    .filter((transaction) => transaction.status.toLowerCase() === 'complete')
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const completedTrades = completedTransactions.filter(
    (transaction) => transaction.type.toLowerCase() === 'trade',
  );
  const unconfirmedCount = transactions.length - completedTransactions.length;
  const transferredPicks = tradedPicks.filter((pick) => pick.transferred);
  const latest = completedTrades[0] ?? completedTransactions[0];
  const latestPicks = latest ? transactionPickReferences(latest) : [];
  const latestPlayerCount = latest ? playerReviewCount(latest) : 0;
  const footprints = buildFootprints(snapshot, completedTransactions, transferredPicks);
  const sleeperUrl = `https://sleeper.com/leagues/${snapshot.leagueId}`;

  return (
    <div className="trades-page">
      <header className="trade-desk-masthead">
        <div className="trade-desk-title">
          <span className="trades-kicker"><Repeat2 size={17} /> Harambe&apos;s Dozen transaction desk</span>
          <h1>Trade Desk</h1>
          <p>Who moved, what changed, and what the record still cannot prove.</p>
        </div>
        <div className="trade-edition" aria-label="Trade desk edition">
          <span>{sourceSummary(snapshot)}</span>
          <strong>{snapshot.season}</strong>
          <small>{snapshot.status.replaceAll('_', ' ')} edition</small>
        </div>
      </header>

      <dl className="trade-ticker" aria-label="Transaction desk summary">
        <div><dt>Confirmed trades</dt><dd>{completedTrades.length}</dd></div>
        <div><dt>Franchises touched</dt><dd>{footprints.length}</dd></div>
        <div><dt>Transferred picks</dt><dd>{transferredPicks.length}</dd></div>
        <div><dt>Feed discipline</dt><dd>{plural(unconfirmedCount, 'unconfirmed record')} withheld</dd></div>
      </dl>

      <aside className="trade-execution-bar" aria-label="Where league moves happen">
        <ExternalLink size={19} aria-hidden="true" />
        <p><strong>Execution stays in Sleeper.</strong> This desk explains the league consequences after the record is confirmed.</p>
        <a href={sleeperUrl} target="_blank" rel="noreferrer">
          Open league in Sleeper <ArrowUpRight size={15} />
        </a>
      </aside>

      {latest ? (
        <article className="trade-lead" role="region" aria-label="Latest confirmed move">
          <div className="trade-section-rule">
            <span>Latest confirmed move</span>
            <small>{transactionType(latest.type)} · Week {latest.week}</small>
          </div>
          <div className="trade-lead-layout">
            <section className="trade-lead-story">
              <p className="trade-byline">
                <BadgeCheck size={15} aria-hidden="true" /> Sleeper confirmed ·{' '}
                <time dateTime={latest.createdAt}>{transactionDate(latest.createdAt)}</time>
              </p>
              <h2 id="latest-move-heading">{participantLine(snapshot, latest)}</h2>
              <p className="trade-lead-deck">{ledgerRead(latest)}</p>
              <ul className="trade-asset-score" aria-label="Latest move asset counts">
                <li>{plural(Object.keys(latest.adds).length, 'player')} in</li>
                <li>{plural(Object.keys(latest.drops).length, 'player')} out</li>
                <li>{plural(latest.draftPicks.length, 'pick')} moved</li>
              </ul>
              {latestPicks.length > 0 && (
                <ul className="trade-pick-lines" aria-label="Draft capital in latest move">
                  {latestPicks.map((pick, index) => (
                    <li key={`${pick.season}-${pick.round}-${index}`}>
                      <GitBranch size={14} aria-hidden="true" /> {transactionPickLine(snapshot, pick)}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <aside className="trade-contract-lens" aria-labelledby="contract-consequence-heading">
              <FileSearch size={24} aria-hidden="true" />
              <span>Commissioner overlay required</span>
              <h3 id="contract-consequence-heading">Contract consequences</h3>
              {latestPlayerCount > 0 ? (
                <strong>{plural(latestPlayerCount, 'player ID')} need contract-ledger review</strong>
              ) : (
                <strong>No player IDs changed roster in this record</strong>
              )}
              <p>
                Sleeper does not carry contract years, tags, or exemptions in its transaction
                payload. No private term is inferred here.
              </p>
            </aside>
          </div>
        </article>
      ) : (
        <section
          className="trade-coverage-empty"
          aria-label="Transaction coverage"
        >
          <div>
            <span>Confirmed feed · zero records</span>
            <h2 id="transaction-coverage-heading">No confirmed movement to explain yet</h2>
            <p>
              No trade conclusions are drawn from an empty feed. Sleeper remains the place to
              verify proposals and completed moves.
            </p>
            {unconfirmedCount > 0 && (
              <p className="trade-withheld-note">
                <strong>{plural(unconfirmedCount, 'unconfirmed record')} withheld.</strong>{' '}
                No completed record means no deal is presented as final.
              </p>
            )}
            {transferredPicks.length > 0 && (
              <p className="trade-pick-only-note">
                Pick movement is available even though transaction history is not; the ownership
                paths below remain useful.
              </p>
            )}
          </div>
          <dl aria-label="Verified league baseline">
            <div><dt>Draft status</dt><dd>Order locked</dd></div>
            <div><dt>League field</dt><dd>{snapshot.franchises.length} clubs</dd></div>
            <div><dt>Draft depth</dt><dd>{snapshot.draft.rounds} rounds</dd></div>
          </dl>
        </section>
      )}

      <div className="trade-report-layout">
        <section
          className="trade-history"
          aria-label="Transaction history"
        >
          <div className="trade-section-rule">
            <span>Transaction history</span>
            <small>{completedTransactions.length} confirmed</small>
          </div>
          <h2 id="transaction-history-heading">The official ledger, read in context</h2>
          {completedTransactions.length > 0 ? (
            <ol>
              {completedTransactions.map((transaction, index) => {
                const picks = transactionPickReferences(transaction);
                return (
                  <li key={transaction.id}>
                    <span className="trade-history-index">{String(index + 1).padStart(2, '0')}</span>
                    <article>
                      <div className="trade-history-meta">
                        <span>{transactionType(transaction.type)} · Week {transaction.week}</span>
                        <time dateTime={transaction.createdAt}>{transactionDate(transaction.createdAt)}</time>
                      </div>
                      <h3>{participantLine(snapshot, transaction)}</h3>
                      <p>{ledgerRead(transaction)}</p>
                      <ul className="trade-history-facts">
                        <li>{plural(Object.keys(transaction.adds).length, 'player')} in</li>
                        <li>{plural(Object.keys(transaction.drops).length, 'player')} out</li>
                        <li>{plural(transaction.draftPicks.length, 'pick')} moved</li>
                      </ul>
                      {picks.length > 0 && (
                        <small>{picks.map((pick) => transactionPickLine(snapshot, pick)).join(' · ')}</small>
                      )}
                    </article>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="trade-history-empty">
              The chronological ledger opens when Sleeper returns a completed transaction.
            </p>
          )}
        </section>

        <section className="pick-provenance" aria-labelledby="pick-ownership-heading">
          <div className="trade-section-rule">
            <span>Pick provenance</span>
            <small>Sleeper ownership snapshot</small>
          </div>
          <h2 id="pick-ownership-heading">Pick ownership paths</h2>
          {transferredPicks.length > 0 ? (
            <ol>
              {transferredPicks.map((pick) => (
                <li key={`${pick.season}-${pick.round}-${pick.originalRosterId}`}>
                  <span>{pick.season} Round {pick.round}</span>
                  <strong>{ownershipPath(snapshot, pick)}</strong>
                  <small>Original → Previous → Current</small>
                </li>
              ))}
            </ol>
          ) : (
            <div className="pick-provenance-empty">
              <strong>No transferred-pick ownership is loaded.</strong>
              <p>Draft order is not substituted for future-pick ownership.</p>
            </div>
          )}
          <p className="pick-provenance-caveat">
            Sleeper exposes the original, previous, and current owner in the current snapshot. That
            is useful provenance, not a complete transaction-by-transaction audit trail.
          </p>
        </section>
      </div>

      {footprints.length > 0 && (
        <section className="franchise-footprint" aria-labelledby="franchise-footprint-heading">
          <div className="trade-section-rule">
            <span>Roster impact</span>
            <small>Only franchises present in verified movement</small>
          </div>
          <h2 id="franchise-footprint-heading">Franchise trade footprint</h2>
          <div className="franchise-footprint-scroll">
            <table aria-label="Franchise trade footprint">
              <thead>
                <tr>
                  <th scope="col">Franchise</th>
                  <th scope="col">Records</th>
                  <th scope="col">Players in</th>
                  <th scope="col">Players out</th>
                  <th scope="col">Acquired capital</th>
                  <th scope="col">Original capital moved</th>
                </tr>
              </thead>
              <tbody>
                {footprints.map((item) => (
                  <tr key={item.rosterId}>
                    <th scope="row">{rosterName(snapshot, item.rosterId)}</th>
                    <td>{plural(item.deals, 'record')}</td>
                    <td>{item.playersIn} in</td>
                    <td>{item.playersOut} out</td>
                    <td>{plural(item.acquiredPicks, 'acquired pick')}</td>
                    <td>{plural(item.originalPicksElsewhere, 'original pick')} elsewhere</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="trade-methodology" aria-label="How to read the trade desk">
        <strong>How to read this desk</strong>
        <p><b>Sleeper confirms</b> transaction status, roster movement, and current pick ownership.</p>
        <p><b>The commissioner ledger confirms</b> contract years, tags, exemptions, and corrections.</p>
        <p><b>This page never assumes</b> a private term or a missing step in a pick&apos;s history.</p>
      </footer>
    </div>
  );
}
