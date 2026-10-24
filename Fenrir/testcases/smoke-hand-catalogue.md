# SMOKE-005 / SMOKE-006 hand catalogue

Both cases enable all 46 real yaku, multiple yakuman, and double variants Suuankou Tanki, pure nine gates, and thirteen-sided orphans. Daisuushii remains single yakuman. Pao is enabled for Daisangen and Daisuushii. Keep bankruptcy, agariyame, and additional rounds off; large negative playing scores are intentional so the catalogue can finish before South 4.

The EMA template is a starting point; these explicit overrides form a custom test ruleset. Han is an expected UI calculation, never an independently entered value. A dash for fu means the limit hand disables fu selection. Natural yakuman never includes ordinary yaku or dora. Open hand is a UI modifier, not an additional yaku.

The examples extend [Mimir development hands](../../Mimir/src/development/rounds.ts), [TestSeeder hands](../../Mimir/src/seeders/hand.ts), and [PointsCalc tests](../../Mimir/src/helpers/PointsCalc.test.ts). Combinations and fu were checked against [Tyr compatibility](../../Tyr/app/helpers/yakuCompatibility.ts), [han/fu values](../../Tyr/app/helpers/yakuValues.ts), and [selection restrictions](../../Tyr/app/store/selectors/yaku.ts). Pinfu does not combine with triplets; Ryanpeikou replaces Iipeikou/Chiitoitsu; individual yakuhai combine and double winds use one button for two awards; yakuman suppress ordinary yaku. The recorders assert the exact selected set after every hand to catch suppression.

## Hand inputs

For each sample, the current dealer wins unless the Winner column says otherwise. For ron, the discarder is the next initial-seat identity after the winner (cyclically). Declare the winner riichi on the player selection screen for H04, H18, and H19; the winner recovers their own deposit. On H27, select the player two initial seats after the winner as pao payer. Choose No pao for H29. Use the current session's round and honba, not the source fixtures' fixed values.

| Sample | Outcome | Winner                               | Hand                                                         | State  | Expected han | Fu  | Dora |
| ------ | ------- | ------------------------------------ | ------------------------------------------------------------ | ------ | ------------ | --- | ---- |
| H01    | tsumo   | Current dealer                       | Tenhou                                                       | Closed | 1 yakuman    | —   | 0    |
| H02    | tsumo   | Nondealer: next after current dealer | Chihou                                                       | Closed | 1 yakuman    | —   | 0    |
| H03    | ron     | Nondealer: next after current dealer | Renhou                                                       | Closed | 5            | —   | 0    |
| H04    | ron     | Current dealer                       | Riichi + Ippatsu + Pinfu + Iipeikou                          | Closed | 4            | 30  | 0    |
| H05    | tsumo   | Current dealer                       | Pinfu + Menzentsumo                                          | Closed | 4            | 20  | 2    |
| H06    | ron     | Current dealer                       | Ryanpeikou + Tanyao                                          | Closed | 4            | 40  | 0    |
| H07    | ron     | Current dealer                       | Sanshoku + Chanta                                            | Open   | 2            | 50  | 0    |
| H08    | ron     | Current dealer                       | Ittsu + Honitsu                                              | Open   | 3            | 60  | 0    |
| H09    | ron     | Current dealer                       | Junchan                                                      | Closed | 4            | 40  | 1    |
| H10    | ron     | Current dealer                       | Toitoi + Honroutou + Red dragon + Green dragon               | Open   | 6            | —   | 0    |
| H11    | ron     | Current dealer                       | Sanankou + Sankantsu + Sanshoku doukou                       | Closed | 7            | —   | 1    |
| H12    | ron     | Current dealer                       | Red dragon + Houtei raoyui                                   | Open   | 2            | 70  | 0    |
| H13    | ron     | Current dealer                       | East seat wind + East round wind + White dragon              | Open   | 3            | 80  | 0    |
| H14    | ron     | Current dealer                       | East seat wind + East round wind + Red dragon + Green dragon | Open   | 4            | 90  | 0    |
| H15    | ron     | Current dealer                       | Red dragon + Green dragon + Shousangen                       | Closed | 6            | —   | 2    |
| H16    | ron     | Current dealer                       | Chinitsu                                                     | Open   | 8            | —   | 3    |
| H17    | ron     | Current dealer                       | Chiitoitsu                                                   | Closed | 3            | 25  | 1    |
| H18    | ron     | Current dealer                       | Daburu riichi + Ippatsu                                      | Closed | 4            | 50  | 1    |
| H19    | ron     | Current dealer                       | Riichi + Open riichi                                         | Closed | 2            | 60  | 0    |
| H20    | tsumo   | Current dealer                       | Menzentsumo + Haitei                                         | Closed | 3            | 30  | 1    |
| H21    | tsumo   | Current dealer                       | Rinshan kaihou + Red dragon                                  | Open   | 2            | 100 | 0    |
| H22    | ron     | Current dealer                       | Chankan + Red dragon                                         | Closed | 2            | 110 | 0    |
| H23    | ron     | Current dealer                       | Tanyao                                                       | Open   | 17           | —   | 16   |
| H24    | ron     | Current dealer                       | Suukantsu                                                    | Open   | 1 yakuman    | —   | 0    |
| H25    | tsumo   | Current dealer                       | Suuankou                                                     | Closed | 1 yakuman    | —   | 0    |
| H26    | ron     | Current dealer                       | Suuankou Tanki                                               | Closed | 2 yakuman    | —   | 0    |
| H27    | ron     | Current dealer                       | Daisangen + Tsuuiisou                                        | Open   | 2 yakuman    | —   | 0    |
| H28    | ron     | Current dealer                       | Shousuushii                                                  | Open   | 1 yakuman    | —   | 0    |
| H29    | ron     | Current dealer                       | Daisuushii                                                   | Open   | 1 yakuman    | —   | 0    |
| H30    | ron     | Current dealer                       | Chinroutou                                                   | Open   | 1 yakuman    | —   | 0    |
| H31    | ron     | Current dealer                       | Chuuren poutou                                               | Closed | 1 yakuman    | —   | 0    |
| H32    | ron     | Current dealer                       | Chuuren poutou 9-side                                        | Closed | 2 yakuman    | —   | 0    |
| H33    | ron     | Current dealer                       | Ryuuiisou                                                    | Open   | 1 yakuman    | —   | 0    |
| H34    | ron     | Current dealer                       | Kokushi musou                                                | Closed | 1 yakuman    | —   | 0    |
| H35    | ron     | Current dealer                       | Kokushi musou 13-side                                        | Closed | 2 yakuman    | —   | 0    |

## Finishing hands and checkpoints

After the assigned samples, advance through every remaining deal to South 4 using a nondealer ron. Winner is next after the current dealer; discarder is next after that winner. Use open Red dragon with these fu/dora inputs by starting round: East 3 = 50/2, East 4 = 60/3, South 1 = limit/4, South 2 = limit/5, South 3 = limit/6, South 4 = limit/7. Honba is charged on the first advancing win; following wins reset honba to zero.

[hand-scenarios.json](../tests/utils/hand-scenarios.json) contains the explicit inputs, payment arrow labels, raw score vector, next round, honba, pot, and final rating changes for every retained entry. The `hands` array lists H01–H35 at indices 0–34, followed by shared finishing hands; each round references its hand index. Expectations are independent fixtures; e2e assertions do not call production scoring code. Scores plus the carried riichi pot always total 120,000. C/P3's separate 20,000 chombo penalty is deducted only from the final rating change. Uma is +15,000/+5,000/−5,000/−15,000, with equalized ties, and oka is zero.

## Coverage requirement

SMOKE-005 enters H01–H35 in one event. SMOKE-006 randomly assigns six smaller fixture subsets without replacement across its six games, recording the assignment in the test report. Each subset has five or six catalogue hands; the union covers H01–H35. Each event must cover every selectable non-wind yaku at least once, excluding deprecated aggregate Yakuhai. Compare these IDs and the East wind awards against the allowed-yaku list. Seat and round winds for other directions are checked in the focused Tyr unit tests. Verify the complete selection before submission and the persisted yaku, han/fu, players, and scores. SMOKE-006 checks Tyr's entire wind/payment history once before the final hand and compares detailed Sigrun logs with one collection assertion; it does not open Tyr logs during earlier recording or cancellation. Assert dora in Tyr's selector and Sigrun's saved log. The fixed 20/25/30-fu hands and selectable 40–110 fu, dora 0–7 and 16, mangan through sanbaiman, single/double/combined yakuman, and pao are intentional boundary coverage.

The catalogue covers East seat wind, the prevailing round wind, and all three individual dragons. H13 and H14 use East round wind in East rounds and South round wind in South rounds; their han values stay the same. Tyr unit tests additionally verify seat and round wind mapping for all 16 round indices and four seats. Legacy Yakuhai buttons must be absent during every recorded hand.
