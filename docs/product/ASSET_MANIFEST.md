# Harambe's Dozen V2 — Asset Manifest

**Manifest ID:** `HD12-V2-ASSETS-001`  
**Rule:** A route cannot enter blueprint review until every asset marked essential for that
route is ready or has an approved designed fallback.

## Source and fallback policy

- Player portraits use `https://sleepercdn.com/content/nfl/players/{playerId}.jpg` with a
  designed position-and-initials treatment when the image is missing, malformed, or delayed.
- Manager portraits use the twelve Sleeper avatar IDs already joined to league members.
  Member-only views may show them; public markup uses franchise emblems and contains no avatar
  URL. Existing photos are the source for the later approved illustrated/headshot treatment.
- NFL club identity may use official team abbreviation/color metadata and licensed/allowed
  remote imagery only after source review. The safe baseline is typographic team notation and
  a designed color field, never a broken logo.
- Editorial player images must have a known source, a crop contract, and a missing-image state.
- Generated derivatives are versioned; original supplied references remain immutable.

## Core assets

| ID | Asset | Status | Essential for | Fallback / next action |
| --- | --- | --- | --- | --- |
| `ASSET-HARAMBE-DRAFT-001` | `v2/public/assets/harambe-letterman.png` | Ready; approval inherited from Home direction | G1, Draft Home | Transparent letterman treatment already implemented. |
| `ASSET-HARAMBE-SUNDAY-001` | Live Sunday broadcast treatment | Required before G2 Live Sunday capture | Home | Route remains blocked; use no generic football hero. |
| `ASSET-HARAMBE-PLAYOFF-001` | Playoff/trophy-chase treatment | Required before G2 Playoffs capture | Home | Route remains blocked. |
| `ASSET-HARAMBE-OFFICE-001` | Offseason/front-office treatment | Required before G2 Offseason capture | Home | Route remains blocked. |
| `ASSET-HARAMBE-CONTRACT-001` | Contract Office spot illustration | Required before Office blueprint | League Office | Office blueprint remains blocked. |
| `ASSET-HARAMBE-TRADE-001` | Trade Wire spot illustration | Required before Trades blueprint | Trades | Trades blueprint remains blocked. |
| `ASSET-HARAMBE-VAULT-001` | Records Vault setting | Required before Records blueprint | Records | May compose around the real trophy; no generic Super Bowl cup. |
| `ASSET-HARAMBE-CLUB-001` | Clubhouse setting | Required before Clubhouse blueprint | Clubhouse | Clubhouse blueprint remains blocked. |
| `ASSET-HARAMBE-SACKO-001` | Sacko/league-lore treatment | Required before editorial tone/case-file review | Records, Wire | May be editorial spot art, never a cinematic villain scene. |
| `BASE-TROPHY-PHOTO-001` | Aaron's real trophy photograph | Registered object authority | All trophy uses | Original conversation attachment must be reattached before pixel-level object audit if the cached source is unavailable. |
| `ASSET-TROPHY-STUDIO-001` | `v2/public/assets/real-trophy-studio-v1.png` | Ready for G1 review | G1, Home, Records, awards | Derived studio presentation; do not replace the source record. |
| `ASSET-WIRE-DRAFT-001` | `v2/public/assets/league-wire-draft.webp` | Provisional | G1 story specimen | Review for team/trademark source before production publishing. |

## Franchise identity system

All twelve emblems must share a common construction system while remaining recognizable at
32px, 64px, and feature size. Required parts: shield/roundel silhouette, club monogram or
symbol, one franchise-specific accent, `12` league tie-back, light/dark variants, and a plain
monogram fallback. Until this set is approved, the current monograms may appear only in
fixtures and non-production review states.

| Club | Source identity | Emblem state |
| --- | --- | --- |
| Commissioner of Power | `CP`, antique gold | Required before Franchises blueprint |
| A.Woods | `AW`, signal red | G1 specimen candidate; full emblem required before Franchises blueprint |
| Proud Boys | `PB`, steel blue | Required before Franchises blueprint |
| Slippery007 | `S7`, teal | Required before Franchises blueprint |
| Marginally Alpha | `MA`, orange | Required before Franchises blueprint |
| TME | `TME`, blue | Required before Franchises blueprint |
| Hillschmeier Farms | `HF`, field green | Required before Franchises blueprint |
| Epstein's Client List | `ECL`, violet | Required before Franchises blueprint |
| Amon-Ra Doggin | `ARD`, copper | Required before Franchises blueprint |
| Brocked and Loaded | `BL`, royal blue | Required before Franchises blueprint |
| Coach | `C`, slate | Required before Franchises blueprint |
| TylerPrice12 | `TP`, brown | Required before Franchises blueprint |

## G1 specimen asset checklist

- [x] League crest and masthead.
- [x] Real manager portrait source with privacy-safe fallback.
- [x] Real Sleeper player image source plus missing-image treatment.
- [x] Draft letterman Harambe art.
- [x] Real-trophy studio treatment candidate.
- [x] Editorial Wire image candidate.
- [ ] Aaron approval of all five treatments together in light/dark desktop/mobile captures.

An unchecked later-route asset does not block G1. It blocks only the route or seasonal state
that depends on it, and must be resolved before that blueprint begins.

