import { BadgeCheck, CalendarClock, FileWarning, ShieldCheck, Trophy, Users } from 'lucide-react';

import type { ViewerSession } from '../../App';
import type { HomeSnapshot } from '../../data/currentLeague';
import { sleeperEraChampions } from '../../data/leagueHistory';
import './LeaguePage.css';

export interface LeaguePageProps {
  snapshot: HomeSnapshot;
  session: ViewerSession;
}

const lineup = [
  ['Teams', '12 teams'],
  ['Quarterback', '1 QB'],
  ['Running back', '2 RB'],
  ['Wide receiver', '3 WR'],
  ['Tight end', '1 TE'],
  ['Flex', '2 FLEX'],
  ['Defense', '1 DEF'],
  ['Bench', '15 bench'],
  ['Reserve', '1 IR'],
  ['Kicker', 'No kicker'],
] as const;

export function LeaguePage({ snapshot, session }: LeaguePageProps) {
  const memberView = session.kind === 'member';

  return (
    <div className="league-page">
      <header className="league-page-hero">
        <div>
          <span className="league-page-kicker"><BadgeCheck size={17} /> The current standard</span>
          <h1>Harambe&apos;s Dozen league format</h1>
          <p>
            The rules that matter now, separated from the league&apos;s older paperwork and stamped
            with the source that governs them.
          </p>
        </div>
        <dl className="league-page-scoreboard">
          <div><dt>Season</dt><dd>{snapshot.season}</dd></div>
          <div><dt>Clubs</dt><dd>{snapshot.franchises.length}</dd></div>
          <div><dt>Starters</dt><dd>10</dd></div>
          <div><dt>Draft</dt><dd>{snapshot.draft.rounds} RDS</dd></div>
        </dl>
      </header>

      <section className="league-format-card" aria-label="Current roster format">
        <div className="league-section-heading">
          <div>
            <span>2026 configuration</span>
            <h2>Current roster format</h2>
          </div>
          <Users size={28} aria-hidden="true" />
        </div>
        <dl className="league-format-grid">
          {lineup.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="league-format-note">
          This is the current format: three starting receivers, no kicker, and one IR slot.
        </p>
      </section>

      <div className="league-page-grid">
        <section className="league-info-card" aria-labelledby="league-operations-heading">
          <div className="league-section-heading">
            <div><span>League rhythm</span><h2 id="league-operations-heading">Operating notes</h2></div>
            <CalendarClock size={25} aria-hidden="true" />
          </div>
          <ul className="league-notes">
            <li><strong>Scoring</strong><span>Full PPR; ordinary fumbles score 0.</span></li>
            <li><strong>Extensions</strong><span>Only players with one contract year remaining qualify.</span></li>
            <li><strong>Exemptions</strong><span>Declarations are normally due Memorial Day by end of day.</span></li>
            <li><strong>Draft</strong><span>{snapshot.draft.rounds}-round {snapshot.draft.type} board; selections execute in Sleeper.</span></li>
          </ul>
        </section>

        <section className="league-info-card" aria-label="Source authority">
          <div className="league-section-heading">
            <div><span>Truth hierarchy</span><h2>Source authority</h2></div>
            <ShieldCheck size={25} aria-hidden="true" />
          </div>
          <ol className="league-authority">
            <li><b>01</b><p><strong>Current league settings — Commissioner</strong><span>Confirmed rules and corrections.</span></p></li>
            <li><b>02</b><p><strong>Sleeper — League and roster data</strong><span>Draft order and transactions.</span></p></li>
            <li><b>03</b><p><strong>2022 constitution — Legacy context only</strong><span>Not current authority.</span></p></li>
          </ol>
          <p className="league-conflict-note">
            <FileWarning size={16} /> If sources conflict, current settings and commissioner rulings govern.
          </p>
        </section>
      </div>

      <section className="league-history-strip" aria-label="League history snapshot">
        <Trophy size={30} aria-hidden="true" />
        <div><span>Reigning champion</span><strong>{snapshot.records.champion}</strong></div>
        <div><span>Championship season</span><strong>{snapshot.records.season}</strong></div>
        <div><span>Member detail</span><strong>{memberView ? 'Unlocked' : 'Private'}</strong></div>
      </section>

      <section className="league-champions-card" aria-labelledby="championship-history-heading">
        <div className="league-section-heading">
          <div><span>Sleeper verified · 2021–2025</span><h2 id="championship-history-heading">Championship history</h2></div>
          <Trophy size={25} aria-hidden="true" />
        </div>
        <ol>
          {[...sleeperEraChampions].reverse().map((result) => (
            <li key={result.season}>
              <strong>{result.season}</strong>
              <div><span>Champion</span><b>{result.champion}</b></div>
              <div><span>Runner-up</span><b>{result.runnerUp}</b></div>
              <em>Verified</em>
            </li>
          ))}
        </ol>
        <p>League play before 2021 is preserved as legacy history but is not presented as fully verified here.</p>
      </section>
    </div>
  );
}
