import {
  Archive,
  CalendarDays,
  CheckCircle2,
  FileWarning,
  Landmark,
  ShieldCheck,
} from 'lucide-react';

import type { ViewerSession } from '../../App';
import type { ContractPlayer } from '../../data/contractLedger';
import type { HomeSnapshot } from '../../data/currentLeague';
import {
  deriveLedgerHealth,
  leagueRuleRegister,
  ruleStatusLabel,
  type RuleGroup,
} from '../../domain/leagueOffice';
import type { SourceStamp } from '../../domain/source';
import './LeagueOfficePage.css';

export interface LeagueOfficePageProps {
  snapshot: HomeSnapshot;
  session: ViewerSession;
  contracts?: ContractPlayer[];
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

const ruleGroups: RuleGroup[] = [
  'Roster configuration',
  'Scoring',
  'Contracts and extensions',
  'Exemptions',
  'Draft operations',
  'Trading',
  'Waivers and free agency',
  'Playoffs and competition',
];

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

export function LeagueOfficePage({
  snapshot,
  session,
  contracts = [],
}: LeagueOfficePageProps) {
  const confirmedCount = leagueRuleRegister.filter(
    (rule) => rule.status === 'commissioner-confirmed' || rule.status === 'sleeper-live',
  ).length;
  const unresolvedCount = leagueRuleRegister.filter((rule) => rule.status === 'unresolved').length;
  const ledgerHealth = session.kind === 'member'
    ? deriveLedgerHealth(snapshot, contracts)
    : null;

  return (
    <div className="office-page">
      <header className="office-hero" aria-label="League Office status">
        <div>
          <span className="office-kicker"><Landmark size={17} /> Commissioner desk</span>
          <h1>League Office</h1>
          <p>
            The current operating record—what governs, who confirmed it, and what still needs a ruling.
          </p>
        </div>
        <dl className="office-season-card">
          <div><dt>Season</dt><dd>{snapshot.season}</dd></div>
          <div><dt>League phase</dt><dd>{snapshot.status.replaceAll('_', ' ')}</dd></div>
          <div><dt>Confirmed areas</dt><dd>{confirmedCount}</dd></div>
          <div><dt>Unresolved</dt><dd>{unresolvedCount}</dd></div>
          <div className="office-season-card-wide">
            <dt>Data state</dt>
            <dd>{snapshot.source.state} · {snapshotTimestamp(snapshot.source)}</dd>
          </div>
        </dl>
      </header>

      <section className="office-rule-register" aria-labelledby="rule-register-heading">
        <div className="office-section-intro">
          <div>
            <span><ShieldCheck size={15} /> Current operating record</span>
            <h2 id="rule-register-heading">Current rule register</h2>
          </div>
          <p>
            Confirmed rules are separated from Sleeper settings and unresolved legacy language.
          </p>
        </div>
        <div className="office-rule-groups">
          {ruleGroups.map((group, index) => (
            <article className="office-rule-group" key={group}>
              <header>
                <small>{String(index + 1).padStart(2, '0')}</small>
                <h3>{group}</h3>
              </header>
              <div>
                {leagueRuleRegister
                  .filter((rule) => rule.group === group)
                  .map((rule) => (
                    <section className="office-rule-row" data-status={rule.status} key={rule.id}>
                      <div>
                        <strong>{rule.statement}</strong>
                        <p>{rule.sourceNote}</p>
                      </div>
                      <dl>
                        <div>
                          <dt>Authority</dt>
                          <dd>{ruleStatusLabel(rule.status)}</dd>
                        </div>
                        <div>
                          <dt>Effective</dt>
                          <dd>
                            {rule.effectiveSeason
                              ? `Effective ${rule.effectiveSeason}`
                              : 'Effective season unverified'}
                          </dd>
                        </div>
                      </dl>
                    </section>
                  ))}
              </div>
            </article>
          ))}
        </div>
      </section>

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
              <span>Offseason docket</span>
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

      {ledgerHealth && (
        <section className="office-ledger-health" aria-labelledby="ledger-health-heading">
          <div className="office-section-intro">
            <div>
              <span><CheckCircle2 size={15} /> Member-only integrity report</span>
              <h2 id="ledger-health-heading">Contract ledger health</h2>
            </div>
            <p>Sleeper ownership joined to the private contract ledger by player ID.</p>
          </div>
          <dl>
            <div><dt>Private records</dt><dd>{ledgerHealth.totalRecords}</dd></div>
            <div>
              <dt>Current roster coverage</dt>
              <dd>{ledgerHealth.matchedRosterPlayers} / {ledgerHealth.currentRosterPlayers}</dd>
            </div>
            <div><dt>Manager corrections</dt><dd>{ledgerHealth.correctedRecords}</dd></div>
            <div><dt>Ordinary extension window</dt><dd>{ledgerHealth.oneYearDecisions}</dd></div>
            <div><dt>Two-year watch</dt><dd>{ledgerHealth.twoYearWatch}</dd></div>
          </dl>
          <div className="office-ledger-alert" data-state={ledgerHealth.unmatchedRosterIds.length ? 'review' : 'clear'}>
            <strong>{ledgerHealth.unmatchedRosterIds.length} unmatched</strong>
            <p>
              {ledgerHealth.unmatchedRosterIds.length
                ? 'These Sleeper roster IDs require a contract-record join before the ledger is complete.'
                : 'Every current Sleeper roster ID is joined to a contract record.'}
            </p>
          </div>
          <p className="office-exemption-clarifier">
            One-year players are ordinary-extension decisions. An exemption may renegotiate any
            contract regardless of years remaining.
          </p>
        </section>
      )}

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
