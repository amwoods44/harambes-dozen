import { useId } from 'react';

interface LeagueCrestProps {
  compact?: boolean;
}

export function LeagueCrest({ compact = false }: LeagueCrestProps) {
  const portraitClipId = `crest-portrait-${useId().replaceAll(':', '')}`;
  return (
    <svg
      className="league-crest"
      viewBox="0 0 132 154"
      role="img"
      aria-label="Harambe's Dozen league crest"
      data-compact={compact || undefined}
    >
      <defs>
        <clipPath id={portraitClipId}>
          <path d="M29 25 66 10l37 15v43c0 20-14 32-37 42-23-10-37-22-37-42Z" />
        </clipPath>
      </defs>
      <path d="M66 3 122 28v59c0 31-22 50-56 64C32 137 10 118 10 87V28Z" fill="#071d2c" stroke="#d2a14a" strokeWidth="5" />
      <path d="M66 11 114 32v53c0 26-18 43-48 56-30-13-48-30-48-56V32Z" fill="none" stroke="#f4efe5" strokeWidth="2" />
      <image
        href="/assets/harambe-letterman.png"
        x="18"
        y="3"
        width="100"
        height="112"
        preserveAspectRatio="xMidYMin slice"
        clipPath={`url(#${portraitClipId})`}
      />
      <path d="M29 25 66 10l37 15" fill="none" stroke="#d2a14a" strokeWidth="2" />
      <path d="m34 30 4-7 4 7 8 1-6 6 2 8-8-4-7 4 1-8-6-6Z" fill="#f4efe5" transform="scale(.32) translate(88 22)" />
      <path d="m34 30 4-7 4 7 8 1-6 6 2 8-8-4-7 4 1-8-6-6Z" fill="#f4efe5" transform="scale(.32) translate(264 22)" />
      {!compact && (
        <>
          <path d="M17 78h98v43H17Z" fill="#f4efe5" stroke="#d2a14a" strokeWidth="2.5" />
          <path d="M22 83h88v33H22Z" fill="none" stroke="#071d2c" strokeWidth="1" />
          <text x="66" y="96" textAnchor="middle" className="crest-word crest-word-small">HARAMBE'S</text>
          <text x="66" y="114" textAnchor="middle" className="crest-word">DOZEN</text>
        </>
      )}
      <path d="M53 124h26v20H53Z" fill="#b51624" stroke="#f4efe5" strokeWidth="2" />
      <text x="66" y="139" textAnchor="middle" className="crest-number">12</text>
    </svg>
  );
}
