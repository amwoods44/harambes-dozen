import { ArrowRight, CheckCircle2, LockKeyhole, MessageSquareOff, ShieldCheck } from 'lucide-react';

import type { ViewerSession } from '../../App';
import './ClubhousePage.css';

export interface ClubhousePageProps {
  session: ViewerSession;
  onRequestSignIn?: () => void;
}

function PublicClubhouseGate({ onRequestSignIn }: Pick<ClubhousePageProps, 'onRequestSignIn'>) {
  return (
    <div className="clubhouse-page clubhouse-public-gate">
      <section className="clubhouse-gate-card" aria-labelledby="clubhouse-gate-heading">
        <div className="clubhouse-lock" aria-hidden="true">
          <LockKeyhole size={39} />
        </div>
        <span className="clubhouse-kicker"><ShieldCheck size={16} /> Private league space</span>
        <h1 id="clubhouse-gate-heading">Sign in to enter the Clubhouse</h1>
        <p>
          This public view does not load member names, conversations, or notifications. League
          communications stay behind the member session boundary.
        </p>
        <button type="button" onClick={onRequestSignIn}>
          Member sign in <ArrowRight size={18} />
        </button>
        <small>Invitation-only access · Harambe&apos;s Dozen members</small>
      </section>
      <aside className="clubhouse-privacy-note" aria-label="Public privacy protections">
        <strong>Public-session protections</strong>
        <ul>
          <li><CheckCircle2 size={16} /> No conversation request is made</li>
          <li><CheckCircle2 size={16} /> No member directory is rendered</li>
          <li><CheckCircle2 size={16} /> No private notification count is exposed</li>
        </ul>
      </aside>
    </div>
  );
}

function MemberClubhouse() {
  return (
    <div className="clubhouse-page clubhouse-member-page">
      <header className="clubhouse-member-hero">
        <div>
          <span className="clubhouse-kicker"><ShieldCheck size={16} /> Member access confirmed</span>
          <h1>Clubhouse</h1>
          <p>The private league room, with a hard line between authenticated and public views.</p>
        </div>
        <span className="clubhouse-access-badge"><LockKeyhole size={17} /> Private</span>
      </header>

      <section className="clubhouse-empty-room" aria-label="Member clubhouse">
        <div className="clubhouse-empty-icon" aria-hidden="true"><MessageSquareOff size={34} /></div>
        <span>Authenticated empty state</span>
        <h2>Conversation feed is not connected yet</h2>
        <p>
          No placeholder messages are shown. Real clubhouse content will appear only after its
          authenticated data source and access rules are connected.
        </p>
        <dl>
          <div><dt>Session</dt><dd>Member</dd></div>
          <div><dt>Feed</dt><dd>Not connected</dd></div>
          <div><dt>Public exposure</dt><dd>Blocked</dd></div>
        </dl>
      </section>
    </div>
  );
}

export function ClubhousePage({ session, onRequestSignIn }: ClubhousePageProps) {
  return session.kind === 'member' ? (
    <MemberClubhouse />
  ) : (
    <PublicClubhouseGate onRequestSignIn={onRequestSignIn} />
  );
}
