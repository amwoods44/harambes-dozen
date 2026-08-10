import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ExternalLink,
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

function rosterName(snapshot: HomeSnapshot, rosterId: number) {
  return (
    snapshot.franchises.find((franchise) => franchise.rosterId === rosterId)?.franchiseName ??
    `Roster ${rosterId}`
  );
}

function sourceSummary(snapshot: HomeSnapshot) {
  return snapshot.source.state === 'live' ? 'Sleeper live' : 'Sleeper cached snapshot';
}

function assetSummary(transaction: LeagueTransaction) {
  const additions = Object.keys(transaction.adds).length;
  const drops = Object.keys(transaction.drops).length;
  const picks = transaction.draftPicks.length;

  return [
    `${additions} player${additions === 1 ? '' : 's'} added`,
    `${drops} player${drops === 1 ? '' : 's'} dropped`,
    `${picks} pick asset${picks === 1 ? '' : 's'}`,
  ].join(' · ');
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

export function TradesPage({
  snapshot,
  transactions = [],
  tradedPicks = [],
}: TradesPageProps) {
  const completedTransactions = transactions.filter(
    (transaction) => transaction.status.toLowerCase() === 'complete',
  );
  const transferredPicks = tradedPicks.filter((pick) => pick.transferred);
  const sleeperUrl = `https://sleeper.com/leagues/${snapshot.leagueId}`;

  return (
    <div className="trades-page">
      <header className="trades-hero">
        <div className="trades-hero-copy">
          <span className="trades-kicker"><Repeat2 size={17} /> Transaction desk</span>
          <h1>Trades <i>&amp;</i> Pick Ledger</h1>
          <p>
            A read-only view of confirmed Sleeper activity and the draft capital currently
            available to this league companion.
          </p>
        </div>
        <div className="trades-scoreboard" aria-label="Trade data summary">
          <span>{sourceSummary(snapshot)}</span>
          <strong>{completedTransactions.length}</strong>
          <small>confirmed moves loaded</small>
          <div>
            <strong>{transferredPicks.length}</strong>
            <small>pick transfers loaded</small>
          </div>
        </div>
      </header>

      <aside className="trades-execution-note" aria-label="Where trades happen">
        <span className="trades-note-icon" aria-hidden="true"><ExternalLink size={21} /></span>
        <div>
          <strong>League moves execute on Sleeper</strong>
          <p>This ledger is reference-only. Propose, accept, reject, or cancel every move there.</p>
        </div>
        <a href={sleeperUrl} target="_blank" rel="noreferrer">
          Open league in Sleeper <ArrowUpRight size={16} />
        </a>
      </aside>

      <div className="trades-layout">
        <section className="trades-panel trades-activity" aria-labelledby="confirmed-activity-heading">
          <div className="trades-panel-heading">
            <div>
              <span>Official log</span>
              <h2 id="confirmed-activity-heading">Confirmed activity</h2>
            </div>
            <BadgeCheck size={25} aria-hidden="true" />
          </div>

          {completedTransactions.length > 0 ? (
            <ol className="transaction-list">
              {completedTransactions.map((transaction) => {
                const participants = transaction.rosterIds.map((rosterId) =>
                  rosterName(snapshot, rosterId),
                );
                return (
                  <li key={transaction.id}>
                    <div className="transaction-mark" aria-hidden="true"><Repeat2 size={19} /></div>
                    <div className="transaction-copy">
                      <div className="transaction-meta">
                        <span>{transaction.type.replaceAll('_', ' ')}</span>
                        <time dateTime={transaction.createdAt}>{transactionDate(transaction.createdAt)}</time>
                      </div>
                      <strong>
                        {participants.length > 0
                          ? participants.join(' ↔ ')
                          : 'Roster assignment unavailable'}
                      </strong>
                      <p>{assetSummary(transaction)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="trades-empty-state">
              <span aria-hidden="true">00</span>
              <div>
                <strong>No confirmed transaction records are loaded.</strong>
                <p>
                  That does not mean no moves have occurred. Until the Sleeper transaction feed is
                  connected here, verify league activity in Sleeper.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="trades-panel draft-context" aria-labelledby="draft-context-heading">
          <div className="trades-panel-heading">
            <div>
              <span>{snapshot.draft.type} board</span>
              <h2 id="draft-context-heading">{snapshot.season} Round 1 context</h2>
            </div>
            <strong className="draft-rounds">{snapshot.draft.rounds} RDS</strong>
          </div>
          <ol
            className="pick-context-list"
            aria-label={`${snapshot.season} Round 1 draft position context`}
          >
            {snapshot.draft.order.map((entry) => (
              <li key={entry.slot}>
                <span>1.{String(entry.slot).padStart(2, '0')}</span>
                <strong>{entry.franchiseName}</strong>
                <ArrowRight size={14} aria-hidden="true" />
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section
        className="trades-panel pick-transfer-panel"
        aria-labelledby="pick-transfer-heading"
      >
        <div className="trades-panel-heading">
          <div>
            <span>Sleeper ownership</span>
            <h2 id="pick-transfer-heading">Confirmed pick transfers</h2>
          </div>
          <span className="trades-count">{transferredPicks.length} loaded</span>
        </div>

        {transferredPicks.length > 0 ? (
          <ul className="pick-transfer-list">
            {transferredPicks.map((pick) => (
              <li key={`${pick.season}-${pick.round}-${pick.originalRosterId}`}>
                <span>{pick.season} Round {pick.round}</span>
                <strong>
                  {rosterName(snapshot, pick.originalRosterId)} →{' '}
                  {rosterName(snapshot, pick.currentOwnerRosterId)}
                </strong>
                <small>Sleeper · {pick.source.state}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="pick-transfer-empty">
            No traded-pick ownership records are loaded in this slice. The Round 1 board above is
            draft-position context, not a claim about future-pick ownership.
          </p>
        )}
      </section>
    </div>
  );
}
