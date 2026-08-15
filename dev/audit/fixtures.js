// Deterministic fixture generator for the visual-audit harness.
// Produces Sleeper/FantasyCalc/Sheets responses shaped exactly the way
// index.html's data pipeline consumes them (see buildCurrentSeasonData,
// mergeHistoricalData, parseContractCSV).
'use strict';

const USER_ID = '393634863552425984';
const LEAGUE_NAME = "Harambe's Dozen";

// ── seeded RNG ──
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ['Jalen','Marcus','Devon','Tyler','Chris','Jordan','Malik','Trey','Cam','Derek','Austin','Zach','Noah','Elijah','Caleb','Bryce','Justin','Trevor','Amari','DeAndre','Travis','George','Sam','Logan','Mason','Hunter','Cooper','Brock','Rashee','Tank','Puka','Jaxon','Keon','Romeo','Dalton','Isaiah','Quentin','Xavier','Nico','Braxton'],
  LAST = ['Williams','Johnson','Carter','Robinson','Mitchell','Henderson','Brooks','Coleman','Hayes','Sanders','Pierce','Daniels','Watts','Holloway','Greer','Vaughn','Sutton','Mack','Rivers','Stone','Bell','Frost','Knight','Lane','Marsh','Nash','Price','Reed','Shaw','Tate','Vance','West','York','Boone','Cruz','Dean','Fields','Gray','Hale','Irving','James','Kemp','Long','Moss','Neal','Owens','Page','Quinn'],
  COLLEGES = ['Alabama','Ohio State','Georgia','Michigan','LSU','Texas','USC','Oregon','Penn State','Clemson','Notre Dame','Florida','Tennessee','Washington','Iowa'],
  NFL = ['ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB','HOU','IND','JAX','KC','LAC','LAR','LV','MIA','MIN','NE','NO','NYG','NYJ','PHI','PIT','SEA','SF','TB','TEN','WAS'];

const TEAMS = [
  { name: 'Gorilla Warfare', mgr: 'Andrew', uid: USER_ID },
  { name: 'The Silverbacks', mgr: 'Chuck', uid: 'u02' },
  { name: "Harambe's Heroes", mgr: 'Kevin', uid: 'u03' },
  { name: 'Banana Republic', mgr: 'Dave', uid: 'u04' },
  { name: 'Jungle Juggernauts', mgr: 'Mike', uid: 'u05' },
  { name: 'Primal Instinct', mgr: 'Tony', uid: 'u06' },
  { name: 'The Enclosure', mgr: 'Sarah', uid: 'u07' },
  { name: 'Mighty Joe Youngs', mgr: 'Brad', uid: 'u08' },
  { name: 'Zoo Keepers', mgr: 'Jess', uid: 'u09' },
  { name: 'Ape Escape', mgr: 'Matt', uid: 'u10' },
  { name: 'King of the Jungle', mgr: 'Ryan', uid: 'u11' },
  { name: 'Concrete Jungle', mgr: 'Pete', uid: 'u12' }
];

// champion team index (0-based) per completed season
const CHAMPS = { 2021: 2, 2022: 6, 2023: 0, 2024: 9, 2025: 4 };

function buildFixtures(mode) {
  const rnd = mulberry32(42);
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const currentSeason = mode === 'midseason' ? 2025 : 2026;
  const seasons = [];
  for (let y = 2021; y <= currentSeason; y++) seasons.push(y);

  // ── player pool ──
  const players = {}; // raw /players/nfl shape
  const pool = { QB: [], RB: [], WR: [], TE: [] };
  let nameIdx = 0, idn = 1000;
  const mkPlayers = (pos, count) => {
    for (let i = 0; i < count; i++) {
      const id = String(++idn);
      const fn = FIRST[nameIdx % FIRST.length], ln = LAST[Math.floor(nameIdx / FIRST.length) % LAST.length];
      nameIdx++;
      const age = 21 + Math.floor(rnd() * 13);
      players[id] = {
        full_name: fn + ' ' + ln, first_name: fn, last_name: ln,
        position: pos, team: pick(NFL), age, years_exp: Math.max(0, age - 22),
        college: pick(COLLEGES), number: 1 + Math.floor(rnd() * 98),
        status: 'Active', active: true,
        injury_status: rnd() < 0.06 ? pick(['Questionable', 'Out', 'IR']) : null
      };
      pool[pos].push(id);
    }
  };
  mkPlayers('QB', 42); mkPlayers('RB', 116); mkPlayers('WR', 150); mkPlayers('TE', 72);

  // ── rosters: deal players ──
  const cursor = { QB: 0, RB: 0, WR: 0, TE: 0 };
  const deal = (pos, n) => pool[pos].slice(cursor[pos], cursor[pos] += n);
  const rosterPlayers = [], rosterStarters = [];
  const defAbbrevs = ['KC', 'SF', 'BAL', 'BUF', 'DAL', 'PHI', 'DET', 'MIA', 'NYJ', 'GB', 'CIN', 'LAR'];
  for (let t = 0; t < 12; t++) {
    const qb = deal('QB', 3), rb = deal('RB', 8), wr = deal('WR', 10), te = deal('TE', 5);
    const all = [...qb, ...rb, ...wr, ...te, defAbbrevs[t]];
    const starters = [qb[0], rb[0], rb[1], wr[0], wr[1], wr[2], te[0], rb[2], wr[3]];
    rosterPlayers.push(all); rosterStarters.push(starters);
  }
  const unrostered = ['QB', 'RB', 'WR', 'TE'].flatMap(p => pool[p].slice(cursor[p]));

  // ── FantasyCalc values ──
  const ktcOf = {};
  Object.entries(players).forEach(([id, p]) => {
    const youth = Math.max(0, 33 - p.age);
    ktcOf[id] = Math.min(10500, Math.max(400, Math.round(youth * 320 + rnd() * 5200)));
  });
  const fcalc = Object.keys(ktcOf)
    .sort((a, b) => ktcOf[b] - ktcOf[a]).slice(0, 260)
    .map((id, i) => ({ player: { sleeperId: id }, value: ktcOf[id], overallRank: i + 1, maybeTier: Math.min(10, 1 + Math.floor(i / 26)) }));

  // ── contracts CSV ──
  const csvRows = ['Player Name,Sleeper ID,Contract Years,Tag,Exemption,Note'];
  let ci = 0;
  rosterPlayers.forEach(rp => rp.slice(0, 14).forEach(pid => {
    const p = players[pid]; if (!p) return;
    ci++;
    const roll = rnd();
    const yrs = roll < 0.22 ? '' : String(Math.floor(rnd() * 5)); // blank = uncontracted
    const tag = ci % 31 === 0 ? 'Franchise' : ci % 47 === 0 ? 'Transition' : '';
    const exm = ci % 23 === 0 ? String(currentSeason) : '';
    const note = ci % 19 === 0 ? 'Extended after breakout year' : '';
    csvRows.push(`${p.full_name},${pid},${yrs},${tag},${exm},${note}`);
  }));
  const contractsCSV = csvRows.join('\n');

  // ── leagues chain ──
  const leagueOf = {};
  seasons.forEach(y => {
    leagueOf[y] = {
      league_id: 'L' + y, name: LEAGUE_NAME, season: String(y),
      previous_league_id: y === 2021 ? '0' : 'L' + (y - 1),
      status: y === currentSeason ? (mode === 'midseason' ? 'in_season' : 'complete') : 'complete',
      total_rosters: 12, avatar: null,
      roster_positions: ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'FLEX', 'FLEX', 'BN', 'BN', 'BN', 'BN', 'BN', 'BN', 'BN', 'BN', 'BN', 'BN', 'BN', 'BN', 'BN', 'BN', 'BN'],
      settings: { playoff_week_start: 15, playoff_teams: 6, type: 2, trade_deadline: 12, leg: 1 }
    };
  });

  const usersArr = TEAMS.map((t, i) => ({
    user_id: t.uid, display_name: t.mgr, avatar: null,
    metadata: { team_name: t.name }
  }));

  // ── per-season simulation ──
  const seasonData = {}; // y -> {rosters, matchups:{wk:[entries]}, transactions:{wk:[txns]}, bracket, drafts, draftPicks, tradedPicks}
  const playedWeeks = y => (y < currentSeason ? 14 : mode === 'midseason' ? 13 : 0);

  // round-robin schedule (circle method), 1-indexed rids
  const schedule = []; // [week][game] = [ridA, ridB]
  { const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    for (let w = 0; w < 14; w++) {
      const wk = [], rot = [ids[0], ...ids.slice(1).map((_, i) => ids[1 + ((i + w) % 11)])];
      for (let g = 0; g < 6; g++) wk.push([rot[g], rot[11 - g]]);
      schedule.push(wk);
    } }

  seasons.forEach(y => {
    const champIdx = CHAMPS[y];
    const strength = TEAMS.map((_, i) => 108 + rnd() * 18 + (i === champIdx ? 14 : 0));
    const regWeeks = playedWeeks(y);
    const wins = Array(13).fill(0), losses = Array(13).fill(0), fpts = Array(13).fill(0), fptsA = Array(13).fill(0);
    const matchups = {}, transactions = {};
    const score = i => Math.round(Math.max(72, Math.min(196, strength[i] + (rnd() - 0.5) * 56)) * 100) / 100;
    const splitPts = (total, starters) => {
      const w = starters.map(() => 0.5 + rnd());
      const sw = w.reduce((a, b) => a + b, 0);
      const m = {};
      starters.forEach((pid, i) => { m[pid] = Math.round(total * w[i] / sw * 10) / 10; });
      return m;
    };

    for (let w = 1; w <= regWeeks; w++) {
      const entries = [];
      schedule[(w - 1) % 14].forEach(([a, b], mi) => {
        const pa = score(a - 1), pb = score(b - 1);
        entries.push(
          { matchup_id: mi + 1, roster_id: a, points: pa, players: rosterPlayers[a - 1], starters: rosterStarters[a - 1], players_points: splitPts(pa, rosterStarters[a - 1]) },
          { matchup_id: mi + 1, roster_id: b, points: pb, players: rosterPlayers[b - 1], starters: rosterStarters[b - 1], players_points: splitPts(pb, rosterStarters[b - 1]) });
        fpts[a] += pa; fpts[b] += pb; fptsA[a] += pb; fptsA[b] += pa;
        if (pa >= pb) { wins[a]++; losses[b]++; } else { wins[b]++; losses[a]++; }
      });
      matchups[w] = entries;
    }

    // standings → seeds
    const rids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const seeds = [...rids].sort((a, b) => (wins[b] - wins[a]) || (fpts[b] - fpts[a]));
    const champRid = seeds.includes(champIdx + 1) && seeds.indexOf(champIdx + 1) < 6 ? champIdx + 1 : seeds[0];

    // bracket (only completed seasons)
    let bracket = [];
    if (regWeeks >= 14) {
      const beats = (fav, t1, t2) => (t1 === fav || t2 === fav) ? fav : t1; // favourite wins, else t1
      const m1 = { r: 1, m: 1, t1: seeds[2], t2: seeds[5] }, m2 = { r: 1, m: 2, t1: seeds[3], t2: seeds[4] };
      m1.w = beats(champRid, m1.t1, m1.t2); m1.l = m1.w === m1.t1 ? m1.t2 : m1.t1;
      m2.w = beats(champRid, m2.t1, m2.t2); m2.l = m2.w === m2.t1 ? m2.t2 : m2.t1;
      const m3 = { r: 2, m: 3, t1: seeds[0], t2: m2.w }, m4 = { r: 2, m: 4, t1: seeds[1], t2: m1.w };
      m3.w = beats(champRid, m3.t1, m3.t2); m3.l = m3.w === m3.t1 ? m3.t2 : m3.t1;
      m4.w = beats(champRid, m4.t1, m4.t2); m4.l = m4.w === m4.t1 ? m4.t2 : m4.t1;
      const m5 = { r: 3, m: 5, t1: m3.w, t2: m4.w, p: 1 }, m6 = { r: 3, m: 6, t1: m3.l, t2: m4.l, p: 3 };
      m5.w = beats(champRid, m5.t1, m5.t2); m5.l = m5.w === m5.t1 ? m5.t2 : m5.t1;
      m6.w = m6.t1; m6.l = m6.t2;
      bracket = [m1, m2, m3, m4, m5, m6];
      // playoff matchup entries weeks 15-17
      [[15, [m1, m2]], [16, [m3, m4]], [17, [m5, m6]]].forEach(([w, games]) => {
        const entries = [];
        games.forEach((g, gi) => {
          const winPts = score(g.w - 1) + 8, losePts = score(g.l - 1) - 4;
          const wp = Math.round(winPts * 100) / 100, lp = Math.round(losePts * 100) / 100;
          entries.push(
            { matchup_id: gi + 1, roster_id: g.w, points: wp, players: rosterPlayers[g.w - 1], starters: rosterStarters[g.w - 1], players_points: splitPts(wp, rosterStarters[g.w - 1]) },
            { matchup_id: gi + 1, roster_id: g.l, points: lp, players: rosterPlayers[g.l - 1], starters: rosterStarters[g.l - 1], players_points: splitPts(lp, rosterStarters[g.l - 1]) });
        });
        matchups[w] = entries;
      });
    }

    // transactions: trades + waivers + FA
    let txnN = 0;
    const addTxn = (w, txn) => { (transactions[w] = transactions[w] || []).push(txn); };
    const ts = (w) => Date.UTC(y, 8, 7) + w * 7 * 864e5;
    if (regWeeks > 0) {
      const nTrades = 18 + Math.floor(rnd() * 10);
      for (let i = 0; i < nTrades; i++) {
        const w = 1 + Math.floor(rnd() * Math.min(regWeeks, 12));
        let a = 1 + Math.floor(rnd() * 12), b = 1 + Math.floor(rnd() * 12);
        if (a === b) b = (b % 12) + 1;
        const pa = rosterPlayers[a - 1][2 + Math.floor(rnd() * 20)], pb = rosterPlayers[b - 1][2 + Math.floor(rnd() * 20)];
        const adds = { [pb]: a, [pa]: b }, drops = { [pb]: b, [pa]: a };
        const dps = rnd() < 0.45 ? [{ season: String(y + 1), round: 1 + Math.floor(rnd() * 3), roster_id_origin: b, roster_id: a, previous_owner_id: b, owner_id: a }] : [];
        if (rnd() < 0.25) { const pa2 = rosterPlayers[a - 1][1 + Math.floor(rnd() * 20)]; adds[pa2] = b; drops[pa2] = a; }
        addTxn(w, { type: 'trade', status: 'complete', transaction_id: 'T' + y + '-' + (++txnN), roster_ids: [a, b], adds, drops, draft_picks: dps, status_updated: ts(w), created: ts(w), leg: w });
      }
      const nMoves = 55 + Math.floor(rnd() * 25);
      for (let i = 0; i < nMoves; i++) {
        const w = 1 + Math.floor(rnd() * regWeeks);
        const rid = 1 + Math.floor(rnd() * 12);
        const addP = unrostered[Math.floor(rnd() * unrostered.length)];
        const dropP = rosterPlayers[rid - 1][6 + Math.floor(rnd() * 18)];
        const type = rnd() < 0.55 ? 'waiver' : rnd() < 0.95 ? 'free_agent' : 'commissioner';
        addTxn(w, { type, status: 'complete', transaction_id: 'M' + y + '-' + (++txnN), roster_ids: [rid], adds: { [addP]: rid }, drops: rnd() < 0.7 ? { [dropP]: rid } : {}, draft_picks: [], settings: type === 'waiver' ? { waiver_bid: 1 + Math.floor(rnd() * 45) } : null, status_updated: ts(w), created: ts(w), leg: w });
      }
    }

    // rookie draft: 4 rounds × 12
    const order = [...rids].sort(() => rnd() - 0.5);
    const draftPicks = [];
    for (let r = 1; r <= 4; r++) for (let s = 0; s < 12; s++) {
      const slot = order[(s + r) % 12];
      const own = rosterPlayers[slot - 1].filter(pid => players[pid] && players[pid].age <= 25);
      const fromRoster = rnd() < 0.68 && own.length;
      const pid = fromRoster ? own[Math.floor(rnd() * own.length)] : unrostered[Math.floor(rnd() * unrostered.length)];
      const p = players[pid];
      draftPicks.push({ round: r, pick_no: (r - 1) * 12 + s + 1, roster_id: slot, picked_by: TEAMS[slot - 1].uid, player_id: pid, metadata: { first_name: p.first_name, last_name: p.last_name, position: p.position, team: p.team } });
    }

    // traded future picks
    const tradedPicks = [];
    for (let i = 0; i < 14; i++) {
      let a = 1 + Math.floor(rnd() * 12), b = 1 + Math.floor(rnd() * 12);
      if (a === b) b = (b % 12) + 1;
      tradedPicks.push({ season: String(y + 1 + Math.floor(rnd() * 2)), round: 1 + Math.floor(rnd() * 4), roster_id_origin: a, roster_id: b, previous_owner_id: a, owner_id: b });
    }

    const rosters = rids.map(rid => ({
      roster_id: rid, owner_id: TEAMS[rid - 1].uid, league_id: 'L' + y,
      players: rosterPlayers[rid - 1], starters: rosterStarters[rid - 1], reserve: [],
      settings: {
        wins: wins[rid], losses: losses[rid], ties: 0,
        fpts: Math.floor(fpts[rid]), fpts_decimal: Math.round((fpts[rid] % 1) * 100),
        fpts_against: Math.floor(fptsA[rid]), fpts_against_decimal: Math.round((fptsA[rid] % 1) * 100),
        waiver_position: rid, total_moves: 10 + Math.floor(rnd() * 30)
      }
    }));

    seasonData[y] = { rosters, matchups, transactions, bracket, draftPicks, tradedPicks,
      drafts: [{ draft_id: 'D' + y, season: String(y), type: 'linear', status: 'complete', league_id: 'L' + y }] };
  });

  // ── HTTP router for intercepted hosts ──
  function route(url) {
    const u = new URL(url);
    const path = u.pathname;
    const json = o => ({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });

    if (u.hostname === 'api.fantasycalc.com') return json(fcalc);
    if (u.hostname === 'docs.google.com') return { status: 200, contentType: 'text/csv', body: contractsCSV };
    if (u.hostname !== 'api.sleeper.app') return null;

    let m;
    if (path === '/v1/state/nfl') return json(mode === 'midseason'
      ? { season: '2025', league_season: '2025', week: 14, display_week: 14, season_type: 'regular' }
      : { season: '2026', league_season: '2026', week: 0, display_week: 0, season_type: 'off' });
    if ((m = path.match(/^\/v1\/user\/[^/]+\/leagues\/nfl\/(\d+)$/))) {
      const y = parseInt(m[1]); return json(leagueOf[y] ? [leagueOf[y]] : []);
    }
    if (path === '/v1/players/nfl') return json(players);
    if ((m = path.match(/^\/v1\/draft\/D(\d+)\/picks$/))) return json(seasonData[m[1]].draftPicks);
    if ((m = path.match(/^\/v1\/league\/L(\d+)(?:\/(.*))?$/))) {
      const y = parseInt(m[1]), sub = m[2] || '', sd = seasonData[y];
      if (!sd) return { status: 404, contentType: 'application/json', body: '[]' };
      if (!sub) return json(leagueOf[y]);
      if (sub === 'rosters') return json(sd.rosters);
      if (sub === 'users') return json(usersArr);
      if (sub === 'traded_picks') return json(sd.tradedPicks);
      if (sub === 'winners_bracket') return json(sd.bracket);
      if (sub === 'drafts') return json(sd.drafts);
      let mm;
      if ((mm = sub.match(/^matchups\/(\d+)$/))) return json(sd.matchups[mm[1]] || []);
      if ((mm = sub.match(/^transactions\/(\d+)$/))) return json(sd.transactions[mm[1]] || []);
    }
    return { status: 404, contentType: 'application/json', body: 'null' };
  }

  return { route, currentSeason, completedSeasons: seasons.filter(y => playedWeeks(y) >= 14).length };
}

module.exports = { buildFixtures };
