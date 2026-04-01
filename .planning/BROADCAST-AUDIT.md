# Broadcast Quality Audit — Every Tab

**Standard:** Would this look right on a live ESPN broadcast or Apple keynote? If not, what would it take?

**Date:** 2026-04-01

---

## Hero Section
**Verdict:** REDESIGN

What's wrong:
- Too many elements stacked vertically between the title and the nav (LEAGUE LORE card, cast strip, stat strip). Feels like a pile, not a composition.
- The LEAGUE LORE card is a thin pill floating in space — not commanding, not impactful
- Cast strip (12 team avatars) has no visual context — just circles with initials. On a broadcast, these would have team names visible, maybe records, and clicking one would feel like selecting a channel
- Stat strip numbers are big but the layout is a flat horizontal row with no card elevation or visual separation between items
- The countdown clock is fine functionally but doesn't feel dramatic — it should be the kind of thing that makes you feel the anticipation

What broadcast quality looks like:
- Hero is ONE moment. The title, one stat, and ONE call-to-action. Not five things competing.
- Think ESPN's countdown to kickoff graphic: dark background, huge number, minimal text, dramatic lighting
- The cast strip could be an interactive element below the nav, not crammed between hero content and stat strip

---

## Power Rankings
**Verdict:** REDESIGN

What's wrong:
- Narrative insight block at the top (4 bullet points) reads like developer output, not broadcast commentary
- Weight breakdown pills (40% RECORD, 30% POINTS, 20% YOUTH, 10% DRAFT CAPITAL) are a formula explanation, not a design element
- Tier label (REBUILD MODE) is floating with a thin left border — not a broadcast chyron
- Ranking cards are too tall with too much empty space. The power score circle on the right is tiny relative to the card height
- Power Race horizontal bar chart is a good concept but plain — bars with numbers, no visual flair
- Compare tool at the bottom is a dropdown + table. Functional but looks like a form, not a broadcast comparison graphic

What broadcast quality looks like:
- Rankings should feel like a top-10 countdown graphic. Big rank number, team identity, ONE key stat, the power score as the hero element
- The comparison tool should look like a side-by-side ESPN matchup preview — two teams facing off with stats between them
- Lose the formula explanation. Nobody needs to see "40% RECORD" — just show the ranking and let the number speak

---

## Rosters
**Verdict:** FULL REDESIGN (already logged)

What's wrong:
- 12 collapsible accordion cards showing all teams at once
- Badge pills (WHEELER-DEALER, DRAFT HOARDER) are prominent but secondary information
- Expanded view crams headshot strip + position groups + player rows into a narrow column
- No lineup slot structure (QB/RB/WR/TE/FLEX/DEF)

What broadcast quality looks like:
- Team selector at top, one team at a time, full width
- Lineup card layout with starter slots and bench section
- Each player row: headshot, name, team, position, age, contract, value
- Team summary header with record, value, age, contract health

---

## Matchups
**Verdict:** REDESIGN

What's wrong:
- Week selector is 17 small numbered buttons in a row — dense and hard to navigate
- Game of the Week card is actually decent — the large scores with team avatars work
- But the remaining matchup cards below are a different (smaller) format that doesn't match GOTW
- Standings sidebar is crammed into a narrow right column
- HIGH/AVG/LOW stat strip shows zeros (offseason) with no context

What broadcast quality looks like:
- Every matchup should look like the Game of the Week card — full width, dramatic scores, team colors
- Week selector should be a clean dropdown or large tabs, not 17 tiny buttons
- Standings should be its own section below, not a sidebar
- This should feel like flipping through ESPN's weekly scoreboard

---

## Draft
**Verdict:** CLOSEST TO BROADCAST QUALITY — minor polish only

What's right:
- Draft board cards are genuinely good — position badges, headshots, college logos, team affiliations
- Year selector tabs work
- Round labels on the left with hit rate are informative

What needs refinement:
- Cards are cut off on the right edge with no scroll indicator
- Hit rate on round labels could be color-coded (green/red) instead of just text
- The horizontal scroll has no visual affordance telling you there's more

---

## Trades
**Verdict:** FULL REDESIGN (already logged)

What's wrong:
- Horizontal scroll strip of trade cards is chaotic — multiple red TRADE headers overlapping
- Collapsible sections (Trade Record, Rivalries, Capital, Trade Partners) all on one page with no visual hierarchy
- Trade cards are information-dense but not organized — headshots, grades, picks, team names all competing

What broadcast quality looks like:
- One trade at a time, full-width broadcast card
- ESPN trade deadline coverage style: Side A gave / Side B gave, grade in the center
- Trade Record, Capital, Partners as sub-tabs or separate views, not collapsed sections

---

## Scoring
**Verdict:** REDESIGN

What's wrong:
- Heat map grid is a solid concept but the cells are tiny colored squares with tiny numbers
- Team names on the left are truncated
- The color coding works but there's no breathing room between rows
- Rankings and Settings sections below are plain lists

What broadcast quality looks like:
- Heat map cells should be larger, more readable
- Team names should be full with team avatars
- Could add a "Season High" callout for the top score in each row
- Settings section should be a clean reference card, not a raw list

---

## Age Map
**Verdict:** SOLID — needs polish, not redesign

What's right:
- Stacked bar chart is clean and readable
- Green/yellow/red color coding is intuitive
- Dynasty Scatter and Windows sections add real depth

What needs refinement:
- Average age number on the right is small
- Team names could have avatars
- The scatter plot canvas might need a legend
- Windows section labels could be more descriptive

---

## Awards
**Verdict:** SOLID — needs polish, not redesign

What's right:
- Award cards with gradient top borders and icons are one of the best visual elements
- "No voting, no bias — the numbers decide everything" tagline is excellent
- Hall of Fame with gold badges works

What needs refinement:
- Cards could have more visual depth (subtle shadows, layering)
- The stat line under each winner's name is small
- Hall of Fame list could use the same card treatment as the award cards

---

## Analytics
**Verdict:** REDESIGN

What's wrong:
- H2H Matrix is a wall of tiny colored cells with abbreviated team names
- Five sections (H2H, All-Play, Consistency, Pythagorean, SOS) stacked vertically with no visual breaks
- All-Play and Pythagorean are tables that look like spreadsheet exports
- Consistency scatter plot is a canvas with no labels visible at first glance

What broadcast quality looks like:
- H2H Matrix needs larger cells, full team avatars, clearer color coding
- Each analytics section should feel like its own broadcast segment with a clear headline stat
- Tables need to look like sports reference tables (alternating rows, clear hierarchy)
- Each section should lead with ONE insight, not just raw data

---

## Moves
**Verdict:** NEEDS REDESIGN

What's wrong:
- "Busiest Manager" hero card is a good concept but plain
- Transaction feed is a chronological list of waiver/FA moves — functional but boring
- Team filter pills at top are okay
- Each move card shows player names with position badges but no headshots, no context

What broadcast quality looks like:
- Transaction feed should feel like a news ticker with player headshots
- Each move should show the player photo, from/to team, when, and why it matters
- Could group by week with week headers instead of one flat list
- Summary stats (424 waiver claims, 391 FA adds) should be more prominent

---

## GM Dashboard
**Verdict:** NEEDS REDESIGN

What's wrong:
- 12 small manager cards in a grid — too much information per card, all at the same density
- Each card tries to show record, win%, PPG, titles, trades, luck, picks, avg age, career stats, personality badges, AND lifetime achievement badges
- It's a wall of small numbers that all look the same

What broadcast quality looks like:
- This should be a team selector (like Rosters redesign) showing ONE team's command center at a time
- Full width, clean sections: record strip, key stats, roster highlights, trade history, badges
- Think of it as the "team page" — the Sleeper team overview but with more depth

---

## Rivals
**Verdict:** SOLID — needs polish, not redesign

What's right:
- Dominance bars are bold and clear
- "PROUD BOYS OWNS THIS RIVALRY" text is ESPN tone
- Ranked by total games played makes sense

What needs refinement:
- Could add team avatars on each side of the dominance bar
- Win/loss breakdown per season would add depth
- The explanatory text at top is good but could be more visually distinct

---

## Contracts
**Verdict:** BEST TAB — minor refinements only

What's right:
- Stat cards (188/120/65/12) have clear hierarchy
- Team filter pills work well
- Tagged and Expiring player card strips are visually compelling
- Exemption timeline, Team Health bars, Contract Cliff, Dynasty Value, Keeper Sheet — all functional and well-structured

What needs refinement:
- Some of the card strips could have larger player headshots
- Keeper sheet table header needs more visual weight
- The sheer length of the page could benefit from section navigation

---

## Trophies
**Verdict:** HERO SECTION IS BROADCAST QUALITY, rest needs work

What's right:
- Championship banners are the best visual in the entire app — genuinely broadcast quality
- Standings Race concept is great

What needs refinement:
- Records section (Biggest Win, Closest, High Score, Low Score) is four small cards that look like dashboard widgets, not broadcast stats
- Luck section is a list of teams with +/- numbers — should feel like a luck meter or fortune graphic
- Activity section is a stacked bar chart that's plain
- Final Standings tables for each year are dense with no visual flair
- Playoff bracket is functional but not dramatic

---

## Constitution
**Verdict:** BROADCAST QUALITY — the standard

What's right:
- Clean layout, article navigation sidebar
- Table formatting for rules
- Monospace values for settings
- Professional, readable, complete

What could elevate:
- Could have a subtle parchment/document texture
- Article headers could be more dramatic
- This is genuinely the quality bar for information-dense content

---

## War Room
**Verdict:** SOLID — needs polish, not redesign

What's right:
- Deadlines section with countdown numbers is a good concept
- Exemption status with green/red dots is clear
- Purpose-built for offseason — right content for right context

What needs refinement:
- Deadline cards are plain — could feel more urgent with color/animation
- Expiring contracts section could show player headshots
- Draft capital section could be more visual

---

## Pulse
**Verdict:** NEEDS REDESIGN

What's wrong:
- Temperature gauge is a plain circle with "100" in it — should feel like a broadcast meter
- Story cards are all the same format (left border + text) regardless of type
- Championship stories, trade stories, draft stories all look identical
- The feed feels like a changelog, not a news broadcast

What broadcast quality looks like:
- Temperature gauge should be a dramatic visual element — semicircular meter, thermometer, or stadium-style energy bar
- Different story types should have distinct card treatments (championships get gold, trades get team colors, records get highlight treatment)
- Should feel like SportsCenter's highlight reel, not a log file

---

## Chronicle
**Verdict:** SOLID — needs polish, not redesign

What's right:
- Timeline layout with year headers and event cards works
- Colored dots by event type create visual rhythm
- Year selector tabs are functional

What needs refinement:
- Event cards could have more visual variety by type
- The timeline line could be more prominent
- Championship events should be dramatically different from trade events
- Year headers could be more commanding

---

## Summary

| Tab | Verdict | Effort |
|-----|---------|--------|
| Hero | REDESIGN | High |
| Power Rankings | REDESIGN | High |
| Rosters | FULL REDESIGN | High |
| Matchups | REDESIGN | Medium |
| Draft | POLISH ONLY | Low |
| Trades | FULL REDESIGN | High |
| Scoring | REDESIGN | Medium |
| Age Map | POLISH | Low |
| Awards | POLISH | Low |
| Analytics | REDESIGN | High |
| Moves | REDESIGN | Medium |
| GM Dashboard | REDESIGN | High |
| Rivals | POLISH | Low |
| Contracts | POLISH | Low |
| Trophies | PARTIAL REDESIGN | Medium |
| Constitution | BROADCAST QUALITY | None |
| War Room | POLISH | Low |
| Pulse | REDESIGN | Medium |
| Chronicle | POLISH | Low |

**Tabs needing redesign:** 9 (Hero, Power, Rosters, Matchups, Trades, Scoring, Analytics, GM, Pulse)
**Tabs needing polish:** 7 (Draft, Age Map, Awards, Rivals, Contracts, War Room, Chronicle)
**Tabs at broadcast quality:** 1 (Constitution)
**Already logged for redesign:** 2 (Rosters, Trades)
