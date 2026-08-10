# Harambe's Dozen V2 Implementation

**Date:** 2026-08-10  
**Branch:** `codex/harambes-v2`  
**Private beta target:** 2026-08-21

## Objective

Build a modular React/TypeScript/Firebase PWA beside the existing site. Preserve the
approved sports-editorial Home composition while making Sleeper the live execution and
ownership source, commissioner data the rules/contracts authority, and the 2022
constitution legacy context only.

## Product and visual contract

- Stable navigation: Home, League, Franchises, Trades, Draft, League Office, Clubhouse.
- Equal Day/Night themes; responsive desktop, tablet, and mobile layouts.
- Public visitors see club identity and league context only. Manager identity, rosters,
  contracts, private tools, and Clubhouse content require a member session.
- Navy, warm cream, red, and antique gold; Harambe illustration is playful league
  identity, not a cinematic/video-game treatment.
- Sleeper remains the official surface for draft selections and transactions.
- Trophy imagery uses the real large gold two-handle league cup on its black base.

## Data authority

1. Direct manager corrections.
2. Live Sleeper ownership/settings/draft/transactions/picks.
3. Contracts Sheet years/tags/exemption labels.
4. Commissioner-verified records and historical corrections.
5. 2022 constitution as legacy context only.

## Implemented

- Seven routed, responsive areas in one shared Day/Night shell.
- Live Sleeper Home, rosters, draft, full offseason transaction range, and traded picks.
- Full contract ledger parsed without mutating source CSV; direct 2026 corrections layered
  above the Sheet and joined to live ownership by Sleeper player ID.
- Verified 2021-2025 championship history.
- Invitation-only Firebase email-link session service, member-to-Sleeper mapping contract,
  environment template, and deny-by-default Firestore rules.
- Public/member rendering tests, source-stamped fallbacks, PWA build, route screenshot QA.

## Private-beta activation remaining

- Supply Firebase public web configuration and 12 approved member mappings.
- Deploy Firestore rules and run email-link sign-in rehearsal.
- Add server-side Sleeper fan-out/commissioner write tools before public launch if strict
  network-level privacy and live admin editing are required.

## Definition of done

- Every rendered fact is live, source-stamped, or explicitly labeled cached/unknown.
- Public DOM does not render manager identity, private roster contracts, or Clubhouse data.
- Draft/pick semantics and offseason transaction coverage are regression-tested.
- All seven routes pass typecheck, tests, production build, and desktop/mobile overflow QA.
- Existing public production remains untouched until a separate launch review.
