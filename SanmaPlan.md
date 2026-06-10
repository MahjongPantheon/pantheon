# SanmaPlan.md — 3-Player Riichi (Sanma) Support for Mahjong Pantheon

## Overview & approach

Sanma support is built on a **ghost-player design**: every session keeps its 4 player slots; the
4th seat (North, index 3) is filled by a ghost with the sentinel player ID `GHOST_PLAYER_ID = -1`.
The ghost never deals, never pays or receives points, and is excluded from placements, uma, oka,
ratings, and statistics. This keeps the session/round data model, the protobuf round messages,
and the DB schema unchanged.

**Sentinel choice: `-1`, not `0`.** `PointsCalc` uses `empty($winnerId)` / `empty($loserId)`
guards (`Mimir/src/helpers/PointsCalc.php:83,178`) and proto3 int32 defaults to `0` — a `0`
sentinel would be indistinguishable from "unset". `session_player.player_id` has no FK to a local
table (the local player table was dropped in
`Mimir/data/migrations/20201212010400_deprecate_player_table.php`), so `-1` is storable without
any migration.

**Tsumo modes** (per-event ruleset setting):

- **With tsumo loss** (primary, implemented first, the default): per-payer values are identical
  to yonma; the winner simply collects from only 2 players. Child mangan tsumo =
  2000 (ko) + 4000 (oya) = 6000 total instead of 8000.
- **Without tsumo loss** (deferred — Milestone 6): scores come verbatim from a lookup table
  (all values rounded up to the nearest 1000, for ron AND tsumo). See the table in Milestone 6.

**Exhaustive draw payments are configurable in sanma**: a new ruleset field holds the TOTAL
points exchanged on a drawn hand (default 3000). Receivers split the total equally among tenpai
players; payers split it equally among noten players. Example with 4000: 1 tenpai → +4000
(2000 from each noten player); 2 tenpai → +2000 each (the single noten player pays 4000).
Yonma draw logic is untouched.

**Kita (nuki-dora)** gets no dedicated field or UI — players fold it into the regular dora count
when entering hands in Tyr.

**Seating scope (first iteration)**: shuffled/random and manual/prescripted seating support
tables of 3. Swiss and interval seating are rejected for sanma events (both server-side and
hidden in Forseti).

Implementation order: Common (proto/rulesets) → Mimir → Frey (no-op) → Forseti → Tyr → Sigrun →
i18n/verification → deferred no-tsumo-loss mode.

---

## Milestone 0 — Common: proto, constants, rulesets (prerequisite for everything) ✅ DONE

> **Status: implemented and verified.** All four pieces below are in the tree, proto stubs
> regenerated (PHP + TS), and the sanma ruleset's uma/oka/equalize were spot-checked in the
> running Mimir container with yonma (ema) confirmed unchanged. See **0.5 Implementation notes**
> at the end of this milestone for exact code, gotchas, and verification output.

### 0.1 `Common/proto/atoms.proto`

`RulesetConfig` (line ~571) currently ends at field 40 (`double_yakuman`). Add:

```proto
bool with_sanma = 41;             // 3-player mode for this event
bool sanma_no_tsumo_loss = 42;    // sanma only: use the no-tsumo-loss scoring table (deferred; default false = tsumo loss applies)
int32 sanma_draw_payments = 43;   // sanma only: total points exchanged on exhaustive draw; 0/unset means 3000
int32 sanma_chombo_payments = 44; // sanma only: points paid to EACH other player on chombo; 0/unset means 6000
```

`sanma_no_tsumo_loss` is named so that the proto3 default (`false`) selects the
first-implemented with-tsumo-loss mode.

- **No `GameConfig` change needed**: `GameConfig.ruleset_config` already carries the full
  `RulesetConfig` to Tyr/Forseti/Sigrun via `GetGameConfig`.
- **Reuse `Uma`** (`place1..place4`, lines ~540-545): for sanma, `place4` is ignored. Document
  this in a comment on the message. Same for `ComplexUma`.
- Update comments on `TableItemSwiss` / `PrescriptedTable` ("should be 4 elements", ~516-522) to
  "4 elements (3 real players + ghost for sanma events)".
- `RonResult` / `TsumoResult` / `DrawResult` (~208-300) are player-count agnostic — no change.
- Run `make proto_gen` (regenerates `Common/generated/` PHP and `Common/tsclients/` TS — never
  hand-edit those).

### 0.2 Ghost sentinel constant (shared, hand-written — proto3 has no constants)

- PHP: new `Common/Constants.php` — `namespace Common; class Constants { const GHOST_PLAYER_ID = -1; }`
  (loaded the same way `Common/YakuMap.php` is `require_once`'d by rulesets/Mimir).
- TS: new `Common/constants.ts` — `export const GHOST_PLAYER_ID = -1;`. Frontends already import
  non-generated Common code via path aliases (cf. `tsclients/...` aliases in
  `Tyr/app/services/riichiApiTwirp.ts`); add the import in Tyr, Forseti, and Sigrun.

### 0.3 Default sanma ruleset

- New `Common/rulesets/sanma.php`, modeled on `Common/rulesets/ema.php`: `withSanma = true`,
  `sanmaNoTsumoLoss = false`, `sanmaDrawPayments = 3000`, `sanmaChomboPayments = 6000`,
  `startPoints = 35000`,
  `goalPoints = 40000`, uma `place1 = 15000 / place2 = 0 / place3 = -15000 / place4 = 0`,
  `oka = 0`, `tonpuusen = false`, `honbaValue = 300`; allowed yaku same as ema (kita is folded
  into dora, so no yaku list change).
- Register `'sanma'` in `Common\Ruleset::instance()` switch (`Common/rulesets/Ruleset.php:59-72`).

### 0.4 `Common/rulesets/Ruleset.php` — uma/oka generalization

- `uma()` (~144-159): when `withSanma`, return a **3-element** array `[place1, place2, place3]`
  (callers index by `place - 1`; place 4 never occurs since the ghost is excluded from results).
- `_equalizeUma()` (~81-113): add a 3-place branch — all equal → `[0, 0, 0]`; handle the two
  pair cases (1st==2nd, 2nd==3rd).
- `complexUma()` (~119-138): for sanma map `neg1` / `otherwise` to 3 places; `neg3` applies only
  when all 3 real players are below start points.
- `oka()` (~169-176): sanma branch — winner gets `oka * 2/3`, the other two pay `oka / 3` each
  (yonma stays `3/4` and `1/4`).
- Add a convenience accessor used downstream everywhere:
  `public function playerCount(): int { return $this->rules()->getWithSanma() ? 3 : 4; }`.

### 0.5 Implementation notes (as built)

**Proto (0.1).** Comments were placed on their **own lines above each field**, not inline —
`protolint` enforces an 80-char line limit (`make lint` → Common runs `./protolint ./proto`), and
inline comments blew past it. The four fields land at 41–44 in `RulesetConfig`; `Uma` got a
"place4 unused in sanma" comment; `TableItemSwiss`/`PrescriptedTable` comments were reworded.
`make proto_gen` regenerated `Common/generated/Common/RulesetConfig.php` (getters/setters
`getWithSanma`/`setSanmaChomboPayments`/…) and `Common/tsclients/proto/atoms.pb.ts` (fields
`withSanma`, `sanmaNoTsumoLoss`, `sanmaDrawPayments`, `sanmaChomboPayments`, default `0`/`false`).
The PHP stub is produced by `cd Common && make proto_gen` (protoc) inside the Mimir container; the
TS stub by `pnpm exec twirpscript` inside the Frey container — the root `make proto_gen` does both.

**Constants (0.2).** `Common/Constants.php` defines `class Constants { const GHOST_PLAYER_ID = -1; }`
in `namespace Common`. `Common/constants.ts` exports `GHOST_PLAYER_ID = -1`. Frontends import
non-generated Common TS by **relative path** (e.g. `Tyr/app/index.tsx` does
`import { Storage } from '../../Common/storage'`), not a package alias — so later milestones import
`'../../Common/constants'` (depth varies per file). No frontend imports added yet (deferred to the
milestones that need them).

**Sanma ruleset (0.3).** `Common/rulesets/sanma.php` mirrors `ema.php`'s `require_once` of the
generated `Uma`/`UmaType`/`EndingPolicy`/`RulesetConfig` stubs, then sets `withSanma=true`,
`sanmaNoTsumoLoss=false`, `sanmaDrawPayments=3000`, `sanmaChomboPayments=6000`, uma
`15000/0/-15000/0`, `startPoints=35000`, `goalPoints=40000`, `oka=0`. Registered by adding
`case 'sanma'` to `Ruleset::instance()`.

**Ruleset.php (0.4).** Final shapes:

- `playerCount(): int` → `getWithSanma() ? 3 : 4`.
- `uma()`: after building the 4-element array (simple or `complexUma`), `array_slice($uma, 0, 3)`
  when `withSanma`, *then* equalize. `complexUma()` itself was left returning 4 elements (the slice
  in `uma()` covers it) — its `neg3`/`neg1`/`otherwise` switch already does the right thing for 3
  players since at most 3 can be minused.
- `_equalizeUma()`: a `getWithSanma()` branch at the top (after the shared `rsort`) handles the
  3-element case — all-equal → `[0,0,0]`, else average the tied pair(s); the original 4-player body
  is untouched below it, so **yonma is byte-identical**.

**Lint reality check (important for later milestones):**

- `Common/rulesets/*.php` is **not** phpcs-linted — Mimir's phpcs only targets `src tests www`
  (`Mimir/Makefile:70`). The untouched `ema.php` reports the same multi-line `setUma(...)` phpcs
  "violations" sanma.php does, confirming these files are outside the linted set. sanma.php matches
  ema.php's exact style regardless.
- phpstan **scans** `../Common` for symbols but its `paths` are only `src`, `www`, `tests/util`
  (`Mimir/phpstan.neon`), so `Ruleset.php` is **not** analyzed for errors in CI. Running phpstan
  directly on it surfaces ~11 pre-existing nullable-getter warnings (`getUma()`/`getComplexUma()`
  on `…|null`) that predate this work and are not reported by `make mimir_analyze`. No new errors
  were introduced.

**Verification output (in the Mimir container, oka pot set to 30000 for sanma / 20000 for ema):**

```text
sanma: playerCount=3  drawPay=3000 chomboPay=6000 start=35000
sanma: oka 20000 / -10000 / -10000           (winner 2/3, losers 1/3 — sums to 0)
sanma: uma [15000, 0, -15000]
sanma: uma top-two tied → [7500, 7500, -15000]
sanma: uma all equal    → [0, 0, 0]
ema:   playerCount=4  oka 15000 / -5000 ×3   uma [15000,5000,-5000,-15000]
ema:   uma all equal → [0,0,0,0]   uma 2nd==3rd tied → [15000,0,0,-15000]   (unchanged)
```

---

## Milestone 1 — Mimir core (with-tsumo-loss mode only) ✅ DONE

> **Status: implemented and verified.** All of 1.1–1.8 are in the tree. The full Mimir PHPUnit
> suite passes (290 tests, 2121 assertions, no failures; the 37 "risky" tests are pre-existing
> assertion-less integration smoke tests unrelated to sanma), PHPStan level 8 is clean, and PHPCS
> (PSR-2) is clean on all changed source files. New sanma test files cover PointsCalc, SessionState,
> Seating and a full InteractiveSession flow. See **1.10 Implementation notes** at the end of this
> milestone for exactly what was built, deviations from the plan above, and verification output.

### 1.1 Ghost plumbing in primitives

- `Mimir/src/primitives/Player.php` — `findById()` (~136-184): before the memcache/Frey lookup,
  split out `Constants::GHOST_PLAYER_ID`, synthesize a local `PlayerPrimitive` (`_setId(-1)`,
  display name `'—'`, no tenhou id/avatar), and merge back **preserving request order**. This
  makes `InteractiveSession::startGame`, `findPlayersForSession`, and every session-overview path
  work unchanged, and guarantees Frey is never called for the ghost. Also guard
  `findPlayersForSession`'s registration-data reorder against the ghost having no registration
  row.
- `Mimir/src/primitives/Session.php`:
  - Add `getRealPlayersIds()` = `getPlayersIds()` minus the sentinel; use it in
    `getSessionResults()` (~1031-1066) — both the `calcPlacesMap` input and the `array_map` over
    `getPlayers()` — so **no SessionResults/PlayerHistory rows are created for the ghost**.
  - Count-guard the riichi-bets-on-bump block (~1040-1057, `$scores[3]` access).
  - `isLastForPlayers()` (~1090+): exclude `-1` from the `whereIn('player_id', ...)` — otherwise
    every sanma session in the event aliases through the ghost.
- `Mimir/src/primitives/SessionResults.php`:
  - `_sort()` (~453-479): replace `while (count($result) < 4)` with `< count($playersSeq)`.
  - `calcPlacesMap()` (~490-503) and `calc()` are then generic for 3 entries; callers pass
    real-player lists only.
  - `_calcRatingDelta()` (~514-529) works as-is with the 3-element `uma()` and sanma `oka()`.

### 1.2 `Mimir/src/helpers/SessionState.php`

- Constructor (~102-113): when `withSanma` — expect 4 ids with the sentinel at index 3 (validate
  that), then **store only the 3 real players in `_scores`**. This is the linchpin: every
  `foreach ($currentScores ...)` payment loop in PointsCalc then naturally touches only real
  players, and `array_keys($this->_scores)` has 3 entries, so:
  - `getCurrentDealer()` (~412-416): change `% 4` to `% count($players)` — sanma rotates dealers
    over 3 seats (E1–E3, S1–S3).
  - `_buttobi()` (~182-186): rewrite generically as `min(array_values($this->getScores())) < 0`.
  - `_dealerIsLeaderOnOorasu()` (~191-208): oorasu round index becomes
    `withSanma ? (tonpuusen ? 3 : 6) : (tonpuusen ? 4 : 8)`. `end($scores)` still correctly picks
    the oorasu dealer (West seat = last of 3).
  - `_lastPossibleRoundWasPlayed()` (~213-233): `additionalRounds = playAdditionalRounds ?
    (withSanma ? 3 : 4) : 0`.
- `fromJson()` needs no change (state restores through the sanma-aware constructor).

### 1.3 `Mimir/src/helpers/PointsCalc.php`

- `_calcPoints()` (~448-502): the tsumo winner total is computed **independently of the payer
  loop** (`'winner' => $dealer ? 3 * $doubleRounded : $doubleRounded + 2 * $rounded` at ~489-495),
  so with-tsumo-loss does NOT fall out of excluding the ghost. Branch on `getWithSanma()`:
  dealer tsumo winner = `2 * $doubleRounded`; child tsumo winner = `$doubleRounded + $rounded`
  (one ko payer instead of two). Per-payer values and all ron values stay unchanged.
- `tsumo()` (~163-247): payer loops are already ghost-free (ghost not in `_scores`). Honba
  (~236-244): keep per-payer `($honbaValue / 3) * $honba` (= 100/honba), but change the winner
  credit from `$honbaValue * $honba` to the **sum of payer contributions** — in sanma the winner
  receives `2 * (honbaValue / 3) * honba` (200/honba).
- `ron()` (~64-146): no change — winner/loser/pao logic is player-count agnostic; honba on ron
  stays the full `honbaValue` from the single loser. Double ron (2 winners + 1 loser) is valid in
  sanma and works through the existing multiron path.
- `draw()` (~257-316): add sanma branches driven by `sanma_draw_payments` (total `T`, default
  3000 when unset; ghost is never tenpai/noten and pays nothing):
  - 0 or 3 tenpai → no payments;
  - 1 tenpai → winner `+T`, each noten pays `T / 2`;
  - 2 tenpai → each tenpai `+T / 2`, the noten player pays `T`.
  Keep the existing yonma branches intact. `draw()` doesn't currently receive `$rules` — add it
  as a parameter and update the call site in `SessionState::_updateAfterDraw` (~597-613).
- `chombo()` (~350-384), `extraChomboPayments` branch — sanma uses a **flat configurable
  payment** driven by `sanma_chombo_payments` (per-player amount `P`, default 6000 when unset):
  the offender pays `P` to EACH of the 2 other real players regardless of being oya or child
  (offender `-2P`, each other player `+P`). No dealer distinction, unlike the yonma
  reverse-mangan split. The rating-penalty chombo path is unchanged.
- `nagashi()` (~395-436): sanma uses mangan-tsumo payments (confirmed) — dealer nagashi `+8000`
  (`-4000` from each); non-dealer `+6000` (dealer `-4000`, other ko `-2000`). Change the
  `count($nagashiIds) > 3` guard to `> playerCount - 1`.
- `assignRiichiBets()` (~515-569): uses `$session->getPlayersIds()` for the ring — switch to
  real player ids.

### 1.4 `Mimir/src/models/InteractiveSession.php` — game start

- `startGame()` (~60-115): when the event ruleset has `withSanma` — accept **exactly 3 player
  ids** from clients, append `Constants::GHOST_PLAYER_ID` as the 4th before
  `PlayerPrimitive::findById`; give an explicit "exactly 3 players for a sanma event" error on a
  wrong request size. Skip the sentinel in the yakitori init loop.
- Audit round-input validation in this model: tempai/nagashi/riichi/winner/loser ids must accept
  0–3 real players and reject the sentinel.

### 1.5 Seating (first iteration scope: shuffled + prescripted only)

- `Mimir/src/controllers/Seating.php`:
  - `makeShuffledSeating()` (chunk at ~59): derive `$tableSize` from the event ruleset's
    `playerCount()`; `array_chunk($playerIds, $tableSize)`; pass 3 ids to `startGame` and rely on
    its ghost auto-append (one mechanism only).
  - `makeSwissSeating()` (~101), `generateSwissSeating()` (~157), `makeIntervalSeating()` (~204):
    **throw `InvalidParametersException('... not supported for 3-player events')` when
    `withSanma`**.
  - `makePrescriptedSeating()` (~279, count check ~308, chunk ~318): accept tables of 3 for
    sanma.
  - Audit each `array_chunk` call site (~59, 115, 184, 240, 318, 587) against its data source:
    rows sourced from `session_player` include the ghost → chunk by 4 stays correct; rows sourced
    from the rating table (no ghost) chunk by `$tableSize`.
- `Mimir/src/helpers/Seating.php`:
  - `shuffledSeating()` and `makeIntersectionsTable()` (~89-122): add a `$tableSize` parameter;
    intersection pairs for 3 players = `[0,1],[0,2],[1,2]`; chunk by `$tableSize`; **strip the
    sentinel from `$previousSeatings`** (previous seatings come from sessions, which include the
    ghost).
  - `swissSeating()` (~47-80) untouched (yonma-only, blocked at the controller).
  - `makeWindShuffle()`: for sanma only indices 0–2 may shuffle (ghost stays North).

### 1.6 `Mimir/src/controllers/Events.php`

- `getRulesets()` (~1125-1163): add the `sanma` entry (`\Common\Ruleset::instance('sanma')`).
- `createEvent()` / ruleset update paths: validate that `sanmaNoTsumoLoss = true` is **rejected
  until Milestone 6 ships**, that `sanmaDrawPayments` is a positive multiple of 100 (and even,
  so `T / 2` stays a valid score), and that `sanmaChomboPayments` is a positive multiple of 100,
  when `withSanma`.
- `getGameConfig()`: nothing — the ruleset passes through.

### 1.7 Ghost-filter audit (grep-driven)

Run `grep -rn "getPlayersIds\|getPlayers()" Mimir/src` and audit each consumer. Known hot spots:
`Mimir/src/models/EventFinishedGames.php`, `EventRatingTable.php`, `PlayerStat.php`, achievements
code in `Mimir/src/controllers/Events.php`, `Mimir/src/helpers/SkirnirClient.php` (Telegram
notifications must not list the ghost), `Mimir/src/helpers/Formatters.php` (ghost may stay in
serialized session player lists; clients filter, and rounds/payments never reference it).
Rule of thumb: anything that **writes rating/stat rows or aggregates per-player** must skip
`GHOST_PLAYER_ID`; anything that merely echoes session membership may keep it.

### 1.8 Migrations

**None.** `event.ruleset_config` is a `text` column holding protobuf-JSON (see
`Mimir/data/migrations/20230401171544_migrate_rulesets.php`, serialized via
`serializeToJsonString()` in `Mimir/src/primitives/Event.php`) — new fields serialize
transparently and old events deserialize with `with_sanma = false`. `session_player.player_id`
has no FK.

### 1.9 Tests (Mimir/Common)

- `Mimir/tests/helpers/PointsCalcTest.php`: sanma with-tsumo-loss suites — child mangan tsumo =
  2000 + 4000 = 6000 total; dealer mangan tsumo = 2 × 4000; honba tsumo = 100 × 2 payers; draw
  splits for 1 and 2 tenpai with default 3000 AND custom 4000 (`+4000` / `-2000` each, and
  `+2000` each / `-4000`); chombo flat payment with default 6000 (`-12000` / `+6000` each, same
  for oya and ko offender) AND a custom amount; nagashi mangan-tsumo payments (dealer `+8000` /
  `-4000` each; non-dealer `+6000` with dealer `-4000`, ko `-2000`).
- `Mimir/tests/helpers/SessionStateTest.php`: dealer rotation over 3 seats; hanchan end after S3
  (round 7); tonpuusen end after E3 (round 4); buttobi; oorasu agariyame with 3 players; ghost
  never present in scores.
- `Mimir/tests/models/InteractiveSessionTest.php`: full sanma flow — start with 3 ids, ghost
  auto-appended, rounds added, finish produces exactly 3 SessionResults/PlayerHistory rows,
  uma/oka over 3 places.
- `Mimir/tests/helpers/SeatingTest.php`: shuffled seating with table size 3; intersection table
  for triples; swiss/interval rejected for sanma.
- Run `make mimir_analyze` (PHPStan level 8 will catch loose array assumptions) and `make test`.

### 1.10 Implementation notes (as built)

**Ghost plumbing (1.1).** Built as planned:

- `Player.php` — `findById()` filters `GHOST_PLAYER_ID` out of the cache/Frey lookup (`$realIds`),
  then re-inserts a synthesized record (new `_ghostPlayerData()`: `title => '—'`, empty tenhou id,
  `has_avatar => false`, null telegram/notifications) at its original position, **preserving
  request order**. `findPlayersForSession()`'s reorder loop now guards the ghost (no event
  registration row) and resolves it via `findById`.
- `Session.php` — added **both** `getRealPlayersIds()` and `getRealPlayers()` (the plan only named
  the ids accessor; the entities accessor was needed by `getSessionResults()` and several
  controllers). `getSessionResults()` uses them for `calcPlacesMap`, the riichi-bump loop and the
  results `array_map`. The riichi-bump first-places counter was rewritten from the hardcoded
  `$scores[0..3]` ladder to a `while ($firstPlacesCount < count($scores) && …)` loop (generic for
  3 or 4). `isLastForPlayers()` excludes the ghost from the `whereIn` and uses
  `limit(count($realPlayersIds))`.
- `SessionResults.php` — `_sort()`'s `while (count($result) < 4)` became `< count($map)`.

**SessionState (1.2).** The constructor filters the sentinel and validates
`count == $rules->playerCount()`, storing only real players in `_scores` — the linchpin that makes
every PointsCalc payment loop ghost-free. Added a private `_maxRegularRound()` helper
(`playerCount * (tonpuusen ? 1 : 2)` → 6/3 sanma, 8/4 yonma) used by both
`_dealerIsLeaderOnOorasu()` and `_lastPossibleRoundWasPlayed()`; `_buttobi()` became
`min(array_values(getScores())) < 0`; `getCurrentDealer()` uses `% count($players)`;
`additionalRounds` uses `playerCount()`.

**PointsCalc (1.3).** As planned, with these concrete shapes:

- `tsumo()` winner total in `_calcPoints()` branches on `getWithSanma()`: dealer `2 * doubleRounded`,
  child `doubleRounded + rounded`. Honba credit to the winner was generalized to
  `(honbaValue / 3) * (count($currentScores) - 1) * $honba` — i.e. it follows the number of real
  payers (2 in sanma → 200/honba, 3 in yonma → 300/honba) rather than a hardcoded constant.
- `draw()`, `nagashi()` both gained a leading `\Common\Ruleset $rules` parameter. Every call site
  was updated: `SessionState::_updateAfterDraw`/`_updateAfterNagashi`, **and the dry-run preview
  paths in `controllers/Players.php`** (`PreviewRound`) which also call these statics directly.
- `draw()` sanma branch reads `getSanmaDrawPayments() ?: 3000`; 1 tenpai → `+T` / each noten
  `-T/2`; 2 tenpai → each tenpai `+T/2` / noten `-T`; 0 or 3 tenpai → no payment; >3 throws.
- `chombo()` sanma branch (under the existing `getExtraChomboPayments()` guard) pays a flat
  `getSanmaChomboPayments() ?: 6000` to each other player, offender `-2P`, no oya/ko distinction.
- `nagashi()` uses mangan-tsumo equivalents with tsumo loss (dealer `+8000`, non-dealer `+6000`);
  the owner-count guard became `> count($currentScores) - 1`.
- `assignRiichiBets()` builds its ring from `getRealPlayersIds()`.

**InteractiveSession (1.4).** `startGame()` requires exactly 3 ids for sanma and appends
`GHOST_PLAYER_ID` as the 4th before `findById`; the yakitori-init loop skips the sentinel. Score-diff
loops in this model (and the equivalents in `models/Event.php`, `controllers/Players.php`) iterate
`getRealPlayersIds()`. `finishGame`'s Skirnir `whoPlays` uses real ids so the ghost is never
notified.

**Seating (1.5).** `controllers/Seating.php::_getData()` now returns a third element `$tableSize`
(= `playerCount()`) and strips `GHOST_PLAYER_ID` (in addition to ignored players) when chunking
the previous-seating data. Shuffled and prescripted paths chunk by `$tableSize`; a new
`_assertNotSanma()` helper throws `InvalidParametersException` from the Swiss and Interval entry
points. `helpers/Seating.php` threaded a `$tableSize = 4` param (defaulted, so yonma callers are
untouched) through `shuffledSeating`, `makeIntersectionsTable`, `makeWindShuffle`,
`_calculateIntersectionFactor`, `_randomWindShuffle`, `_balancedWindShuffle`. Two notable
generalizations: `makeIntersectionsTable` builds the intersection-pair list with nested loops
(triples → `[0,1],[0,2],[1,2]`); `_calcWindDistributionPenalty` was refactored from four positional
`$playerN` params to a single `int[] $tablePlayers` array with `array_fill`'d buckets and a nested
pairwise sum, and `_balancedWindShuffle` gained a 3-seat placement table (`012,021,102,120,201,210`).

**Events (1.6).** `getRulesets()` exposes the `sanma` template. A new `_validateSanmaSettings()`
runs on both create and update: rejects `sanmaNoTsumoLoss = true` (deferred to M6), and requires
`sanmaDrawPayments` to be a non-negative multiple of **200** (so the `T/2` split stays a valid
multiple of 100) and `sanmaChomboPayments` a non-negative multiple of 100.

**Ghost-filter audit (1.7) — bugs found and fixed during this milestone.** Beyond the planned
`PlayerStat`/`Round`-validator/score-diff changes, three real null-dereference bugs were found in
`controllers/Players.php` where code mapped over `getPlayers()` (4 entries incl. ghost) while
indexing per-player data that only exists for the 3 real players:

- `getCurrentSessions()` zipped `getPlayers()` against `getCurrentState()->getScores()` (3 entries)
  → ghost row with a null score. → switched to `getRealPlayers()`.
- `getPrefinishedSessionResults()` and `getLastResults()` indexed `$sessionResults[$p->getId()]`
  (built only for real players) → `->getPlace()` on null for the ghost. → switched to
  `getRealPlayers()` / `getRealPlayersIds()`.

Sites deliberately **left echoing the ghost** (clients filter it, per the design): `Event.php`
game-player listings (`getPlayersOfGames`, `getGames`), `Round`/`MultiRound::getLastSessionState`
(passes the full 4-id list to the sanma-aware `SessionState` constructor, which filters it),
`InteractiveSession::_checkAuth` and the Skirnir registration filters (`-1` matches no
registration), and `OnlineSession` (majsoul-parsed online sanma is out of scope for this iteration).

**PHPStan fix (positive-int).** Replacing the literal `array_chunk(…, 4)` with the `$tableSize`
variable produced 5 level-8 errors (`array_chunk` `$length` expects `int<1, max>`). Fixed by
narrowing types rather than runtime `max(1, …)`: `Ruleset::playerCount()` is annotated
`@return positive-int`, and every `$tableSize` param in `helpers/Seating.php` is annotated
`@param positive-int`. PHPStan reads Common signatures for type info (even though Common isn't in
its analyzed `paths`), so this propagates cleanly.

**Tests (1.9 — as built).** Sanma tests live in **separate files** (not folded into the existing
suites): `tests/helpers/SanmaPointsCalcTest.php` (class `SanmaPointsTest`, 12 tests — tsumo
with-loss child/dealer mangan, honba 200/honba, ron unchanged, draw default+custom 1/2 tenpai,
draw+riichi, flat chombo default+custom, nagashi, too-many-owners throw),
`tests/helpers/SanmaSessionStateTest.php` (dealer rotation over 3 seats, hanchan/tonpuusen end,
buttobi, oorasu agariyame, ghost absent from scores), `tests/helpers/SanmaSeatingTest.php`
(table-size-3 shuffle + triple intersection table), `tests/models/SanmaSessionTest.php` (full
start-3-ids → ghost auto-append → rounds → finish = exactly 3 results/history rows). The existing
yonma `PointsCalcTest.php` was updated only to thread the new `$rules` arg into `draw()`/`nagashi()`
calls and still passes unchanged (51 tests). **Note:** these new test classes' names don't match
their filenames (e.g. `SanmaPointsTest` in `SanmaPointsCalcTest.php`), which PHPUnit flags as a
deprecation — this matches the pre-existing convention in this codebase (`PointsTest` in
`PointsCalcTest.php`, etc.) and the full-directory / `--filter <Class>` runs work fine.

**Verification output (in the Mimir container):**

```text
php bin/unit.php  → OK (incomplete/risky): Tests: 290, Assertions: 2121, Risky: 37
  SanmaPointsTest        OK (12 tests, 21 assertions)
  SanmaSessionStateTest  OK (10 tests, 32 assertions)
  SanmaSeatingTest       OK (4 tests, 31 assertions)
  SanmaSessionTest       OK (5 tests, 17 assertions)
  PointsTest (yonma)     OK (51 tests, 154 assertions)
phpstan analyze (level 8)  → [OK] No errors
phpcs --standard=PSR2 (10 changed src files)  → no violations
```

---

## Milestone 2 — Frey ✅ DONE

**No changes — verified.** Frey owns identity only; the ghost is a sentinel, never an account.
`PlayerPrimitive::findById` (`Mimir/src/primitives/Player.php:139-187`) splits `GHOST_PLAYER_ID`
out of `$realIds` before any cache lookup or `Frey::getPersonalInfo()` call, and re-inserts the
synthesized `_ghostPlayerData()` record afterwards — so Frey's `GetPersonalInfo` never sees `-1`.

Audited every other `$ds->remote()->...` call site in Mimir for the same hazard
(`grep -n "_ds->remote()->" Mimir/src -r`):

- `Player.php:225,264` (`findByTenhouIds`, `findByMajsoulAccountId`) — inputs are tenhou/majsoul
  ids from external data, never the local sentinel.
- `Event.php:412` and `Events.php:451` (`getMajsoulNicknames`) — operate on `PlayerPrimitive[]`
  built from `PlayerRegistrationPrimitive` (event registrations); the ghost is never registered
  for an event, so it never appears in `$players`.
- `EventRatingTable.php:174` (`getMajsoulNicknames`) — operates on `PlayerHistoryPrimitive[]`,
  which (per Milestone 1.1) is only created for real players via `getRealPlayersIds()`.
- `InteractiveSession.php:393`, `SkirnirClient.php:411-412`, `Events.php:182` — event
  admins/referees/ACL rules, unrelated to session players.

No code changes required. State this explicitly in the PR description.

---

## Milestone 3 — Forseti (admin) and Sigrun (public stats)

### Forseti

- `Forseti/app/pages/OwnedEventsEdit/RulesetSettings.tsx`: add a "Three-player game (sanma)"
  switch bound to `ruleset.withSanma`, dependent number inputs for `ruleset.sanmaDrawPayments`
  (default 3000) and `ruleset.sanmaChomboPayments` (default 6000, paid to each other player;
  shown next to the existing chombo settings), and the tsumo-loss selector with the
  no-tsumo-loss option **disabled until Milestone 6**. The rulesets dropdown picks up the new `sanma` template from `GetRulesets`
  automatically.
- `Forseti/app/pages/OwnedEventsEdit/UmaSelect.tsx`: hide the `place4` inputs when `withSanma`.
- `Forseti/app/pages/GamesControl/TournamentControls.tsx`: change the
  `playersFiltered.length % 4 !== 0` validation to `% (isSanma ? 3 : 4)`; hide Swiss and Interval
  seating buttons for sanma events (the server rejects them anyway); add a sanma variant of the
  wind-shuffle label (`1-2-3`).
- `Forseti/app/pages/EventPrescript.tsx`: accept/validate `id-id-id` rows for sanma.
- Games/tables listings under `Forseti/app/pages/GamesControl/`: filter `GHOST_PLAYER_ID` from
  rendered player lists.

### Sigrun

- `Sigrun/app/components/GameListing.tsx`: slice the `['東','南','西','北']` winds array to 3 for
  sanma events; filter the ghost from `players`.
- `Sigrun/app/components/PlayerStatsListing.tsx`: hide the 4th-place row of `placeLabels` when
  the event ruleset is sanma.
- `Sigrun/app/pages/EventRulesOverview/UmaSelect.tsx`: hide `place4`; show the sanma rules
  (mode + draw payments + chombo payments) in the rules overview.
- Audit ghost leakage in recent-games/round-by-round views (rounds never reference the ghost;
  only session player lists do).

---

## Milestone 4 — Tyr (mobile assistant)

Tyr delegates all scoring to Mimir (`PreviewRound`/`AddRound` via
`Tyr/app/services/riichiApiTwirp.ts:164,186`) — **no scoring math in Tyr**; only UI/topology
changes.

- **Filter at the API boundary**: where session-overview / current-games responses are consumed
  (`Tyr/app/store/middlewares/apiClient.ts`), strip `GHOST_PLAYER_ID` from players arrays so the
  whole store sees 3 players for sanma games. This is the single highest-leverage change.
- `Tyr/app/store/selectors/table.ts`: replace hardcoded `% 4` with `% players.length`; slice the
  `['e','s','w','n']` winds array to `players.length`; generalize the round-wind formula's
  non-negativity offset to `2 * playerCount`.
- `Tyr/app/components/pages/NewGame/NewGame.tsx`: when `gameConfig.rulesetConfig.withSanma`,
  render only the east/south/west selectors; shuffle/clear over 3; the outgoing `StartGame`
  payload contains 3 ids (Mimir appends the ghost).
- Table screens: **reuse `FourSidedScreen`**
  (`Tyr/app/components/base/FourSidedScreen/FourSidedScreen.tsx`) with the missing seat's slot
  empty in the first iteration (cheapest correct option; a dedicated `ThreeSidedScreen` is later
  polish). With players filtered to 3, self/shimocha/kamicha map naturally.
- `Tyr/app/components/base/ResultArrows/`: arrows are keyed by payer/winner pairs from Mimir's
  payments info; the ghost never appears in payments, so ghost arrows never render — verify and
  guard any static side-arrow slot that assumes a player exists on that side.
- Outcome selection screens (winner/loser/riichi/tempai/nagashi pickers): operate on the filtered
  3-player list — verify "all tempai" logic uses `players.length`, not literal 4.
- Kita: no UI change — verify the dora selector's max bound allows sanma-typical counts (≥ 12).
- Tests: extend the Vitest suites for `table.ts` selectors with 3-player fixtures.

---

## Milestone 5 — i18n + verification

### i18n

New strings ("Three-player game (sanma)", "Draw payments total", "Chombo payment to each
player", seating error messages, ghost placeholder '—') → `make i18n_extract`, translate the
`.po` files (ru/ko/de/jp/cn), `make i18n_compile`.

### Verification

1. `make proto_gen` → generated stubs compile; `make lint` (eslint/prettier/tsc/phpcs/phpstan).
2. `make test` — all new unit tests above pass; `make check` before the PR.
3. Manual e2e (dev env: `make dev` + `make seed`):
   - Forseti: create an event with the `sanma` ruleset; uma form shows 3 places; Swiss/Interval
     buttons absent; shuffled seating builds tables of 3.
   - Tyr: start a game with 3 players; record ron, tsumo (verify with-loss totals), draws with 1
     and 2 tenpai (default and custom `sanmaDrawPayments`), chombo (flat `sanmaChomboPayments`
     to each player), nagashi, riichi sticks, honba accumulation; verify dealer rotation
     E1→E3→S1→S3 and game end after S3; verify buttobi.
   - Sigrun: rating table shows 3 deltas summing to uma/oka expectations; game listing shows 3
     players with 東南西; no ghost anywhere.
   - `make dump_users` for test creds; Fenrir e2e (`make e2e_dev`) regression on **yonma** flows.
4. Recalc safety: rebuild scoring on a seeded yonma event — results must be byte-identical
   (guards against accidental behavior changes for existing events).

---

## Milestone 6 — No-tsumo-loss mode (deferred, low priority)

Implemented last; until then `sanmaNoTsumoLoss = true` is rejected at event creation and the
Forseti option stays disabled.

- New `Mimir/src/helpers/SanmaPointsCalc.php`: lookup-table helper returning the same
  `['winner','dealer','player','loser']` shape as `_calcPoints()`, wired into
  `PointsCalc::_calcPoints` behind `sanma_no_tsumo_loss`. The table is verbatim (all values
  rounded up to the nearest 1000, ron AND tsumo):

  Child (ko) — ron (tsumo: ko-pays/oya-pays):

  | fu | 1 han            | 2 han            | 3 han            |
  |----|------------------|------------------|------------------|
  | 30 | 1000 (1000/1000) | 2000 (1000/1000) | 4000 (1000/3000) |
  | 40 | 2000 (1000/1000) | 3000 (1000/2000) | 6000 (2000/4000) |
  | 50 | 2000 (1000/1000) | 4000 (1000/3000) | 7000 (2000/5000) |

  Limits (child): mangan (4-5 han) 8000 (3000/5000), haneman (6-7) 12000 (4000/8000),
  baiman (8-10) 16000 (6000/10000), sanbaiman (11-13) 24000 (8000/16000),
  yakuman 32000 (12000/20000).

  Dealer (oya) — ron (tsumo: each pays):

  | fu | 1 han           | 2 han           | 3 han            |
  |----|-----------------|-----------------|------------------|
  | 30 | 2000 (1000 all) | 3000 (2000 all) | 6000 (3000 all)  |
  | 40 | 2000 (1000 all) | 4000 (2000 all) | 8000 (4000 all)  |
  | 50 | 3000 (2000 all) | 5000 (3000 all) | 10000 (5000 all) |

  Limits (dealer): mangan 12000 (6000 all), haneman 18000 (9000 all), baiman 24000 (12000 all),
  sanbaiman 36000 (18000 all), yakuman 48000 (24000 all). Negative han = N× natural yakuman, as
  in yonma.

- Enable the Forseti toggle; `PointsCalcTest` asserts **every cell** of the table for ron and
  tsumo, ko and oya.
- Open sub-decisions (confirm with maintainer, defaults stated in code + tests):
  - 20fu (pinfu tsumo) / 25fu (chiitoitsu) / 60fu+ rows are absent from the table — default rule:
    compute the yonma value via the existing base-points formula, round the ron total up to the
    nearest 1000; for tsumo, derive the split the same way as the nearest table row.
  - Honba in no-tsumo-loss mode: keep 100/payer (winner +200/honba) vs. the 150/payer variant
    (winner +300/honba) used by some no-loss rules.

---

## Open decisions flagged for maintainer

- No-tsumo-loss table edge cells and honba variant (Milestone 6).

Resolved decisions (now part of the plan above):

- **Chombo**: flat payment of `sanmaChomboPayments` (default 6000) to each of the other two
  players, regardless of oya/child — configurable in ruleset tuning (Milestones 0.1, 1.3, 3).
- **Nagashi**: mangan-tsumo payments — non-oya receives 2000/4000, oya receives 4000 from each
  (Milestone 1.3).
