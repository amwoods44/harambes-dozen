# Testing Patterns

**Analysis Date:** 2026-03-31

## Test Framework

**Status: No testing framework installed**

- No Jest, Vitest, Mocha, or Jasmine configuration found
- No test runner configured
- No assertion libraries (Chai, Should, etc.)
- No `test` or `test:*` npm scripts

**Why:**
This is a vanilla JavaScript single-file app deployed as static HTML. Zero build tools means zero test infrastructure. Testing would require:
1. Adding npm/Node to the project (violates project philosophy)
2. Setting up a bundler and test runner
3. Refactoring monolithic code into importable modules

Current project constraints explicitly reject frameworks and build tools.

## Manual Verification Approach

**Current practice:**
- Browser-based visual verification only
- Manual API integration testing against Sleeper endpoints
- localStorage state inspection via DevTools
- Network tab analysis for cache behavior

**How the project validates:**

1. **Local environment testing:**
```
1. Clone repo
2. Open index.html in browser
3. Manual navigation through all 18 tabs
4. Check console for errors/warnings
```

2. **PWA testing:**
```
1. Install app to home screen
2. Go offline, verify cached data loads
3. Go online, verify data refreshes
4. Check DevTools Application tab for cache state
```

3. **Data integrity:**
```
1. Compare rendered standings against Sleeper API directly
2. Spot-check trade values against KTC market
3. Verify player ages, positions from Sleeper API
```

## Test Structure (Not Applicable)

**File organization for tests:** N/A — no test files exist

**If tests were added, likely structure would be:**
```
index.html               (all code)
├── Data transforms: buildCurrentSeasonData()
├── Utilities: cache(), fetchJSON()
├── Render: renderPower(), renderTrades(), etc.
└── Helpers: icon(), dtierTag(), cpill()

// Unit test targets (highest value):
test/
├── buildCurrentSeasonData.test.js
├── cache.test.js
├── helpers.test.js
└── parseContractCSV.test.js

// Integration test targets:
test/
├── api-integration.test.js  (Sleeper API responses)
└── data-flow.test.js        (init → render pipeline)

// Visual regression (if tools added):
test/visual/
├── screenshots/
└── diff-reports/
```

But this would require refactoring the single-file monolith.

## Error Coverage (What's Actually Tested)

**Implicit testing via production execution:**

1. **Data transformation:**
   - `buildCurrentSeasonData()` called on every init — failures caught by try-catch around init
   - Contract CSV parsing validated by `parseContractCSV()` — empty contracts silently handled
   - API responses validated inline: `if (!league) throw new Error()`

2. **Cache behavior:**
   - localStorage quota exceeded → catches, warns, continues without cache
   - Stale data detection → shows "Data is stale" banner, still renders
   - Cache key misses → returns null, render handles gracefully

3. **Render failures:**
   - `safeRender()` wraps all tab render functions
   - If render throws, error state displays to user
   - No silent failures — exceptions logged to console

4. **Image loading:**
   - `onerror="this.style.display='none'"` on all `<img>` tags
   - Missing player thumbnails → silently hidden
   - Missing team logos → fallback text shown

5. **API failures:**
   - `.catch(() => [])` on all fetch operations
   - Missing data → renders with empty states or fallback messages
   - Offline mode → shows banner, uses cached data

## Integration Testing (Manual)

**Critical user flows to verify before shipping:**

### Flow 1: Initial Load
```
✓ Page loads within 3s (loading screen visible)
✓ League discovered via Sleeper API
✓ Current season rosters fetched
✓ Player DB populated (~20K players)
✓ All 18 tabs render without errors (check console)
✓ Power Rankings tab shows all 12 teams
✓ Rosters tab shows all players per team
✓ Trophies tab shows champions (if available)
```

### Flow 2: Historical Data Merge
```
✓ Background fetch of 2024, 2023 seasons (if available)
✓ Franchise stats populate
✓ All-time standings compute
✓ Trade history builds
✓ Year filters in Trades tab work (2025, 2024, 2023 buttons)
✓ Console shows no errors during merge
✓ Trophy banners render (one per season won)
```

### Flow 3: Tab Navigation
```
✓ Clicking nav tabs switches panel visibility
✓ Tab loading skeleton shows for 0.5-2s
✓ All 18 tabs load: Power, Rosters, Trophies, Trades, Draft, Age, Scoring, Awards, Matchups, Luck, Activity, Analytics, Moves, Rivals, Contracts, Constitution, War Room, Pulse, Chronicle
✓ No console errors on tab switch
✓ Scrolling to top on tab open (smooth behavior)
```

### Flow 4: Offline Behavior
```
✓ Open DevTools Network → Offline mode
✓ Refresh page, app loads from service worker cache
✓ "Data is stale" banner appears
✓ Rendering works with last known `D` object
✓ Button clicks still work (tab switching, filters)
✓ Go online, banner dismisses, data refreshes
```

### Flow 5: Data Stale Check
```
✓ Data older than 1 hour → "stale" banner shows
✓ Banner shows dismiss button
✓ Clicking refresh button re-fetches
✓ On successful fetch, banner auto-dismisses
```

### Flow 6: Filter Interactions
```
✓ Trades tab: Year filter buttons work (ALL, 2025, 2024, 2023)
✓ Clicking year filters trade list correctly
✓ Draft tab: Year select updates "Memory Lane" section
✓ Age Map: Collapsible sections open/close
```

### Flow 7: Share Cards (html2canvas)
```
✓ Click "Share" button on power card
✓ Modal opens with preview
✓ "Save Image" button generates PNG via html2canvas CDN
✓ PNG downloads with correct filename
✓ Modal closes on success/error
```

### Flow 8: Player Profile Popup
```
✓ Click player name or image anywhere in app
✓ Player profile modal opens
✓ Shows player headshot, stats, team, position, age
✓ Shows contract info (if exists)
✓ Shows KTC value (if exists)
✓ Close button hides modal
✓ Click outside modal closes it
```

## Known Test Gaps

**Untested functionality (high risk if changed):**

1. **Contract parsing:**
   - `parseContractCSV()` called once on init
   - Silently fails if CSV malformed
   - No validation of contract data shape
   - File: `index.html` lines 1616-1705

2. **Trade grade calculations:**
   - `ktcVal()` function computes trade value
   - Multiplier logic for contract years (0.5x, 0.6x, 0.85x, 1x) not validated
   - Grade boundaries hardcoded: 3000, 1500, 500, -500, -1500
   - File: `index.html` lines 3260-3278

3. **Draft pick history:**
   - `draft_picks[season]` built from historical data
   - No validation that picks belong to correct season
   - Tooltip positioning logic complex (lines 4058-4068)
   - File: `index.html` lines 4053-4068

4. **Canvas rendering (Dynasty Scatter):**
   - Custom canvas API calls for scatter plot
   - No browser compatibility testing
   - Axis labels hand-calculated from data
   - File: `index.html` lines 4108-4162

5. **H2H Record calculation:**
   - `h2h[key]` tracks head-to-head matchups across seasons
   - Stores both directions: `a-b` and `b-a`
   - No validation that records balance out
   - File: `index.html` lines 2110-2125

6. **Luck calculation:**
   - `expected_wins` computed per-team per-week
   - No test data to validate formula correctness
   - File: `index.html` lines 2173-2200+ (mergeHistoricalData)

7. **Input sanitization:**
   - Player names from Sleeper injected directly into HTML
   - Team names from users not escaped
   - XSS surface if API returns malicious data
   - Affects all render functions (3000-4300)

## Performance Considerations

**What should be tested before shipping:**

1. **Bundle size:**
   - `index.html` alone is ~4,500 lines
   - ~1,090 lines of CSS
   - ~3,400 lines of JavaScript
   - Minified in production (no build step, manually minified)

2. **Load time:**
   - Initial render: should see UI in <1s
   - Data fetch (Sleeper API): 2-4s for all endpoints
   - Historical data (background): 3-6s, non-blocking

3. **Cache effectiveness:**
   - Player DB: 24hr cache → check if valid on reload
   - Current season: 30min cache → should refresh hourly
   - Historical: 7 day cache → should rarely re-fetch

4. **Render performance:**
   - 18 tabs × large HTML strings → large innerHTML assignments
   - Power Rankings: 12 team cards × many stats
   - Trades: 20+ trade cards × hero images + details
   - Draft: 3+ rounds × 12 picks/round
   - Monitor for repaints/reflows on tab switch

5. **Memory usage:**
   - `D` object holds full player DB + 3 seasons of data
   - No garbage collection between renders
   - Watch for memory leaks on extended use

## Browser Compatibility

**Tested browsers (inferred from code):**
- Chrome/Edge (primary)
- Safari (iOS PWA support via apple-mobile-web-app tags)
- Firefox (secondary)

**Modern features used (all require modern browser):**
- CSS Grid & Flexbox
- CSS Custom Properties (--variables)
- Fetch API + Promises
- Service Workers (PWA)
- LocalStorage
- Canvas (for scatter plot)
- IntersectionObserver (lazy reveal draft rounds)
- Arrow functions (`=>`)

**No IE11 support intended.**

## Data Mocking (If Tests Were Added)

**Sample mock data structure:**

```javascript
// Mock Sleeper API responses:
const mockLeague = {
  league_id: 12345,
  name: 'Test League',
  status: 'in_season',
  season: 2025,
  avatar: null
};

const mockRosters = [
  {
    roster_id: 1,
    owner_id: 'user1',
    settings: { wins: 8, losses: 4, fpts: 1234.56, fpts_decimal: 50 }
  }
];

const mockUsers = [
  {
    user_id: 'user1',
    display_name: 'Player One',
    metadata: { team_name: 'Team Name', avatar: 'avatar.jpg' }
  }
];

const mockPlayerDB = {
  '123': { fn: 'Patrick', ln: 'Mahomes', pos: 'QB', tm: 'KC', age: 28 },
  '456': { fn: 'Travis', ln: 'Kelce', pos: 'TE', tm: 'KC', age: 35 }
};

const mockContracts = {
  'Patrick Mahomes': { yrs: 4, ktc: 8500, contracted: true, tag: false },
  'Travis Kelce': { yrs: 0, ktc: 1200, contracted: false, tag: false }
};
```

**Where tests would inject mocks:**
- `fetchJSON()` would be stubbed to return mocks
- Cache would be cleared between tests
- `D` would be reset after each test
- SVG/Canvas rendering would be skipped

## Coverage Baseline (If Tools Added)

**Minimum viable coverage targets:**

| Category | Lines | Branches | Functions | Target |
|----------|-------|----------|-----------|--------|
| Data transforms | 500 | 200 | 8 | 80%+ |
| Render functions | 2500 | 50 | 18 | 40% (visual, hard to test) |
| Utilities | 300 | 100 | 15 | 95%+ |
| Helpers | 200 | 50 | 30 | 90%+ |
| **TOTAL** | **3500** | **400** | **71** | **60%+ overall** |

**High-value test targets:**
1. `buildCurrentSeasonData()` — data integrity
2. `cache.set()` / `cache.get()` — cache correctness
3. `parseContractCSV()` — contract parsing
4. Trade grade functions — KTC calculations
5. Luck calculation — expected vs actual wins

**Low-value test targets:**
- Render functions (HTML strings) — too coupled to styling
- Event handlers — better tested manually
- CSS animations — require visual regression

---

*Testing analysis: 2026-03-31*
