# Riichi Mahjong — English Rules Reference for Automated Services

> **Implementation status (18 October 2026):** the tile-by-tile game engine described here is planned and **not implemented yet**. Keep its design, invariants, and validation cases as future requirements. Current Pantheon records hand outcomes, imports external replays, calculates payments, and advances sessions. Its built-in `rrc` preset differs from the external RRC profile below; see [§18](#18-current-pantheon-implementation-and-planned-engine) before changing existing behavior.

## 1. Scope, authority, and source version

This document describes four-player riichi mahjong using the **RRC ruleset** in [MahjongPantheon/rules-ru](https://github.com/MahjongPantheon/rules-ru). It reorganizes and paraphrases the Russian material for developers of game engines, scoring services, replay validators, bots, and tournament software. It is an English engineering reference, not an official translation or a universal riichi specification.

- Source snapshot: [`aab4c76b0038375b56a5f50442c5be4d86c97674`](https://github.com/MahjongPantheon/rules-ru/tree/aab4c76b0038375b56a5f50442c5be4d86c97674), retrieved 18 October 2026.
- Source title-page edition: **version 2.0, 4 July 2026**.
- **Source rule** means behavior stated in the external `rules-ru` repository, not necessarily behavior implemented in Pantheon. **Engineering guidance** means a proposed implementation technique. **Policy gap** means the source does not fully determine a machine-level outcome; resolve it explicitly rather than silently borrowing another platform's rules.
- Physical etiquette is summarized only where it affects validation, scoring, or adjudication. Organizational committees, accreditation procedures, and duplicate mahjong are outside this reference's game-engine scope.

For Pantheon work, the event's stored `RulesetConfig` and current implementation determine existing behavior. The external source snapshot remains the authority for the source-based reference in §§2–14; it must not silently replace event configuration. The planned engine design in §§15–17 is retained for future implementation. This audit checks the reference against local code; it does not re-certify the external translation or source snapshot.

### Source map

All links below are pinned to the inspected commit.

| Key | Source | Coverage |
|---|---|---|
| B | [Basic rules and complete yaku list](https://github.com/MahjongPantheon/rules-ru/blob/aab4c76b0038375b56a5f50442c5be4d86c97674/chapters/basic-rules.tex) | Tiles, flow, calls, riichi, furiten, scoring, penalties, yaku |
| T | [Tournament rules](https://github.com/MahjongPantheon/rules-ru/blob/aab4c76b0038375b56a5f50442c5be4d86c97674/chapters/tournament-rules.tex) | Action procedures, disclosures, corrections |
| N | [Rules comparison appendix](https://github.com/MahjongPantheon/rules-ru/blob/aab4c76b0038375b56a5f50442c5be4d86c97674/chapters/notes.tex) | Explicit RRC defaults and edge cases |
| V | [Permitted variations](https://github.com/MahjongPantheon/rules-ru/blob/aab4c76b0038375b56a5f50442c5be4d86c97674/chapters/variations.tex) | Optional rule profiles |
| O | [Tournament organization guidance](https://github.com/MahjongPantheon/rules-ru/blob/aab4c76b0038375b56a5f50442c5be4d86c97674/chapters/tournaments.tex) | Session timer |
| L | [Online tournament guidance](https://github.com/MahjongPantheon/rules-ru/blob/aab4c76b0038375b56a5f50442c5be4d86c97674/chapters/online.tex) | Platform deviations and identity mapping |
| F | [Full compilation entry point](https://github.com/MahjongPantheon/rules-ru/blob/aab4c76b0038375b56a5f50442c5be4d86c97674/full.tex) | Status and inclusion of supplementary chapters |

B, T, and N are included in the main rules document. V is included in the full collection and separately published variations. F identifies the later supplementary sections, including O and L, as community guidance not yet officially approved. Keep that distinction when building tournament policy.

### Navigation

- [Default profile](#2-default-rrc-profile) · [Tiles and terminology](#3-vocabulary-and-tile-representation) · [Setup](#4-setup-wall-and-turn-order)
- [Winning shapes](#5-valid-hand-shapes-and-winning-eligibility) · [Calls and kans](#6-calls-and-response-resolution) · [Tenpai and furiten](#7-tenpai-and-furiten)
- [Riichi and deposits](#8-riichi-deposits-and-ippatsu) · [Yaku catalog](#9-yaku-catalog) · [Dora](#10-dora)
- [Scoring and pao](#11-fu-limits-and-hand-payments) · [Draws and match end](#12-draws-repeat-counters-and-end-of-match) · [Penalties](#13-invalid-actions-dead-hands-and-chombo)
- [Optional profiles](#14-optional-profiles-and-tournament-integration) · [Service model](#15-suggested-service-model-and-evaluation-pipeline) · [Validation cases](#16-suggested-validation-cases) · [Unresolved policy decisions](#17-decisions-to-resolve-before-production) · [Current implementation and planned engine](#18-current-pantheon-implementation-and-planned-engine)

## 2. Default RRC profile

Sources: B; N, “Краткая сводка отличий от популярных наборов правил”; V.

These are the **external source defaults**, not the defaults returned by Pantheon's `RulesetEntity.createRuleset('rrc')`. See §18 for the differences.

| Setting | Default |
|---|---|
| Players and match | Four players; East and South rounds, a hanchan |
| Tile set | 136 tiles; one red five in each suit |
| Starting points | 30,000 per player |
| Uma, ranks 1–4 | +30,000 / +10,000 / −10,000 / −30,000 |
| Oka | 0 |
| Open tanyao | Allowed |
| Atozuke | Allowed: not every structural wait needs to provide a yaku |
| Kuikae | Prohibited |
| Minimum hand | At least one yaku; no two-han minimum |
| Ron on one discard | Multiple winners allowed, including three |
| Atamahane / head bump | Disabled |
| Abortive draws | Disabled |
| Nagashi mangan | Disabled |
| Bankruptcy termination | Disabled; negative scores are allowed |
| West-round extension | Never |
| Agariyame | Disabled: a leading final dealer cannot stop merely because they win |
| Dealer repeat | Dealer wins, or dealer is tenpai at an exhaustive draw |
| Honba | 300 per winner; on tsumo, 100 from each opponent |
| Exhaustive-draw transfer | Total 3,000 between noten and tenpai players |
| Dora | Visible, kan, ura, kan-ura, and red dora enabled |
| Kan-dora timing | Immediate; see the physical-timing qualification in §6 |
| Kiriage mangan | Disabled |
| Counted yakuman / kazoe | Enabled at 13+ han |
| Natural yakuman stacking | Enabled |
| Renhou | Standalone mangan, unless ordinary valuation is higher |
| Pao | Daisangen and daisuushii; not suukantsu |
| Responsibility for rinshan | Disabled |
| Double seat/round-wind pair | 4 fu |
| Riichi wall requirement | At least four live-wall tiles remain |
| Temporary furiten ends | On the player's next discard, not their next draw |
| Kokushi robbing an ankan | Allowed |
| Chombo | −40,000 after uma for the default uma |

Store the ruleset identifier and source revision alongside every match. A generic `riichi=true` flag does not describe these decisions sufficiently.

## 3. Vocabulary and tile representation

Source: B, “Начало игры”, “Ход раздачи”, and “Объявления в игре”. Notation below is engineering guidance.

| Term | Meaning |
|---|---|
| Hand / deal / kyoku | One deal, ending in a win, draw, or replay after chombo |
| Round / bakaze | Prevailing wind: East, then South |
| Turn circuit | Progress around the players; calls may interrupt it |
| Dealer / oya | Current East seat |
| Non-dealer / ko | Any other seat |
| Menzen / closed | No meld called from another player's discard; concealed kans preserve closure |
| Tenpai | One tile from a complete permitted shape; see §7 for availability |
| Noten | Not tenpai, or treated as noten by disclosure or penalty rules |
| Ron | Win on another player's discard, or an eligible robbed kan tile |
| Tsumo | Win on one's own draw, including a kan replacement draw |
| Honba | Repeat/draw counter used to increase payments |
| Riichi pot / kyotaku | Outstanding 1,000-point riichi deposits |

For the planned engine, use 34 logical tile types and 136 physical identities. Suggested notation (not an existing Pantheon API schema):

- `1m`–`9m`: characters/manzu; `1p`–`9p`: circles/pinzu; `1s`–`9s`: bamboo/souzu.
- `1z` East, `2z` South, `3z` West, `4z` North, `5z` white dragon, `6z` green dragon, `7z` red dragon.
- `0m`, `0p`, `0s`: red fives, structurally identical to `5m`, `5p`, `5s`.
- **Terminals:** suit ranks 1 and 9. **Honors:** winds and dragons. **Simples:** suit ranks 2–8.

A red five replaces an ordinary five: there are still four fives of each suit. Compare normalized tile types for sequences, triplets, waits, furiten, and kuikae; retain red identity for dora and replay fidelity.

## 4. Setup, wall, and turn order

Source: B, “Подготовка к игре”, “Ход раздачи”; T, “Начало игры”.

Seats and turns run counterclockwise **East → South → West → North**. Seats change between deals; physical players do not move. Preserve each player's initial seat separately from their current seat wind.

A physical wall contains four sides, each 17 stacks of two tiles. The dealer rolls two six-sided dice once. Count sides counterclockwise, starting with the dealer as one; the selected player counts the dice sum in stacks from their wall's right end and makes the break. The seven stacks behind the break form the **14-tile dead wall**. Normal wall consumption proceeds clockwise, upper tile before lower tile in each stack, across corners continuously.

The initial dora indicator is the upper tile of the third dead-wall stack from the replacement-draw end. The first two stacks provide the four replacement tiles; the remaining five stacks provide up to five visible indicators and their ura indicators.

Deal three rounds of four tiles per player in seat order, producing 12 each. Number the next six tiles in normal wall consumption order: the dealer receives tiles 1 and 5, South tile 2, West tile 3, and North tile 4; tile 6 is the next normal draw. This reproduces the physical dealer's split final pickup. The dealer starts with 14 tiles and everyone else with 13. The live wall then contains **69 tiles**.

The dealer acts first by discarding, with no additional draw. Each ordinary subsequent turn draws one live-wall tile, then discards one tile. A player may discard the drawn tile. Calls can replace the ordinary turn order (§6).

**Engineering guidance:** a simulator may shuffle a linear wall and deal directly, but document its ordering if reproducing physical records or deterministic seeds. Randomness and network protocols are service design choices, not specified by the source.

## 5. Valid hand shapes and winning eligibility

Sources: B, “Принцип яку”, “Объявления победы”, “Cписок яку”; N.

A normal complete hand contains **four sets and one pair**:

- Sequence: three consecutive ranks in one suit, e.g. `345p`. Honors cannot form sequences, and ranks do not wrap.
- Triplet: three tiles of one logical type.
- Declared kan: four tiles of one logical type, occupying one set position.
- Pair: two tiles of one logical type.

A physical tile participates in exactly one group. Four identical undeclared tiles are not automatically a kan; they may participate in other decompositions.

There are two special shapes, both closed: **chiitoitsu** (seven distinct pairs; four identical tiles do not make two pairs) and **kokushi musou** (all 13 distinct terminal/honor types plus one duplicate).

With `k` declared kans, a complete hand contains `14 + k` physical tiles. For shape validation, treat each kan as a single set. A player's hand between turns normally contains `13 + k` physical tiles, including declared melds.

A legal win requires:

1. A complete shape using the specified winning tile.
2. At least one qualifying yaku, including an applicable natural yakuman or renhou. Dora alone never qualifies.
3. An appropriate win event: one's own draw for tsumo; an opponent's discard or eligible kan robbery for ron.
4. No dead-hand restriction, and no applicable furiten for ron.
5. Any profile-specific restrictions and action timing are satisfied.

Ron does **not** open the entire hand. However, a triplet completed by ron is treated as open for triplet fu and concealed-triplet yaku. This distinction is essential for sanankou and suuankou.

Evaluate all valid decompositions and winning-tile placements. Choose the interpretation yielding the highest hand payment. Yaku and fu must come from that same interpretation; never combine favorable elements from incompatible decompositions.

## 6. Calls and response resolution

Sources: B, “Объявления в игре”, “Приоритет объявлений”, “Завершение раздачи”; T, “Объявления”.

### 6.1 Discard calls

| Call | Conditions | Result |
|---|---|---|
| Chi | Caller is next in turn after discarder; two concealed tiles complete a sequence with the discard | Fixed open sequence; caller discards without drawing |
| Pon | Any opponent; two matching concealed tiles | Fixed open triplet; caller discards without drawing |
| Daiminkan | Any opponent; three matching concealed tiles | Fixed open kan; replacement sequence below |
| Ron | Eligible winning hand and no furiten | Deal ends; settle every valid winner |

After chi or pon, the turn continues from the caller's next seat; skipped players do not receive draws. Melds are fixed and cannot be rearranged. Record the caller, supplier, called physical tile, and chronological order. A claimed discard remains part of its original player's discard **history**, even though its physical tile now belongs to a meld.

Call priority is **ron > pon/kan > chi**. Multiple valid ron claims all succeed in the default profile. Source B allows a valid ron to remain even if another purported winner is invalid.

### 6.2 Kuikae

Immediately after a call, a caller cannot discard the called tile's logical type. After chi, they also cannot discard the alternative tile type that would complete the same two consumed tiles into a sequence.

Example: calling `5m` with concealed `3m 4m` prohibits an immediate discard of both `5m` and `2m`. Calling `3m` with `4m 5m` prohibits both `3m` and `6m`. A pon of `5p` prohibits discarding another `5p`, including a red five.

### 6.3 Kans

| Type | Construction | Timing and closure |
|---|---|---|
| Ankan | Four matching concealed tiles | After one's draw, before discard; preserves closed status |
| Daiminkan | Three concealed tiles plus an opponent's discard | Discard response; opens hand |
| Shouminkan / added kan | Add one concealed matching tile to one's existing open pon | After one's draw, before discard; remains open |

Ankan and shouminkan cannot be declared immediately after chi or pon. They can follow a previous kan's replacement draw. Riichi permits only the restricted ankan described in §8.

There may be **at most four completed kans across the whole table**. With abortive draws disabled, four kans by different players do not end the deal, but a fifth kan remains impossible.

For an unrobbed kan:

1. Establish the declared kan and preserve its provenance.
2. Reveal the next visible kan-dora indicator.
3. Draw the next replacement tile from the dead wall.
4. Transfer the final live-wall tile to the dead wall, preserving its size at 14.
5. Permit another legal kan, a replacement-draw tsumo, or a discard.

Each replacement draw removes one further tile from future normal drawing. Initially there is one visible dora indicator; after four completed kans there are five.

B requires revealing the indicator before the replacement draw. T permits a physical delay until after that draw, provided it occurs before the discard. Both require the new indicator to count for a win on that replacement draw. An automated engine can reveal before drawing for a deterministic order.

### 6.4 Robbing a kan

A tile used to upgrade an open pon may be claimed for ron (**chankan**). If robbed, the upgrade does not complete, no new kan-dora indicator is activated, and there is no replacement draw for that kan.

**Kokushi musou alone** may also win on a tile exposed in an ankan declaration. The source's chankan yaku definition specifically covers added kans; an ankan-robbery kokushi is already a natural yakuman.

**Engineering guidance:** model kan declaration as pending, allow robbery responses, then commit the kan and its side effects only if no valid ron succeeds.

### 6.5 Final-wall restrictions

No meld call is permitted on the final discard after the live wall has been exhausted; only ron is available. No further kan is permitted on the final drawn tile. B permits a kan on the penultimate drawn/discarded tile, in which case its replacement becomes the final draw and no subsequent kan is allowed. Require both an unused replacement tile and a live-wall tile that can replenish the dead wall.

A win on a replacement tile is rinshan, never haitei, even if it is the final draw. A ron on the final discard can qualify for houtei.

### 6.6 Response windows: source versus digital protocol

The physical source distinguishes deadlines: ordinary meld calls close when the next player draws and integrates the tile; ordinary ron may be declared until immediately before the next player's discard, but must be declared before a competing caller takes the tile into a meld. Added-kan robbery may be declared after the tile is added and before the kan declarer's discard, next kan, or win declaration.

These physical deadlines do not directly specify a concurrent network protocol. **Engineering guidance:** freeze each discard/kan response window until all eligible players respond or a documented timeout expires. Collect ron claims before committing lower-priority actions. This is a proposed digital procedure, not a literal source timing rule; publish timeout, disconnection, and late-response behavior.

## 7. Tenpai and furiten

Sources: B, “Объявления победы”, “Фуритен и временный фуритен”; N.

### 7.1 Structural waits and formal tenpai

Define a structural wait as a logical tile type that completes a permitted hand shape. Tenpai at an exhaustive draw does not require a yaku (**formal tenpai is allowed**), and furiten does not make a player noten.

Tiles visible in opponents' discards or melds do not by themselves remove formal tenpai. However, a hand is not tenpai when **all possible completing tiles are already in that player's own hand, including their own declared melds**. Do not accept a hypothetical fifth copy of a tile as a completion.

Keep structural completion, ability to declare a particular win, and draw-settlement tenpai as separate predicates.

### 7.2 Discard furiten

If any current structural wait type occurs anywhere in the player's own discard history, the player cannot ron on **any** wait. Include discards subsequently claimed into opponents' melds. Normalize red and ordinary fives.

A wait that would complete the shape but provide no yaku still matters. Atozuke does not remove furiten. Changing the hand so that no current structural wait appears in one's discard history can remove discard furiten.

### 7.3 Temporary and riichi furiten

If an opponent discards a tile completing the player's structural shape and the player does not ron, temporary furiten prevents subsequent ron. The source frames this in terms of completing the shape; do not restrict it to opportunities with a yaku.

Temporary furiten ends **after the affected player's next discard**. Drawing alone does not clear it. A chi/pon followed by that player's discard can therefore clear it. If the player has declared riichi, missed-win furiten persists until the end of the deal.

All these furiten restrictions prohibit ron, not tsumo. Declaring riichi while already in discard furiten is permitted.

**Policy gap:** B states temporary furiten using opponents' discards and does not explicitly define passing a kan-robbery opportunity or declining a self-draw win after riichi. Define those transitions separately; do not present a platform convention as an explicit RRC rule.

## 8. Riichi, deposits, and ippatsu

Source: B, “Риичи”, “Cписок яку”; T, “Объявление риичи”; N; V, “Банкротство”.

Riichi requires a closed hand that remains tenpai after the declaration discard, with **at least four live-wall tiles remaining**. An existing ankan does not open the hand. The default profile has no bankruptcy restriction requiring a positive balance or 1,000 points on hand; V introduces the balance restriction as part of the optional bankruptcy rule.

The source procedure is declaration, sideways discard, then a **1,000-point deposit**. If that discard is won by ron, the declaration deposit is not committed. If the discard is called into a meld, the riichi remains; the next discard is displayed sideways in physical play to retain the marker.

After accepted riichi:

- The concealed composition is locked; normally every new draw must be discarded unless it is used for a legal win.
- Chi, pon, daiminkan, and added kan are prohibited.
- Ankan is allowed only using the newly drawn fourth copy of a concealed triplet, and only if it changes neither the waits nor the possible interpretations of the sets.
- Matching the wait set alone is insufficient to validate that ankan.
- The deposit is subtracted from the player's score and held separately until awarded or refunded.

Example of an illegal post-riichi kan: `2399m333444555s`. Drawing another `3s`, `4s`, or `5s` does not justify a kan: the block can represent either three triplets or three `345s` sequences, and declaring a kan destroys one interpretation even if the wait set remains unchanged.

**Double riichi:** declaration on the player's first turn before any set call interrupts the opening circuit; worth 2 han in total, represented in B as riichi plus one additional han.

**Ippatsu:** an additional han for a win during the first uninterrupted circuit following riichi. A set declaration interrupts it, including a concealed kan. B explicitly allows chankan to combine with ippatsu if no earlier set call interrupted the circuit: a robbed added kan has not completed.

**Engineering guidance:** track first-turn eligibility and ippatsu as explicit event-dependent state. The usual operational window includes the declarer's next draw and ends at their subsequent discard if no win occurs. Publish precise boundary handling alongside the response-window policy.

### Deposit allocation

- Single winner: takes all outstanding deposits, including their own current deposit if any.
- Exhaustive draw: deposits remain in the pot for a later winner.
- Double/triple ron: **first return each winning player's own outstanding riichi deposit to that winner**. Award all other deposits to the valid winner nearest to the discarder in subsequent turn order.
- Chombo replay: refund deposits made in the interrupted deal to their owners; keep earlier carried deposits distinct (§13).
- End of match: award remaining deposits to the points leader, or divide equally between tied leaders (§12).

Example: South and West both declared riichi and both ron East; North also declared riichi. With no older deposits, South receives their own 1,000 plus North's 1,000; West receives their own 1,000. Hand payments and honba are settled separately.

## 9. Yaku catalog

Source: B, “Cписок яку” and “Сочетаемость яку”. Names below use common English romanizations. A dash means unavailable with an open hand. Closed values already include the source's closed-hand additions.

### 9.1 Ordinary yaku

| Yaku | Closed han | Open han | Required condition |
|---|---:|---:|---|
| Riichi | 1 | — | Valid riichi declaration |
| Double riichi | 2 total | — | Riichi on first uninterrupted turn; do not add another riichi han |
| Ippatsu | 1 | — | Win in the uninterrupted riichi opportunity window |
| Menzen tsumo | 1 | — | Self-draw win with closed hand |
| Pinfu | 1 | — | Four sequences, pair with no value-pair fu, winning tile completes a two-sided sequence wait |
| Iipeikou | 1 | — | Two identical sequences; excluded by ryanpeikou and chiitoitsu |
| Tanyao | 1 | 1 | Only simples |
| Sanshoku doujun | 2 | 1 | Same sequence ranks in all three suits |
| Ittsu | 2 | 1 | `123`, `456`, and `789` sequences in one suit |
| Yakuhai: dragons | 1 each | 1 each | Triplet/kan of each qualifying dragon |
| Yakuhai: seat wind | 1 | 1 | Triplet/kan of current seat wind |
| Yakuhai: round wind | 1 | 1 | Triplet/kan of prevailing wind; adds to seat-wind han if identical |
| Chanta | 2 | 1 | Every set and pair contains a terminal or honor; at least one sequence and at least one honor |
| Rinshan kaihou | 1 | 1 | Win on kan replacement draw |
| Chankan | 1 | 1 | Ron on the tile used to upgrade an opponent's open pon |
| Haitei raoyue | 1 | 1 | Win on final live-wall draw; incompatible with rinshan |
| Houtei raoyui | 1 | 1 | Ron on final discard of deal |
| Chiitoitsu | 2 | — | Seven distinct pairs; fixed 25 fu |
| Sanshoku doukou | 2 | 2 | Same-rank triplets/kans in all three suits |
| Sanankou | 2 | 2 | Three concealed triplets/kans; fourth set may be open |
| Sankantsu | 2 | 2 | Three declared kans |
| Toitoi | 2 | 2 | Four triplets/kans and a pair |
| Honitsu | 3 | 2 | One suit plus honors |
| Shousangen | 2 | 2 | Two dragon triplets/kans and the remaining dragon as pair; stacks with dragon yakuhai |
| Honroutou | 2 | 2 | Only terminals and honors; can use seven-pairs shape |
| Junchan | 3 | 2 | Every set and pair contains a terminal; no honors; at least one sequence |
| Ryanpeikou | 3 | — | Two disjoint pairs of identical sequences; excludes iipeikou and chiitoitsu |
| Chinitsu | 6 | 5 | Tiles from one suit only |

### 9.2 Renhou

Renhou is a non-dealer's ron before their first turn in the opening circuit, provided no set call has interrupted it. It supplies a standalone **mangan** valuation and does not add han to other yaku. If the hand's independent value exceeds mangan, use that higher value. Evaluate dora and other yaku in that independent valuation normally; do not add them to the renhou mangan itself.

### 9.3 Natural yakuman

| Yakuman | Condition |
|---|---|
| Kokushi musou | All 13 terminal/honor types plus a duplicate; closed; may rob a concealed kan |
| Chuuren poutou | Closed single-suit `1112345678999` plus one additional tile of that suit |
| Tenhou | Dealer wins with the initial dealt hand, before a turn action changes it |
| Chiihou | Non-dealer wins on their first self-draw in an opening circuit uninterrupted by set calls |
| Suuankou | Four concealed triplets/kans; a ron-completed triplet is not concealed, so ron requires completion of the pair |
| Suukantsu | Four declared kans |
| Ryuuiisou | Only `2s 3s 4s 6s 8s` and green dragon; green dragons are optional |
| Chinroutou | Only terminal tiles |
| Tsuuiisou | Only honor tiles |
| Daisangen | All three dragon triplets/kans |
| Shousuushii | Three wind triplets/kans and the fourth wind as pair |
| Daisuushii | All four wind triplets/kans |

Natural yakuman combine **only with other natural yakuman**. Ordinary yaku and dora do not add to a natural-yakuman payment. Multiple natural yakuman stack.

The source does not award extra units for special waits such as 13-sided kokushi, pure nine gates, or suuankou tanki, and does not label daisuushii a double yakuman. A source-based implementation should award one unit per listed natural yakuman, stacking distinct compatible yakuman; record this interpretation explicitly in the profile. Counted yakuman is capped at the 13+ han tier rather than repeated for 26+ han.

### 9.4 Combining and interpreting yaku

All compatible yaku add unless an exclusion applies. Do not count chiitoitsu with sequence-based iipeikou/ryanpeikou; do not count iipeikou in addition to ryanpeikou; do not count chanta in addition to junchan. Honitsu requires honors, so it does not add to chinitsu.

For `34s222333444p99m` winning on `2s`, the pin block can be three sequences or three triplets. The sequence interpretation gives pinfu + iipeikou, 2 han / 30 fu on closed ron; the triplet interpretation gives sanankou, 2 han / 50 fu. The latter has the higher payment. Never award all three yaku together.

## 10. Dora

Source: B, “Дора”.

An indicator identifies the next tile in its own cycle:

| Indicator family | Cycle |
|---|---|
| Suited tiles | `1 → 2 → … → 9 → 1`, within the same suit |
| Winds | East → South → West → North → East |
| Dragons | White → Green → Red → White |

Every copy in the winning hand, including melds and all four kan tiles, receives one bonus han for **each active indicator** pointing to its type. Duplicate indicators stack. The indicator tile itself is not necessarily a dora.

- Initial indicator and completed-kan indicators apply to every winner.
- Ura indicators are the tiles beneath the initial and activated kan indicators. They apply only to winners with accepted riichi.
- Each red five gives one additional bonus han, independent of indicators.
- A red five can simultaneously be ordinary dora and ura dora, with all bonuses adding.

Dora never supplies the yaku needed for eligibility. Keep qualifying-yaku han and dora han separate in API results.

## 11. Fu, limits, and hand payments

Source: B, “Подсчет стоимости руки и порядок выплат”, “Подсчет очков в руке”, “Правило пао”; N.

### 11.1 Fu

Chiitoitsu is **exactly 25 fu**, with no additions and no rounding. For a normal shape, start with 20 fu, adding 10 for a closed ron, then apply the following:

| Feature | Open set fu | Concealed set fu |
|---|---:|---:|
| Simple triplet | 2 | 4 |
| Terminal/honor triplet | 4 | 8 |
| Simple kan | 8 | 16 |
| Terminal/honor kan | 16 | 32 |

A ron-completed triplet uses the open column, even when the hand is otherwise closed. Sequences give no set fu.

| Other feature | Added fu |
|---|---:|
| Dragon pair | 2 |
| Seat-wind pair | 2 |
| Round-wind pair | 2; combines with seat wind for 4 total |
| Kanchan, middle completion, e.g. `35` waiting on `4` | 2 |
| Penchan, edge completion: `12` on `3` or `89` on `7` | 2 |
| Tanki, pair completion | 2 |
| Ryanmen, two-sided sequence completion | 0 |
| Shanpon, completion of one of two pairs into a triplet | 0 wait fu; triplet fu still applies |
| Tsumo | 2, except pinfu tsumo |
| Open ron with no other fu beyond base 20 | 2, producing rounded 30 fu |

Round the normal total **up to the next multiple of 10**, including leaving an exact multiple unchanged. Pinfu tsumo is 20 fu; closed pinfu ron is 30 fu. Do not add two wait bonuses to a single winning-tile placement.

If han already establishes a limit tier, fu does not affect payment. Natural yakuman and renhou do not require an ordinary fu calculation for their special valuations.

### 11.2 Base points and limits

For an ordinary hand with fewer than 5 han:

```text
raw_base = fu × 2^(han + 2)
base = min(raw_base, 2000)
ceil100(x) = 100 × ceil(x / 100)
```

The `+2` exponent is **bazoro**, a mathematical constant here, not two yaku han and not a way to satisfy the yaku requirement.

| Valuation | Base points |
|---|---:|
| Mangan: 5 han, or lower-han formula reaches the cap | 2,000 |
| Haneman: 6–7 han | 3,000 |
| Baiman: 8–10 han | 4,000 |
| Sanbaiman: 11–12 han | 6,000 |
| Kazoe yakuman: 13+ han | 8,000 |
| Natural yakuman | 8,000 × number of compatible yakuman units |

There is **no kiriage mangan**: 4 han / 30 fu and 3 han / 60 fu use base 1,920, yielding 7,700 non-dealer ron or 11,600 dealer ron.

### 11.3 Payments before honba and deposits

| Winner/event | Payment |
|---|---|
| Non-dealer ron | Discarder pays `ceil100(4 × base)` |
| Dealer ron | Discarder pays `ceil100(6 × base)` |
| Non-dealer tsumo | Dealer pays `ceil100(2 × base)`; each other opponent pays `ceil100(base)` |
| Dealer tsumo | Each opponent pays `ceil100(2 × base)` |

Round **each individual payment** after applying its multiplier. Do not derive tsumo payments by dividing a rounded ron payment.

| Tier | Non-dealer ron | Non-dealer tsumo: each non-dealer / dealer | Dealer ron | Dealer tsumo: each |
|---|---:|---:|---:|---:|
| Mangan | 8,000 | 2,000 / 4,000 | 12,000 | 4,000 |
| Haneman | 12,000 | 3,000 / 6,000 | 18,000 | 6,000 |
| Baiman | 16,000 | 4,000 / 8,000 | 24,000 | 8,000 |
| Sanbaiman | 24,000 | 6,000 / 12,000 | 36,000 | 12,000 |
| Single yakuman | 32,000 | 8,000 / 16,000 | 48,000 | 16,000 |

### 11.4 Honba and multiple ron

For current honba `h`:

- Ron: discarder additionally pays **300 × h to every valid winner**.
- Tsumo: each opponent additionally pays **100 × h**.

Settle each ron winner's hand independently, then allocate deposits under §8. A dealer who is any one of multiple winners retains dealership.

### 11.5 Pao: responsibility payments

A player becomes responsible when their discard permits an opponent with two declared dragon triplets/kans to call the third, or with three declared wind triplets/kans to call the fourth. Track this at the triggering call, including supplier identity and yakuman type. Responsibility is possible even if the supplier had declared riichi.

If the associated yakuman is ultimately won:

- Tsumo: responsible player pays the full ron-equivalent amount instead of splitting ordinary tsumo payments across opponents.
- Ron from a different opponent: responsible player and winning-tile discarder split the relevant payment equally.
- Ron from the responsible player: that player bears the full payment.
- Honba: responsible player pays it on tsumo; winning-tile discarder pays it on ron.

There is no pao for suukantsu and no additional responsibility for supplying a daiminkan that leads to rinshan. If the relevant yakuman is not won, the responsibility marker causes no payment.

**Policy gap:** the source permits stacked yakuman but does not specify whether pao redirects the entire stacked payment or only the responsible yakuman component, nor all multi-winner combinations. Keep liability per yakuman component in the data model and require a documented settlement policy for these cases.

## 12. Draws, repeat counters, and end of match

Sources: B, “Завершение раздачи”, “Хонба”, “Смена дилера”, “Финальный расчет очков”; N.

### 12.1 Exhaustive draw

After the final discard's ron window closes with no winner, settle an exhaustive draw. Players disclose tenpai in current seat order East, South, West, North. A non-riichi player may decline to reveal and be counted noten. A riichi player must reveal. A dead hand is noten regardless of actual structure or riichi.

| Number counted tenpai | Transfer |
|---:|---|
| 0 or 4 | None |
| 1 | Each noten player loses 1,000; tenpai player gains 3,000 |
| 2 | Each noten player loses 1,500; each tenpai player gains 1,500 |
| 3 | Sole noten player loses 3,000; each tenpai player gains 1,000 |

Riichi deposits remain on the table. With defaults, terminal/honor-only discards do not create nagashi mangan, and opening conditions do not create abortive draws.

### 12.2 Dealer and honba transitions

| Outcome | Dealer | Honba for next deal |
|---|---|---|
| Dealer among winners | Retains seat | Current honba + 1 |
| Exhaustive draw, dealer counted tenpai | Retains seat | Current honba + 1 |
| Exhaustive draw, dealer counted noten | Advances | Current honba + 1 |
| Win with no dealer winner | Advances | Reset to 0 — see qualification below |
| Chombo replay | Unchanged | Unchanged |

On dealer advancement: South becomes East, West becomes South, North becomes West, and East becomes North. The round changes from East to South when initial dealership has completed one circuit. The match ends when the South circuit finishes; repeat deals may extend South 4.

B explicitly adds a honba on dealer wins and draws. It does **not expressly state the reset after a non-dealer win**. Resetting to zero is the conventional transition used in the table above and is an **engineering assumption requiring confirmation** for a strictly source-only implementation.

There is no early stop for a leading dealer's win, no stop at a negative score, and no West extension to reach a target score.

### 12.3 Final result and ties

After the last deal:

1. Determine the leader(s) by current in-game points.
2. Award outstanding deposits to the sole leader, or split them equally among tied leaders.
3. For each player, subtract the starting points.
4. Add the placement uma.
5. Subtract recorded post-uma penalties.

For ties, average the uma values of the occupied positions. Two players tied for second and third each receive `(10,000 − 10,000) / 2 = 0`. Two tied for first and second each receive +20,000. There is no initial-seat tie-break in the described default scoring.

```text
final_result = ending_points_after_pot_award − starting_points
               + averaged_uma − post_uma_penalties
```

The source expresses results in point units. Dividing by 1,000 for display or external ranking is a separate service convention.

**Policy gap:** equal pot splitting can create fractions, e.g. a 1,000-point pot among three tied leaders. The source requires equal division but does not specify physical-stick rounding. Use exact rational or appropriately precise accounting unless the tournament publishes a rounding rule; do not arbitrarily favor a seat.

## 13. Invalid actions, dead hands, and chombo

Sources: B, “Нарушения и штрафы”; T, “Объявления”.

An online engine can reject an illegal command before it changes state. That is an **engineering safeguard**, not a source rule requiring every rejected API request to trigger a physical-tournament penalty. A scoring or referee service must also support adjudicated violations discovered after play proceeds.

### 13.1 Dead hand

A dead-hand player continues drawing and discarding but may make no meld call, win declaration, or riichi declaration. At a draw, the hand counts noten even if structurally tenpai or previously riichi.

Source examples include an incorrect meld not corrected before discard, an invalid win declaration without exposing the hand, procedural/otherwise invalid riichi, changing or attempting to change a riichi hand, kuikae, and an incorrect tile count.

An incorrect meld corrected before discard does not receive this penalty. An immediately withdrawn empty chi/pon/kan declaration, with no tiles shown, is not penalized in B. T cancels a procedurally invalid riichi and returns its deposit while assigning a dead hand; this differs from structurally noten riichi discovered at a draw.

### 13.2 Chombo

Chombo interrupts the deal and causes a replay with the same dealer and no extra honba. The default penalty is **40,000 deducted after uma**, not points paid to opponents during the match. More generally, the source specifies twice the adjacent-rank uma step; for +15,000/+5,000/−5,000/−15,000 the penalty is 20,000.

Source examples:

- Invalid win followed by full exposure: incomplete hand, no yaku, wrong winning tile, or furiten ron.
- Noten riichi, adjudicated at an exhaustive draw. A correctly declared riichi subsequently made dead is treated as noten instead of receiving chombo for that alone.
- Illegal post-riichi ankan, adjudicated if that player wins or at a draw.
- Concealing a riichi hand instead of revealing at a draw.
- Attempting a declaration with a dead hand.
- A player's error making continued play impossible.

Multiple players can receive chombo simultaneously. If a valid opponent win occurs simultaneously with chombo, **the valid win takes precedence and chombo is not applied**.

Refund the riichi deposits belonging to the interrupted deal. **Engineering guidance:** preserve the pot carried into that deal separately; a replay should restore the deal-start pot, honba, and dealer while retaining any recorded post-uma penalty. The source does not explicitly describe historical-pot bookkeeping, so retain this as an explicit rollback policy.

### 13.3 Physical disclosure effects

T requires the winning tile to remain identifiable. A ron tile stays in the original discard; a tsumo tile stays separate from the concealed hand. If a physical winner integrates a tsumo tile into their hand, T denies pinfu and wait fu. A fully recorded online engine knows the drawn tile and need not simulate that physical mistake; imported adjudicated results should preserve the ruling rather than silently recomputing another result.

## 14. Optional profiles and tournament integration

Source: V; O and L are supplementary guidance as identified in F.

The following are **not defaults**. Record enabled variations before play.

| Variation | Source behavior |
|---|---|
| No red dora | Replace red fives with ordinary fives |
| Start at 25,000 | Allowed; tournament oka remains prohibited |
| Different uma | Symmetric, evenly spaced uma permitted; update chombo amount accordingly |
| Bankruptcy | End when a player goes below zero; disallow riichi with fewer than 1,000 points |
| Atamahane | Only the eligible ron claimant nearest after the discarder wins and takes the pot |
| Reverse-mangan chombo | Dealer offender pays 4,000 to each opponent; non-dealer offender pays 4,000 to dealer and 2,000 to each other opponent; no additional post-uma chombo deduction |
| Yakitori | Player with no win receives twice the uma step as a final penalty |
| No renhou | Early ron requires another qualifying yaku |

### Optional nagashi mangan

At an exhaustive draw, a player qualifies if all their discards are terminals/honors, none was called, and their hand is not dead. Tenpai is unnecessary. Pay mangan-tsumo amounts to every qualifying player and omit ordinary noten transfers.

The source treats this as a **special draw**, not a winning hand: deposits remain, no honba bonus is paid, and dealer retention follows the dealer's tenpai status. Honba increases as for a draw. If a penalty such as noten riichi applies, it has priority. Do not infer a closed-hand requirement; the listed conditions concern discards and dead-hand status.

### Optional abortive draws

V lists these conditions:

- Identical first wind discards by all four players in an uninterrupted opening circuit.
- Kyuushu kyuuhai: on a player's first uninterrupted turn, at least nine distinct terminal/honor types; declaration is optional and unavailable to a dead hand.
- All four players successfully declare riichi, with no win on the fourth declaration discard.
- Four completed kans by different players, with no ron on the discard following the fourth kan. Four kans by one player do not trigger this condition.
- A separately selectable variant treats triple ron as an abortive draw.

Riichi players must reveal tenpai at an abortive draw; noten riichi causes chombo. N says an abortive draw adds honba. **Policy gap:** this material does not fully specify dealer advancement for every optional abortive condition. Configure it explicitly rather than assuming exhaustive-draw rules.

### Timer and online adapters

O proposes **75 minutes**, then finishing the current deal and playing one further deal. It also allows finishing only the current deal, with a suggested longer main interval of 85–90 minutes; in that alternative a chombo-ended deal counts as played. These are supplementary tournament policies. Define what event starts a deal and how repeats/replays interact with the cutoff; do not let a timer schedule a deal beyond the match's normal end.

L requires organizers to disclose differences when an online platform cannot implement RRC exactly. Map one playing account unambiguously to one player. Tournament registration, scheduling, disconnections, replacement bots, and platform-specific timeouts belong in a separate technical regulation. This reference does not assume an external platform implements these defaults.

## 15. Suggested service model and evaluation pipeline

This section is **planned engineering guidance**, derived from the distinctions above rather than a mandated API. The tile-level state and evaluation pipeline below are not implemented in current Pantheon; do not treat this table as the schema of `SessionStateEntity`.

### State that must remain distinguishable

| Layer | Suggested retained state |
|---|---|
| Match | Ruleset/revision, initial seats, current dealer, round and hand ordinal, scores, post-uma penalties, timer policy |
| Deal | Honba, deal-start pot, current-deal deposits with owners, wall order/cursor, live count, replacement cursor, active indicators, pending response window |
| Player | Concealed physical tiles, ordered melds, ordered discard history with claimed markers, riichi acceptance and lock, first-turn eligibility, ippatsu, temporary/riichi furiten, dead-hand status |
| Meld | Type, logical tile type(s), physical tile identities, caller, supplier, claimed tile, declaration event; added-kan link to original pon |
| Win context | Winning tile and source, winner, discarder/kan declarer, live vs replacement draw, last-tile flag, first-turn context, eligible ura indicators |
| Liability | Responsible player, triggering event, beneficiary, associated yakuman component |
| Audit | Ordered events, commands/responses, adjudications, per-component payment ledger, finalization status |

Suggested scoring pipeline:

1. Validate event phase, physical tile inventory, and winner eligibility.
2. Normalize red fives for structure while preserving physical identity.
3. Enumerate normal and special complete shapes with winning-tile placements.
4. Evaluate yaku within each interpretation, using current event context.
5. Reject interpretations with no qualifying yaku; evaluate natural yakuman separately.
6. Apply dora and fu to ordinary interpretations and compute their limit tiers.
7. Evaluate renhou's independent mangan alternative where eligible.
8. Select the highest-valued valid interpretation.
9. Resolve every accepted winner, pao policy, honba, and deposit allocation in a single settlement.
10. Apply dealer, honba, round, and match-end transitions once.

Return a breakdown: interpretation, yaku and their han, dora by category, raw/rounded fu, limit, base points, each payer's transfer, honba, deposits, liability, and any assumptions or adjudications. Distinguish an invalid claim from a legal hand worth zero additional dora.

Useful accounting invariants:

- Each of 136 physical tiles has exactly one current location. A claimed-discard history entry references its meld tile; it is not a second tile location.
- Each logical type has four physical copies, including red replacement fives.
- Closed status depends on meld provenance, not whether the winning event was ron.
- A completed kan consumes exactly one replacement draw and activates exactly one extra indicator.
- Before final penalties, `sum(player_scores) + outstanding_pot` stays equal to the initial score total, including through ordinary settlement and deposit refunds.
- Noten transfers and hand-payment transfers sum to zero. A pot award is a transfer out of the pot.
- Post-uma penalties can make final tournament results non-zero-sum; do not distribute them to opponents automatically.
- Duplicate commands or settlement retries must not charge a deposit or pay a hand twice.
- Player-facing state must not reveal concealed tiles, unrevealed ura indicators, or future wall tiles.

## 16. Suggested validation cases

These are acceptance examples for the **planned engine**, not a claim that it has been implemented or tested. Some payment/progression behavior already has focused tests in Mimir; tile-level eligibility and response-window cases remain future requirements. Unless stated otherwise, amounts exclude honba and deposits.

| Case | Expected result |
|---|---|
| Four sets plus pair, only dora and no yaku | Win rejected |
| Chiitoitsu containing four copies of one type treated as two pairs | That seven-pairs interpretation rejected |
| 1 han / 30 fu, non-dealer ron | 1,000 |
| 1 han / 30 fu, non-dealer tsumo | 300 from each other non-dealer; 500 from dealer; total 1,100 |
| 4 han / 30 fu or 3 han / 60 fu, non-dealer ron | 7,700, not mangan |
| 4 han / 30 fu, dealer ron | 11,600 |
| 3 han / 70 fu, non-dealer ron | Mangan, 8,000 |
| Closed pinfu + menzen tsumo, no other han | 2 han / 20 fu; 400 / 700 for non-dealer winner |
| Open ron with four sequences, non-value pair, two-sided completion, and some qualifying yaku | 30 fu, not 20 |
| Pair is both seat and prevailing wind | 4 pair fu |
| Three dragon triplets plus another natural yakuman | Stack natural yakuman; omit ordinary yakuhai and dora |
| 13 ordinary han, no natural yakuman | Single counted yakuman |
| Structural waits `1p` and `4p`, own history contains `1p` | Ron forbidden on both; tsumo allowed |
| That `1p` was claimed into another player's meld | Still discard furiten |
| Passed a structural completion with no yaku | Temporary furiten still applies under B's wording |
| Non-riichi player draws after passing ron, has not discarded | Temporary furiten remains |
| Non-riichi player next discards | Temporary furiten clears; discard furiten may still apply |
| Riichi player passes a completing discard | Ron blocked for remainder of deal |
| Riichi with three live-wall tiles left | Illegal |
| Riichi with four live-wall tiles left | Wall-count condition satisfied |
| Ron on a riichi declaration discard | That declaration's new 1,000 deposit is not committed |
| Two winners each have a current riichi deposit, third player also deposited | Return winners' own deposits; nearest winner takes third player's deposit |
| Post-riichi ankan preserves waits but destroys a sequence interpretation | Illegal |
| Added kan robbed | No new kan indicator, no replacement draw |
| Kokushi completion on an opponent's concealed kan tile | Ron allowed subject to furiten and timing |
| Four kans by different players, default profile | Continue; no fifth kan |
| Rinshan on final replacement draw | Rinshan applies; haitei does not |
| Two ron winners with honba 2 | Each receives 600 additional points from discarder |
| Draw with two tenpai and two noten | Each tenpai +1,500; each noten −1,500 |
| Formal tenpai with all remaining copies visible outside own hand | Can still count tenpai |
| Only completions require copies already all in own hand/melds | Noten |
| Dealer noten at draw, honba 2 | Advance dealer; next honba 3 |
| Dealer wins South 4 while leading | Repeat; no agariyame |
| Score drops below zero | Match continues under defaults |
| Chombo, default uma | Same dealer/honba replay; current-deal deposits refunded; −40,000 after uma |
| Valid win simultaneous with another player's chombo | Count win; no chombo penalty |
| Two players tied for second/third | Uma 0 each |
| Two leaders tied with a remaining 1,000-point pot | 500 to each; average first/second uma to +20,000 each |

## 17. Decisions to resolve before production

The source is written for human play and leaves some implementation boundaries incomplete. The following should be explicit in a deployed profile or tournament supplement:

1. Non-dealer-win honba reset: conventional reset to zero is assumed in §12 but not expressly written in B.
2. Digital response deadlines, timeout/pass semantics, concurrent claims, disconnect handling, and rollback boundaries.
3. Furiten transitions after passing kan robbery or declining a riichi self-draw win.
4. Exact event boundary for expiring ippatsu and treatment of canceled declarations.
5. Pao allocation with stacked yakuman and multiple winners; how already exposed concealed kans count when identifying the source's “declared” prior honor sets.
6. Single-unit treatment of named yakuman and no wait-based doubling, as inferred from the listed source awards.
7. Exact equal splitting of final deposits when integer point units cannot express it.
8. Dealer continuation for optional abortive draws; optional-rule combinations and their precedence.
9. Timer boundary definition, final-deal repeats, chombo counting, and normal match-end precedence.
10. Which human procedural penalties apply to imported physical records versus rejected online commands; treatment of invalid simultaneous claims.
11. Explicit replay bookkeeping for deposits carried in from earlier deals.

Keep these decisions versioned with the ruleset. An adapter to another mahjong platform should report deviations instead of silently treating that platform's behavior as RRC.

## 18. Current Pantheon implementation and planned engine

Verified against the working tree based on commit `661e8330` on 18 October 2026. Links in this section point to current local source. These notes describe existing behavior, not an instruction to change the external rules reference or migrate existing events.

### Current service boundary

- [Round API messages](../../Common/proto/atoms.proto) submit outcomes: ron, tsumo, multiron, draw, abort, chombo, or nagashi. Winning results carry reported han, fu, yaku IDs, bonus counts, and an optional pao player. This API does not submit each draw, discard, meld call, or response window.
- [Round validation](../../Mimir/src/helpers/roundValidation.ts) checks participants, allowed yaku IDs, and numeric values. It does not reconstruct physical tiles to prove yaku, furiten, tenpai, legal kans, or the winning shape. A numeric range check is not full hand validation.
- [PointsCalc](../../Mimir/src/helpers/PointsCalc.ts) calculates payments from supplied han/fu and rule flags. [SessionState](../../Mimir/src/helpers/SessionState.ts) advances scores, honba, dealer index, and the carried riichi pot from recorded outcomes. The [stored state](../../Mimir/src/entities/SessionState.entity.ts) has no live wall, concealed hands, ordered discards, furiten state, or pending call windows.
- [Tyr's yaku values](../../Tyr/app/helpers/yakuValues.ts) and [compatibility rules](../../Tyr/app/helpers/yakuCompatibility.ts) assist manual recording; they do not enumerate decompositions from tiles. The [online importers](../../Mimir/src/helpers/online) consume external platform records rather than run those platforms' games.

The full engine described above remains planned: wall/physical-tile ownership, move legality, response resolution, automatic shape/yaku/fu evaluation, furiten tracking, and call-derived pao liability are **not implemented yet**. The current outcome recorder and payment calculator remain the implementation to consult for existing sessions.

### Built-in `rrc` preset versus the external source profile

Source: [`RulesetEntity.createRuleset('rrc')`](../../Mimir/src/entities/Ruleset.entity.ts). Existing events store their own rules, so their configuration may differ from this factory preset as well.

| Setting | External source profile in §2 | Current Pantheon `rrc` preset |
| --- | --- | --- |
| Starting points | 30,000 | 30,000 |
| Uma | +30,000 / +10,000 / −10,000 / −30,000 | +15,000 / +5,000 / −5,000 / −15,000 |
| Chombo deduction after uma | 40,000 | `chomboAmount: 20000` |
| Abortive draws | Disabled | `withAbortives: true` |
| Nagashi mangan | Disabled | `withNagashiMangan: false` |
| Multiple ron / head bump | Multiple winners / disabled | `withAtamahane: false`; all winners receive honba; winners recover their own current deposits and the nearest winner receives the rest |
| Counted / stacked natural yakuman | Enabled / enabled | `withKazoe: true`, `withMultiYakumans: true` |
| Kiriage / bankruptcy / leading-dealer finish / extra rounds | Disabled | Corresponding flags are false |
| Pao yaku | Daisangen, daisuushii | Same yaku list; settlement limitations below still apply |
| Timed ending | Supplementary tournament policy | `endingPolicy: ENDING_POLICY_EP_ONE_MORE_HAND`, `chomboEndsGame: true` |

`chomboEndsGame` affects timed termination in [SessionModel.updateSessionState](../../Mimir/src/models/SessionModel.ts); it does **not** mean every chombo immediately ends a session. With the preset's one-more-hand policy, chombo can finish the session after time expires and the last-hand marker has already been set.

### Existing accounting and representation differences

- **Han and fu:** natural yakuman use negative han (`-1` for one, `-2` for two, etc.); counted yakuman use positive han of at least 13 when enabled. Current validation accepts nonzero han from −6 through 32. Limit hands may carry `fu = 0`. Do not encode a natural yakuman as ordinary 13 han or derive API IDs from the yaku catalog's order.
- **Identifiers and spelling:** use the numeric IDs in [Mimir's yaku enum](../../Mimir/src/helpers/yaku.ts) and [Tyr's yaku definitions](../../Tyr/app/helpers/yaku.ts). API and state fields use `tempai`, although the prose uses the standard spelling tenpai. Pantheon calls one hand/deal a **round** and a whole game a **session**; traditional East/South rounds are different concepts.
- **Non-dealer win:** `SessionState` already resets honba to zero and advances the dealer when no winner is dealer under the `rrc` preset. The source-only qualification in §12.2 does not make this an unresolved question about current code.
- **Abortive draw:** when enabled, `SessionState` increases honba, carries riichi deposits, and retains the dealer. The specific tile-level abort conditions are not checked by that state transition.
- **Riichi:** current-round deposits are supplied as player IDs with the outcome; the carried pot is a count of 1,000-point bets. There is no tile-by-tile riichi acceptance state or response-time deposit commitment. `PointsCalc.assignRiichiBets` handles multiple-ron allocation; historical carried deposits are aggregated without owner identity.
- **Chombo:** `SessionState` leaves dealer, honba, and carried deposits unchanged, and records the configured deduction separately; `SessionResultsModel` applies it to the final rating delta. The chombo message has one offender and no current-deal riichi list. The planned per-action refund/rollback model and simultaneous-offender adjudication are not provided by this message. `extraChomboPayments` is an independent flag: setting it does not automatically zero `chomboAmount`.
- **Pao:** the outcome supplies one `paoPlayerId` per winning result. `PointsCalc` redirects pao tsumo through its ron calculator. For ron from another player it normally splits payment in half; for a total double-yakuman amount it has a special 3:1 discarder/responsible-player split. It does not maintain the planned per-yakuman liability ledger or infer responsibility from the triggering meld.
- **Renhou:** Tyr represents it as a closed 5-han entry and includes it in the compatibility limit list. Mimir's payment calculator consumes supplied han/fu; it does not automatically compare a renhou-only mangan with an independently decomposed higher-valued hand as proposed in §9.2.
- **Final ties and deposits:** `RulesetEntity.getUma` averages tied placement bonuses when `equalizeUma` is true. This does not imply equal place labels: `SessionResultsModel.calcPlacesMap` assigns sequential places. Its remaining-pot allocation uses `100 * floor(bet_count * 10 / first_place_count)`, so exact rational division in §§12 and 17 is future guidance, not current behavior. Its tie-count logic compares players in the supplied list order; consult the implementation before assuming all tied-leader arrangements are handled.

See [SessionResultsModel](../../Mimir/src/models/SessionResultsModel.ts) for final point-unit rating deltas and additional adjustments. Display scaling is separate from this stored calculation. Existing regression coverage includes [payment tests](../../Mimir/src/helpers/PointsCalc.test.ts), [session-state tests](../../Mimir/src/helpers/SessionState.test.ts), and [ruleset tests](../../Mimir/src/entities/Ruleset.test.ts); these do not establish that the planned engine is implemented.
