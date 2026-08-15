# Setup — deploy Dynasty HQ for your league

Dynasty HQ is a single static file (`index.html`) that reads **live** data from the
Sleeper API, FantasyCalc, and (optionally) a published Google Sheet. No build step,
no server, no database. To run it for your own league you edit one config block and
host the folder anywhere static (GitHub Pages, Netlify, Cloudflare Pages, …).

## 1. The three required edits

Open `index.html`, find the `CFG` object near the top of the `<script>` block, and set:

| Field | What it is | How to find it |
|---|---|---|
| `userId` | Any Sleeper **user id** that belongs to your league | `https://api.sleeper.app/v1/user/<your_username>` → copy the `user_id` |
| `leagueName` | Your **exact** Sleeper league name | As it appears in the Sleeper app. The app auto-discovers the league and walks its full previous-season history. |
| `sheetCsvUrl` | Published CSV of your contracts sheet, or `''` | In Google Sheets: File → Share → Publish to web → CSV. Leave `''` to run without contracts/exemptions. |

That's enough to boot. Everything else has sensible defaults.

## 2. League identity (cosmetic)

Still in `CFG`, these drive the hero masthead and a few headers:

- `foundedYear` — your first-ever season (pre-Sleeper is fine)
- `leagueSize` — team count (also sizes the FantasyCalc dynasty values)
- `format` — e.g. `'PPR Dynasty'`, shown in the hero eyebrow
- `heroTags` — the hero feature chips (a leading number is bolded, e.g. `'15 Keepers'`)
- `preSleeperPlatform` — the platform you started on before Sleeper (`'CBS'`, `'ESPN'`, …),
  or `''` if your league began on Sleeper. When set, the Chronicle shows a founding/migration
  era; when empty, those entries are hidden.

The hero **headline** ("HARAMBE'S DOZEN") is static HTML — edit `<h1 class="hero-h">` once.

## 3. Owner portraits

Each franchise shows a generated **team crest** by default (team colors + monogram), so the
app looks finished out of the box. To use a real photo for an owner:

1. Drop a square-ish PNG at `assets/avatars/<Name>.png`.
2. Add a line to `CFG.avatarOverrides`, keyed by **roster_id** (a number — stable forever) or
   the owner's **Sleeper display name in lowercase**:
   ```js
   avatarOverrides:{ 10:'assets/avatars/Kevin.png', 'chuck':'assets/avatars/Chuck.png' }
   ```

Photos override the crest everywhere avatars appear (cast rail, Power, Rosters, GM, …).

## 4. Per-fork files to rename

These hold the original league's identity; edit them so shares/installs read correctly:

- `index.html` `<title>` + the `og:`/`twitter:` meta tags + `og:url` (your deployed URL)
- `manifest.json` — `name` / `short_name`
- `harambe-logo.png` — replace with your logo (also the favicon, PWA icon, touch icon)
- The Constitution article text in `renderConstitution()` and the Chronicle founding copy are
  league-specific prose — edit to taste (the app derives team count / season / status from Sleeper).

## 5. Annual maintenance

Once per offseason, update `SEASON_DATES` (just below `CFG`): the keeper/exemption deadline and
the NFL kickoff datetime. Everything else (current season, standings, history) derives from Sleeper.

## 6. Deploy

Host the folder as static files. For GitHub Pages: push to a repo, enable Pages on the branch root.
If you change cached assets, bump `CACHE_NAME` in `sw.js` so installed PWAs pick up the new version.

## Degraded data

If FantasyCalc or the contracts sheet is unreachable and nothing is cached, the app still loads and
shows a dismissable banner ("Live values/contracts unavailable — Retry") rather than silently blanking.
