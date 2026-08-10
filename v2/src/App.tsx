import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronDown,
  Clock3,
  Moon,
  Shield,
  Sun,
  Trophy,
  Zap,
} from 'lucide-react';

import '@fontsource/barlow-condensed/latin-500.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource-variable/source-sans-3/wght.css';
import './styles.css';

import { LeagueCrest } from './components/LeagueCrest';
import {
  currentHomeSnapshot,
  sleeperAvatarUrl,
  type FranchiseSnapshot,
  type HomeDeadline,
  type HomeRecord,
  type HomeSnapshot,
  type HomeStory,
} from './data/currentLeague';
import type { ContractPlayer } from './data/contractLedger';
import type { DraftPickOwnership } from './domain/picks';
import type { LeagueTransaction } from './domain/transactions';
import type { ContractRepository } from './services/contractRepository';
import type { LeagueRepository } from './services/leagueRepository';
import type { MemberSessionService } from './services/memberSession';
import { ClubhousePage } from './pages/clubhouse/ClubhousePage';
import { DraftPage } from './pages/draft/DraftPage';
import { FranchisesPage } from './pages/franchises/FranchisesPage';
import { LeaguePage } from './pages/league/LeaguePage';
import { LeagueOfficePage } from './pages/office/LeagueOfficePage';
import { TradesPage } from './pages/trades/TradesPage';

export type ViewerSession =
  | { kind: 'public' }
  | { kind: 'member'; userId: string; role?: 'member' | 'admin' };

interface AppProps {
  initialSession?: ViewerSession;
  now?: Date;
  repository?: LeagueRepository;
  memberSessionService?: MemberSessionService | null;
  contractRepository?: ContractRepository | null;
}

type Theme = 'day' | 'night';

type RouteId =
  | 'home'
  | 'league'
  | 'franchises'
  | 'trades'
  | 'draft'
  | 'league-office'
  | 'clubhouse';

const primaryNavigation: ReadonlyArray<{ label: string; route: RouteId }> = [
  { label: 'Home', route: 'home' },
  { label: 'League', route: 'league' },
  { label: 'Franchises', route: 'franchises' },
  { label: 'Trades', route: 'trades' },
  { label: 'Draft', route: 'draft' },
  { label: 'League Office', route: 'league-office' },
  { label: 'Clubhouse', route: 'clubhouse' },
];

const implementedRoutes = new Set<RouteId>([
  'home',
  'league',
  'franchises',
  'trades',
  'draft',
  'league-office',
  'clubhouse',
]);

function routeHref(route: RouteId) {
  return route === 'home' ? '#/' : `#/${route}`;
}

function routeFromHash(hash = window.location.hash): RouteId {
  const candidate = hash.replace(/^#\/?/, '').split(/[?#]/)[0] || 'home';
  return primaryNavigation.some((item) => item.route === candidate)
    ? (candidate as RouteId)
    : 'home';
}

function useRoute() {
  const [route, setRoute] = useState<RouteId>(routeFromHash);

  useEffect(() => {
    const syncRoute = () => {
      const nextRoute = routeFromHash();
      setRoute(implementedRoutes.has(nextRoute) ? nextRoute : 'home');
    };
    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  return route;
}

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem('hd12-theme');
    if (saved === 'day' || saved === 'night') return saved;
  } catch {
    // Storage can be unavailable in hardened/private browser contexts.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('hd12-theme', theme);
    } catch {
      // The selected theme still applies for this visit when storage is unavailable.
    }
  }, [theme]);

  return {
    theme,
    toggle: () => setTheme((current) => (current === 'day' ? 'night' : 'day')),
  };
}

function countdownParts(target: string, now: Date) {
  const remaining = Math.max(0, new Date(target).getTime() - now.getTime());
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function useCountdown(target: string, fixedNow?: Date) {
  const [clock, setClock] = useState(() => fixedNow ?? new Date());

  useEffect(() => {
    if (fixedNow) {
      setClock(fixedNow);
      return;
    }
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [fixedNow]);

  return countdownParts(target, clock);
}

function ManagerAvatar({
  franchise,
  showIdentity,
  size = 'regular',
}: {
  franchise: FranchiseSnapshot;
  showIdentity: boolean;
  size?: 'small' | 'regular';
}) {
  if (showIdentity && franchise.avatarId) {
    return (
      <img
        className="manager-avatar"
        data-size={size}
        src={sleeperAvatarUrl(franchise.avatarId)}
        alt={`${franchise.managerDisplayName} portrait`}
      />
    );
  }

  return (
    <span
      className="franchise-monogram"
      data-size={size}
      aria-hidden="true"
      style={{ '--franchise-accent': franchise.accent } as React.CSSProperties}
    >
      {franchise.monogram}
    </span>
  );
}

function Header({
  session,
  theme,
  route,
  onToggleTheme,
  onRequestSignIn,
}: {
  session: ViewerSession;
  theme: Theme;
  route: RouteId;
  onToggleTheme: () => void;
  onRequestSignIn: () => void;
}) {
  return (
    <header className="site-header">
      <a className="brand" href={routeHref('home')} aria-label="Harambe's Dozen home">
        <LeagueCrest />
      </a>
      <nav className="primary-nav" aria-label="Primary navigation">
        {primaryNavigation.map((item) => (
          <a
            aria-current={route === item.route ? 'page' : undefined}
            className={route === item.route ? 'active' : ''}
            href={routeHref(item.route)}
            key={item.route}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <button
          className="icon-button theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'day' ? 'night' : 'day'} theme`}
        >
          {theme === 'day' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        {session.kind === 'member' && (
          <button className="icon-button" type="button" aria-label="Notifications">
            <Bell size={18} />
          </button>
        )}
        <button className="member-control" type="button" onClick={onRequestSignIn}>
          <span>{session.kind === 'member' ? 'Member' : 'Sign in'}</span>
          <ChevronDown size={15} />
        </button>
      </div>
    </header>
  );
}

function MyFranchise({
  franchise,
  pick,
  startsAt,
}: {
  franchise: FranchiseSnapshot;
  pick: number;
  startsAt: string;
}) {
  const draftDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
    timeZoneName: 'short',
  }).format(new Date(startsAt));

  return (
    <aside className="my-franchise" id="my-franchise" role="region" aria-label="My Franchise">
      <div className="panel-kicker">
        <Shield size={17} />
        <span>My Franchise</span>
      </div>
      <div className="my-franchise-body">
        <div className="my-franchise-identity">
          <ManagerAvatar franchise={franchise} showIdentity />
          <div>
            <span className="micro-label">Your club</span>
            <strong>{franchise.franchiseName}</strong>
          </div>
        </div>
        <div className="next-pick">
          <span className="micro-label">Next pick</span>
          <strong>1.{String(pick).padStart(2, '0')}</strong>
        </div>
        <div className="franchise-meta">
          <span>Draft night</span>
          <strong>{draftDate}</strong>
        </div>
        <a className="primary-button" href={routeHref('franchises')}>
          View franchise <ArrowRight size={17} />
        </a>
      </div>
    </aside>
  );
}

function PublicSnapshot({ onRequestSignIn }: { onRequestSignIn: () => void }) {
  return (
    <aside className="my-franchise public-snapshot" aria-label="Member access">
      <div className="panel-kicker">
        <Shield size={17} />
        <span>My Franchise</span>
      </div>
      <div className="my-franchise-body">
        <span className="micro-label">Private league access</span>
        <strong className="public-number">Your club</strong>
        <p>Contract clock, roster, draft room, and league intelligence—kept inside the Dozen.</p>
        <button className="primary-button" type="button" onClick={onRequestSignIn}>
          Enter the league <ArrowRight size={17} />
        </button>
      </div>
    </aside>
  );
}

function Countdown({
  startsAt,
  parts,
}: {
  startsAt: string;
  parts: ReturnType<typeof countdownParts>;
}) {
  const units = [
    ['Days', parts.days],
    ['Hrs', parts.hours],
    ['Min', parts.minutes],
    ['Sec', parts.seconds],
  ] as const;

  return (
    <time
      className="countdown"
      role="timer"
      dateTime={startsAt}
      aria-label={`Draft countdown: ${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes`}
    >
      {units.map(([label, value]) => (
        <span className="countdown-unit" key={label}>
          <strong>{String(value).padStart(2, '0')}</strong>
          <small>{label}</small>
        </span>
      ))}
    </time>
  );
}

function Hero({
  snapshot,
  session,
  fixedNow,
  onRequestSignIn,
}: {
  snapshot: HomeSnapshot;
  session: ViewerSession;
  fixedNow?: Date;
  onRequestSignIn: () => void;
}) {
  const countdown = useCountdown(snapshot.draft.startsAt, fixedNow);
  const viewerFranchise =
    session.kind === 'member'
      ? snapshot.franchises.find((team) => team.ownerUserId === session.userId)
      : undefined;
  const viewerPick = viewerFranchise
    ? snapshot.draft.order.find((entry) => entry.rosterId === viewerFranchise.rosterId)?.slot
    : undefined;
  const sourceLabel = snapshot.source.state === 'live'
    ? `League data live · ${new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(snapshot.source.fetchedAt))}`
    : `Last league sync · ${new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(new Date(snapshot.source.fetchedAt))}`;

  return (
    <section className="hero" id="home">
      <div className="hero-copy">
        <div className="season-status">
          <span className="status-dot" />
          Pre-draft
          <span className="source-state">{sourceLabel}</span>
        </div>
        <h1>
          <span>Draft night</span>
          <span className="headline-detail">
            <small>in</small>
            <strong>{countdown.days}</strong>
            <span>days</span>
          </span>
        </h1>
        <p className="hero-deck">The board is set. The group chat is already lying.</p>
        <Countdown startsAt={snapshot.draft.startsAt} parts={countdown} />
      </div>
      <div className="hero-art" aria-hidden="true">
        <span className="hero-number">12</span>
        <span className="slash slash-one" />
        <span className="slash slash-two" />
        <img src="/assets/harambe-letterman.png" alt="" />
      </div>
      {viewerFranchise && viewerPick ? (
        <MyFranchise
          franchise={viewerFranchise}
          pick={viewerPick}
          startsAt={snapshot.draft.startsAt}
        />
      ) : (
        <PublicSnapshot onRequestSignIn={onRequestSignIn} />
      )}
    </section>
  );
}

function DraftOrder({ snapshot, session }: { snapshot: HomeSnapshot; session: ViewerSession }) {
  const showIdentity = session.kind === 'member';
  const viewerRosterId =
    session.kind === 'member'
      ? snapshot.franchises.find((team) => team.ownerUserId === session.userId)?.rosterId
      : null;

  return (
    <section className="draft-rail" id="draft" role="region" aria-label="Round 1 pick order">
      <div className="rail-title">
        <span>Round 1</span>
        <strong>Pick order</strong>
        <a href={routeHref('draft')}>Full board <ArrowRight size={14} /></a>
      </div>
      <ol>
        {snapshot.draft.order.map((entry) => {
          const franchise = snapshot.franchises.find((team) => team.rosterId === entry.rosterId) ?? {
            rosterId: entry.rosterId,
            ownerUserId: entry.ownerUserId ?? '',
            franchiseName: entry.franchiseName || `Roster ${entry.rosterId}`,
            managerDisplayName: entry.managerDisplayName ?? `Roster ${entry.rosterId}`,
            avatarId: null,
            playerCount: 0,
            playerIds: [],
            accent: '#72808a',
            monogram: entry.franchiseName
              .split(/\s+/)
              .map((word) => word[0])
              .join('')
              .slice(0, 3)
              .toUpperCase() || `R${entry.rosterId}`,
            source: snapshot.source,
          };
          const isViewer = viewerRosterId === entry.rosterId;
          return (
            <li className={isViewer ? 'viewer-pick' : ''} key={entry.slot}>
              <span className="pick-number">1.{String(entry.slot).padStart(2, '0')}</span>
              <ManagerAvatar franchise={franchise} showIdentity={showIdentity} size="small" />
              <strong>{entry.franchiseName}</strong>
              {showIdentity && <small>{entry.managerDisplayName}</small>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function LeagueWire({ story }: { story: HomeStory }) {
  return (
    <article className="dashboard-card league-wire" id="wire">
      <div className="card-heading">
        <h2><Zap size={21} /> League Wire</h2>
        <a href={routeHref('draft')}>View board <ArrowRight size={14} /></a>
      </div>
      <div className="wire-layout">
        <div className="wire-art" aria-hidden="true">
          <div className="draft-board-sheet">
            <span>01</span><span>02</span><span>03</span><span>04</span>
          </div>
          <span className="wire-badge"><Shield size={24} /></span>
        </div>
        <div className="wire-copy">
          <div className="story-meta">
            <span>{story.kicker}</span>
            <time dateTime={story.publishedAt}>
              {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
                new Date(story.publishedAt),
              )}
            </time>
          </div>
          <h3>{story.headline}</h3>
          <p>{story.summary}</p>
          <a href={routeHref('draft')}>Open the draft board <ArrowRight size={15} /></a>
        </div>
      </div>
    </article>
  );
}

function Deadlines({ deadlines }: { deadlines: HomeDeadline[] }) {
  return (
    <article className="dashboard-card deadlines-card" id="calendar">
      <div className="card-heading">
        <h2><CalendarDays size={20} /> Deadlines</h2>
        <a href={routeHref('league-office')}>View all <ArrowRight size={14} /></a>
      </div>
      <div className="deadline-list">
        {deadlines.map((deadline) => (
          <div className="deadline" key={deadline.id}>
            <time className="date-block">
              <small>{deadline.month}</small>
              <strong>{deadline.day}</strong>
            </time>
            <div>
              <strong>{deadline.name}</strong>
              <span>{deadline.detail}</span>
            </div>
            <em>{deadline.flag}</em>
          </div>
        ))}
      </div>
    </article>
  );
}

function RecordsVault({ record }: { record: HomeRecord }) {
  return (
    <article className="dashboard-card records-vault" id="records">
      <img src="/assets/records-vault-trophy.png" alt="The Harambe's Dozen championship cup" />
      <div className="vault-overlay">
        <div className="card-heading">
          <h2><Trophy size={20} /> Records Vault</h2>
        </div>
        <div className="vault-stat">
          <span>Reigning champion</span>
          <strong>{record.champion}</strong>
          <small>{record.season} · over {record.runnerUp}</small>
        </div>
        <a href={routeHref('league')}>Enter the vault <ArrowRight size={15} /></a>
      </div>
    </article>
  );
}

function MobileNav({ route }: { route: RouteId }) {
  const mobileItems = primaryNavigation.filter((item) =>
    ['home', 'league', 'franchises', 'trades', 'draft'].includes(item.route),
  );
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {mobileItems.map((item) => (
        <a
          aria-current={route === item.route ? 'page' : undefined}
          className={route === item.route ? 'active' : ''}
          href={routeHref(item.route)}
          key={item.route}
        >
          <span aria-hidden="true">{route === item.route ? '●' : '○'}</span>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function HomeDashboard({
  snapshot,
  session,
  now,
  onRequestSignIn,
}: {
  snapshot: HomeSnapshot;
  session: ViewerSession;
  now?: Date;
  onRequestSignIn: () => void;
}) {
  return (
    <>
      <Hero
        snapshot={snapshot}
        session={session}
        fixedNow={now}
        onRequestSignIn={onRequestSignIn}
      />
      <DraftOrder snapshot={snapshot} session={session} />
      <section className="dashboard-grid" aria-label="League dashboard">
        <LeagueWire story={snapshot.wire[0]} />
        <Deadlines deadlines={snapshot.deadlines} />
        <RecordsVault record={snapshot.records} />
      </section>
    </>
  );
}

function SignInDialog({
  completingLink,
  busy,
  error,
  onClose,
  onSubmit,
}: {
  completingLink: boolean;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit(email);
  };

  return (
    <div className="sign-in-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="sign-in-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-sign-in-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span>Invitation-only access</span>
        <h2 id="member-sign-in-heading">
          {completingLink ? 'Finish member sign in' : 'Enter the Clubhouse'}
        </h2>
        <p>
          {completingLink
            ? 'Confirm the email address that received this invitation link.'
            : 'We will send a one-time sign-in link to an approved league email address.'}
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="member-email">League email</label>
          <input
            id="member-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoFocus
          />
          {error && <strong role="alert">{error}</strong>}
          <button type="submit" disabled={busy}>
            {busy ? 'Working…' : completingLink ? 'Complete sign in' : 'Email my sign-in link'}
          </button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </section>
    </div>
  );
}

export function App({
  initialSession = { kind: 'public' },
  now,
  repository,
  memberSessionService,
  contractRepository,
}: AppProps) {
  const [snapshot, setSnapshot] = useState(currentHomeSnapshot);
  const [dataNotice, setDataNotice] = useState<string | null>(null);
  const [activityNotice, setActivityNotice] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<LeagueTransaction[]>([]);
  const [tradedPicks, setTradedPicks] = useState<DraftPickOwnership[]>([]);
  const [contracts, setContracts] = useState<ContractPlayer[]>([]);
  const [session, setSession] = useState<ViewerSession>(initialSession);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInBusy, setSignInBusy] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const { theme, toggle } = useTheme();
  const route = useRoute();

  useEffect(() => {
    if (!repository) return;
    let active = true;

    repository
      .loadHome()
      .then((liveSnapshot) => {
        if (active) {
          setSnapshot(liveSnapshot);
          const hasPartialDraftJoin = liveSnapshot.draft.order.some(
            (entry) => !liveSnapshot.franchises.some((team) => team.rosterId === entry.rosterId),
          );
          setDataNotice(
            hasPartialDraftJoin
              ? 'Sleeper returned a partial draft board; missing clubs are clearly labeled.'
              : null,
          );
        }
      })
      .catch(() => {
        if (active) setDataNotice('Showing the last verified league snapshot.');
      });

    if (repository.loadTransactions) {
      repository
        .loadTransactions()
        .then((items) => {
          if (active) setTransactions(items);
        })
        .catch(() => {
          if (active) {
            setActivityNotice('Live transaction history is unavailable; verify moves in Sleeper.');
          }
        });
    }

    if (repository.loadTradedPicks) {
      repository
        .loadTradedPicks()
        .then((items) => {
          if (active) setTradedPicks(items);
        })
        .catch(() => {
          if (active) {
            setActivityNotice('Live pick ownership is unavailable; verify traded picks in Sleeper.');
          }
        });
    }

    return () => {
      active = false;
    };
  }, [repository]);

  useEffect(() => {
    if (!memberSessionService) return;
    return memberSessionService.subscribe(setSession);
  }, [memberSessionService]);

  useEffect(() => {
    if (session.kind !== 'member') {
      setContracts([]);
      return;
    }
    if (!contractRepository) {
      setActivityNotice('Contract access is awaiting the private league data connection.');
      return;
    }
    let active = true;
    contractRepository
      .loadContracts()
      .then((items) => {
        if (active) setContracts(items);
      })
      .catch(() => {
        if (active) setActivityNotice('Private contract data is unavailable right now.');
      });
    return () => {
      active = false;
    };
  }, [contractRepository, session]);

  useEffect(() => {
    if (memberSessionService?.isCompletingEmailLink()) setSignInOpen(true);
  }, [memberSessionService]);

  const handleSignIn = () => {
    if (session.kind === 'member') {
      if (memberSessionService) void memberSessionService.signOut();
      else setDataNotice('This local member preview is not an authenticated production session.');
      return;
    }
    if (!memberSessionService) {
      setDataNotice(null);
      return;
    }
    setSignInError(null);
    setSignInOpen(true);
  };

  const submitSignIn = async (email: string) => {
    if (!memberSessionService) return;
    setSignInBusy(true);
    setSignInError(null);
    try {
      const result = await memberSessionService.submitEmail(email);
      setSignInOpen(false);
      setDataNotice(
        result === 'signed-in'
          ? 'Member identity confirmed.'
          : 'Sign-in link sent. Check your email to continue.',
      );
    } catch (error) {
      setSignInError(error instanceof Error ? error.message : 'Sign-in could not be completed.');
    } finally {
      setSignInBusy(false);
    }
  };

  useEffect(() => {
    if (import.meta.env.MODE !== 'test') window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route]);

  let page: React.ReactNode;
  switch (route) {
    case 'league':
      page = <LeaguePage snapshot={snapshot} session={session} />;
      break;
    case 'franchises':
      page = <FranchisesPage snapshot={snapshot} session={session} contracts={contracts} />;
      break;
    case 'draft':
      page = <DraftPage snapshot={snapshot} session={session} />;
      break;
    case 'trades':
      page = (
        <TradesPage
          snapshot={snapshot}
          transactions={transactions}
          tradedPicks={tradedPicks}
        />
      );
      break;
    case 'league-office':
      page = <LeagueOfficePage snapshot={snapshot} />;
      break;
    case 'clubhouse':
      page = <ClubhousePage session={session} onRequestSignIn={handleSignIn} />;
      break;
    default:
      page = (
        <HomeDashboard
          snapshot={snapshot}
          session={session}
          now={now}
          onRequestSignIn={handleSignIn}
        />
      );
      break;
  }

  return (
    <div className="app-shell">
      <Header
        session={session}
        theme={theme}
        route={route}
        onToggleTheme={toggle}
        onRequestSignIn={handleSignIn}
      />
      <MobileNav route={route} />
      {(dataNotice || activityNotice) && (
        <div className="data-notice" role="status">{dataNotice || activityNotice}</div>
      )}
      <main>{page}</main>
      {signInOpen && memberSessionService && (
        <SignInDialog
          completingLink={memberSessionService.isCompletingEmailLink()}
          busy={signInBusy}
          error={signInError}
          onClose={() => setSignInOpen(false)}
          onSubmit={submitSignIn}
        />
      )}
      <footer>
        <div><LeagueCrest compact /> <span>Harambe's Dozen</span></div>
        <span>Established 2016 · 12 teams · 1 legacy</span>
        <span>Built for the group chat.</span>
      </footer>
    </div>
  );
}
