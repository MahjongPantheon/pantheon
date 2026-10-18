# Riichi Mahjong Terminology — English Glossary

This file collects **83 source glossary entries**, number readings, yaku aliases, and abbreviations. It also includes yaku and core terms from the basic rules.

Definitions are paraphrased in English. Japanese spellings and kana readings in §1 are preserved from the external source; Russian terms and translations are omitted. Romanizations and explanatory English labels are editorial additions. Where the glossary is abbreviated, clarifications follow the external source's game rules; cautions below identify wording that should not become a machine rule.

### Scope in Pantheon

This is domain vocabulary from the external rules source described in the [companion rules reference](Riichi_Mahjong_Rules.md#1-scope-authority-and-source-version), not a list of implemented engine features. The tile-by-tile engine is planned and is **not implemented yet**. Furiten, call timing, wall state, and automatic hand decomposition below describe game concepts and future engine requirements.

For current behavior, use the event's stored `RulesetConfig`, not the external RRC defaults. In particular, Pantheon's built-in `rrc` preset enables abortive draws and uses uma +15,000/+5,000/−5,000/−15,000 and chombo 20,000. See the [implementation comparison](Riichi_Mahjong_Rules.md#18-current-pantheon-implementation-and-planned-engine).

Traditional **round** here means a circuit of dealership (East/South). In Pantheon APIs, **round** means one hand/deal, and **session** means one game; see the [Pantheon glossary](Pantheon_Glossary.md). Yaku aliases are lookup aids: API identifiers come from [Mimir's yaku enum](../../Mimir/src/helpers/yaku.ts) and [Tyr's yaku definitions](../../Tyr/app/helpers/yaku.ts), not romanized names or table order. Existing API fields spell tenpai as `tempai`; preserve that spelling in contracts.

## 1. Complete source glossary

Entries are ordered alphabetically by their English term or romanization. An em dash means the source supplies no value. The Japanese column contains **source spelling / source kana reading**, not an independently corrected language reference.

| English term / romanization | Japanese / reading | Meaning |
| --- | --- | --- |
| Agari | 和了 / あがり | Win declaration; winning a deal by ron or tsumo. |
| Agaripai | 和了牌 / あがりぱい | Winning tile: the tile that completes the winning hand. |
| Agariyame | 和了止め / あがりやめ | Rule allowing a leading dealer to end the match after the final scheduled deal rather than continue dealership. |
| Akadora / red dora | 赤ドラ / あかどら | Red-marked tile that gives a dora bonus independently of the indicators. |
| Anjun / concealed sequence | 暗順 / あんじゅん | Concealed set of three consecutive suited tiles. |
| Ankan / concealed kan | 暗槓 / あんかん | Declared concealed set of four identical tiles. |
| Ankou / concealed triplet | 暗刻 / あんこう | Concealed set of three identical tiles; the glossary also groups concealed kans under this term when counting concealed sets. |
| Ari / enabled | 有り / あり | Indicates that a rule applies; for example, kuitan ari means open tanyao is allowed. |
| Atama / head | 頭 / あたま | The pair used in a standard four-sets-and-a-pair decomposition. |
| Atamahane / head bump | 頭跳ね / あたまはね | When several players claim ron on one discard, only the claimant nearest after the discarder in turn order wins. |
| Atozuke | 後付け / あとづけ | Permission to win when only some structural waits provide a qualifying yaku; also the situation in which yaku eligibility depends on the winning tile. |
| Bakaze / round wind | 場風 / ばかぜ | Prevailing wind of the current round. |
| Betaori / folding | ベタ降り / べたおり | Defensive play that dismantles one's hand to discard tiles believed safe, including genbutsu and tiles excluded by visible information. |
| Chombo | 冲合 / ちょんぼ | Serious rule violation resulting in a penalty and replay when play cannot validly continue; the rules also list specific adjudicated cases. |
| Daiminkan / open kan from discard | 大明槓 / だいみんかん | Kan formed by calling an opponent's discard to join three matching concealed tiles. |
| Damaten | 黙聴 / だまてん | Tenpai with a closed hand and no riichi declaration. |
| Dealer / oya | 親 / おや | Current East-seat player. |
| Discard / kiri | 切り / きり | Act of placing a tile in one's discard area during a turn. |
| Discard area / river / kawa | 河 / かわ | A player's ordered area of discarded tiles. Distinguish the area from the act of discarding. |
| Dora | ドラ / — | Bonus tile adding one han per applicable bonus instance to a winning hand; does not itself supply a yaku. |
| Furikomi / dealing in | 振り込み / ふりこみ | Discarding a tile on which an opponent wins by ron. |
| Furiten | 振聴 / ふりてん | State prohibiting ron when a current structural completion is in one's own discard history, even if that completion would not provide a yaku. Temporary furiten is a related separate state. |
| Fuuro / exposed melds | 副露 / ふうろ | The exposed called portion of a player's hand. |
| Genbutsu | 現物 / げんぶつ | A tile type in a particular opponent's discard history; safe against that opponent's ron because of furiten. Safety is opponent-specific. |
| Haiteipai / final live-wall tile | 海底牌 / はいていぱい | Last tile available for a normal draw from the live wall. |
| Hanchan / East–South match | 半荘 / はんちゃん | Match consisting of East and South rounds. |
| Hand / haipai / tehai | 配牌 / はいぱい | A player's tiles. Haipai specifically means the starting dealt hand; tehai refers to the hand generally. |
| Harabote | — / — | Sequence shape with a duplicated middle tile, for example 4556. Japanese writing and reading are not supplied in the glossary. |
| Honba | 本場 / ほんば | Counter increasing payments in subsequent deals after applicable repetitions and draws; physically represented by a 100-point stick without deducting that stick's value from the dealer. |
| Houteipai / final discard | 河底牌 / ほうていぱい | Last discarded tile of the deal. |
| Jansou / mahjong parlor | 雀荘 / じゃんそう | Japanese establishment for playing mahjong. |
| Jigoku machi / hell wait | 地獄待ち / じごくまち | Wait on the single remaining unseen copy of a tile, excluding copies already discarded or in exposed melds. |
| Kabe / wall defense | 壁 / かべ | Defensive reasoning from fully visible tile types that make certain sequence waits impossible. |
| Kamicha | 上家 / かみちゃ | Player to one's left; the previous player in turn order. |
| Kanchan / closed wait | 嵌張 / かんちゃん | Sequence-middle wait, such as 35 waiting for 4. |
| Kantsu / kan set | 槓子 / かんつ | Four identical tiles declared as a kan; distinguish the set from the declaration action. |
| Karaten / empty wait | 空聴 / からてん | Tenpai whose completing copies have all been discarded, in the glossary's description. Exhausted outside copies do not automatically invalidate formal tenpai. |
| Kimeuchi | 決め打ち / きめうち | Committing early to a particular yaku and discarding tiles that do not fit that plan. The source adds a strategic warning against doing this in most situations. |
| Koutsu / triplet | 刻子 / こつ | Set of three identical tiles; distinguish it from the pon call. |
| Kuikae | 喰い替え / くいかえ | Restriction against discarding the just-called tile type, or the alternative sequence-completing type after chi. |
| Kuitan | 喰い断 / くいたん | Rule permitting tanyao in an open hand. |
| Kyuushu kyuuhai | 九種複数 / きゅうしゅ きゅはい | Optional abortive-draw declaration with at least nine distinct terminal/honor types on one's first uninterrupted turn; disabled by default in RRC. |
| Machi / wait | 待ち / まち | Tile type or set of tile types that completes a hand. |
| Nakasuji | 中筋 / なかすじ | Middle suji tile: for example, 4 in the related 1–4–7 pattern. |
| Naki / call | 鳴き / なき | Calling a tile from an opponent's discard. |
| Nashi / disabled | 無し / なし | Indicates that a rule does not apply; opposite of ari. |
| Nobetan | 延べ単 / のべたん | A shape with two possible pair-completion waits, such as 3456 completing on 3 or 6; these are tanki interpretations, not ryanmen sequence-completion waits. |
| Nomi / only | ノミ / — | Suffix meaning only the named yaku, commonly used with low-value hands, such as riichi nomi. |
| Non-dealer / ko | 子 / こ | Any player other than the current dealer. |
| Noten | ノーテン / — | Not one tile from a complete hand; also a draw-settlement classification imposed by disclosure or dead-hand rules. |
| Oka | オカ / — | Placement bonus awarded to the match winner. |
| Oorasu / all last | オーラス / — | Final scheduled deal of a match; the glossary loosely calls it the last round. |
| Paifu / game record / replay | 牌譜 / ぱいふ | Detailed record of a mahjong game and its actions. |
| Pao / responsibility | 包 / パオ | Special liability incurred by supplying the final called honor set needed for a qualifying yakuman; scope depends on the ruleset. |
| Penchan / edge wait | 辺張 / ぺんちゃん | Sequence-edge wait: 12 on 3, or 89 on 7. |
| Renchan / dealer continuation | 連荘 / れんちゃん | Additional deal with the same dealer after a dealer win or an applicable draw. In default RRC, an exhaustive draw requires dealer tenpai to retain dealership. |
| Rinshanpai / replacement tile | 嶺上牌 / りんしゃん ぱい | Tile drawn from the dead wall after a completed kan. |
| Ryanhan shibari / two-han minimum | 二飜縛り / りゃんはん しばり | Rule requiring at least two han to win after the fifth honba in the glossary's description; not used in default RRC. |
| Ryankan | 両嵌 / りゃんかん | Double closed-wait shape, such as 357, improved by 4 or 6; a partial shape rather than necessarily a complete hand's wait. |
| Ryanmen / two-sided wait | 両面 / りゃんめん | Sequence wait on either end, such as 34 waiting for 2 or 5. |
| Ryuukyoku / exhaustive draw | 流局 / りゅうきょく | Deal ends without a win after the live wall is exhausted. |
| Sakigiri | 先切り / さきぎり | The source glosses this as a potentially dangerous discard and gives push as a variant; see the terminology cautions below. |
| Sangenpai | 三元牌 / さんげんぱい | The three dragon tile types. |
| Shanpon / shapon | 双ポン / しゃんぽん | Wait on either of two pairs to form a triplet, such as 44 and 99 waiting for 4 or 9. |
| Shanten | 向聴 / シャンテン | Number of tile replacements needed to reach tenpai. A common software convention is tenpai = 0 and complete = −1; the source defines distance to tenpai but does not specify the complete-hand sentinel. |
| Shimocha | 下家 / しもちゃ | Player to one's right; the next player in turn order. |
| Shonpai | 生牌 / しょんぱい | Tile type not yet seen in discards or exposed melds. |
| Shouminkan / added kan | 小明槓 / しょうみん かん | Open kan formed by adding the fourth matching tile to an existing open pon. |
| Shuntsu / sequence | 順子 / しゅんつ | Three consecutive ranks in the same suit; distinguish the set from the chi call. |
| Suji | 筋 / すじ | Suited tile relationships separated by three ranks, such as 1–4–7, used in defensive reasoning. |
| Taatsu | 塔子 / たーつ | Two-tile partial set needing a third tile to form a set. |
| Tanki / pair wait | 単騎 / たんき | Wait for the matching tile that completes the pair. |
| Tenbou / scoring sticks | 点棒 / てんぼう | Sticks representing points and used for in-game accounting. |
| Tenpai | 聴牌 / テンパイ | One tile from completing a permitted hand shape; legal winning eligibility additionally depends on yaku, furiten, and context. |
| Tobi / bankruptcy | トビ / — | Optional rule ending a match when a player's score becomes negative. |
| Toimen | 対面 / といめん | Player opposite oneself. |
| Toitsu / pair | 対子 / といつ | Two identical tiles, whether or not used as the head of a particular decomposition. |
| Tonpuusen / East-only match | 東風戦 / とんぷうせん | Match consisting of the East round only. |
| Tsumo | 自摸 / つも | Either a self-draw win or, in broader usage, a tile drawn from the wall. |
| Tsumogiri | 自摸切り / つもぎり | Discarding the tile just drawn, rather than a tile previously held. |
| Ukeire / effective tiles | 受け入れ / うけいれ | Tile types and number of copies that improve a hand by reducing shanten. |
| Wall / yama | 山 / やま | Ordered tiles not yet drawn. |
| Yakitori | 焼き鳥 / やきとり | Rule penalizing a player who wins no deals during a match; also the player's no-win state. |

## 2. Additional core rules terminology

These terms supplement the dictionary table using the external source's game-rule descriptions. English terms and romanizations are provided for development work.

| Term | Meaning |
| --- | --- |
| Riichi | Closed-tenpai declaration with a 1,000-point deposit and subsequent hand restrictions; also its yaku |
| Ron | Win on an opponent's discard or an eligible robbed-kan tile |
| Chi | Call forming an open sequence from the previous player's discard; also used informally for a sequence |
| Pon | Call forming an open triplet from any opponent's discard; also used informally for a triplet |
| Kan | Declaration of a four-identical-tile set; types are ankan, daiminkan, and shouminkan |
| Menzen / closed hand | Hand without a meld called from an opponent's discard; concealed kans preserve closed status |
| Open hand | Hand containing at least one meld called from another player's discard |
| Meld / set | Sequence, triplet, or declared kan occupying one set position in a normal complete hand |
| Terminal | Suited tile of rank 1 or 9 |
| Simple | Suited tile of rank 2–8 |
| Honor | Wind or dragon tile |
| Manzu / characters | Suit denoted `m` |
| Pinzu / circles | Suit denoted `p` |
| Souzu / bamboo | Suit denoted `s` |
| Seat wind / jikaze | Player's current relative wind, used for yakuhai and pair fu; romanization is an editorial aid |
| Deal / kyoku | One unit of play, ending in a win, draw, or interrupted replay |
| Round | East or South circuit of dealership; distinct from a four-player turn circuit |
| Turn circuit | Progress through player turns; set declarations interrupt eligibility for some situational yaku |
| Live wall | Tiles available for normal draws |
| Dead wall | Reserved 14-tile section containing replacement tiles and indicator positions |
| Dora indicator | Tile identifying the next tile in its family's cycle as dora |
| Kan dora | Dora identified by an extra indicator activated after a completed kan |
| Ura dora | Hidden indicator bonus available to a winner with accepted riichi |
| Kan-ura dora | Ura bonus corresponding to activated kan indicators |
| Han | Unit of yaku and dora value used in scoring |
| Fu | Structural mini-points used alongside han below limit tiers |
| Bazoro | Constant 2 in the exponent `fu × 2^(han + 2)`; does not supply a qualifying yaku |
| Yaku | Qualifying hand pattern or game circumstance permitting a win and supplying value |
| Yakuman | Highest natural hand-value category; compatible natural yakuman stack in RRC |
| Kazoe yakuman | Counted yakuman tier for an ordinary hand totaling 13 or more han |
| Mangan | Limit tier with base points 2,000 |
| Haneman | 6–7 han tier; base points 3,000 |
| Baiman | 8–10 han tier; base points 4,000 |
| Sanbaiman | 11–12 han tier; base points 6,000 |
| Kiriage mangan | Rounding 4 han / 30 fu and 3 han / 60 fu to mangan; disabled in default RRC |
| Uma | Placement bonuses and penalties applied at match end; default +30,000/+10,000/−10,000/−30,000 |
| Riichi deposit / riichi pot | A 1,000-point wager and the pool of outstanding wagers; distinguish individual deposit ownership from the total pot |
| Formal tenpai | Structural tenpai allowed at a draw even without a qualifying yaku |
| Temporary furiten | Missed-completion restriction preventing ron until the player's next discard; after riichi it lasts to the deal's end |
| Dead hand | Penalty preventing declarations and making the player count noten at a draw |
| Abortive draw | Optional early-draw mechanism triggered by specified opening or declaration conditions; disabled by default |
| Kyuushu kyuuhai | Optional abortive draw based on at least nine distinct terminal/honor types on a first uninterrupted turn |
| Nagashi mangan | Optional special exhaustive-draw settlement for terminal/honor-only unclaimed discards; not a winning hand in this source |
| Sekinin barai | Responsibility payment for a rinshan win after supplying a kan; disabled in default RRC |
| Double ron / triple ron | Two or three valid winners on the same discard; all are paid under default RRC |
| Reverse-mangan chombo | Optional chombo payment to opponents using reverse tsumo-mangan amounts instead of the default post-uma penalty |

## 3. Yaku name index

These definitions summarize names from the basic-rules yaku list. Refer to the companion rules document for open/closed values, exclusions, fu, and event timing. Romanization varies; these are useful lookup labels, not different yaku.

### Ordinary and special mangan yaku

| English / romanized name | Meaning |
| --- | --- |
| Riichi | Valid closed-tenpai declaration |
| Double riichi | Riichi on the player's first uninterrupted turn; two han total |
| Ippatsu | Win within the uninterrupted first circuit following riichi |
| Menzen tsumo | Closed-hand self-draw win |
| Pinfu | Closed all-sequence hand with non-value pair and two-sided sequence completion |
| Iipeikou | Two identical sequences in a closed hand |
| Tanyao | All simples |
| Sanshoku doujun / sanshoku | Same sequence ranks in all three suits |
| Ittsu | 123, 456, and 789 sequences in one suit |
| Yakuhai | Dragon, seat-wind, or round-wind triplet/kan |
| Chanta | Each set and pair contains a terminal or honor, with at least one sequence and at least one honor |
| Rinshan kaihou | Win on a kan replacement tile |
| Chankan | Robbing an added-kan tile for a win |
| Haitei raoyue / haitei | Win on the final normal live-wall draw |
| Houtei raoyui / houtei | Win on the final discard |
| Chiitoitsu | Seven distinct pairs |
| Sanshoku doukou | Same-rank triplets/kans in all three suits |
| Sanankou | Three concealed triplets/kans |
| Sankantsu | Three declared kans |
| Toitoi | Four triplets/kans and a pair |
| Honitsu | One suit plus honors |
| Shousangen | Two dragon triplets/kans and a dragon pair |
| Honroutou | Only terminals and honors |
| Junchan | Terminal in every set and pair, no honors, and at least one sequence |
| Ryanpeikou | Two disjoint pairs of identical sequences in a closed hand |
| Chinitsu | One suit only |
| Renhou | Uninterrupted opening ron before a non-dealer's first turn; standalone mangan unless independent hand value is higher |

### Natural yakuman

| English / romanized name | Meaning |
| --- | --- |
| Kokushi musou | Thirteen distinct terminal/honor types plus one duplicate |
| Chuuren poutou | Closed one-suit 1112345678999 plus one additional tile of that suit |
| Tenhou | Dealer wins with the initial dealt hand |
| Chiihou | Non-dealer wins on the first uninterrupted self-draw |
| Suuankou | Four concealed triplets/kans |
| Suukantsu | Four declared kans |
| Ryuuiisou | Only green tiles: 2s, 3s, 4s, 6s, 8s, and optionally green dragons |
| Chinroutou | Only terminals |
| Tsuuiisou | Only honors |
| Daisangen | All three dragon triplets/kans |
| Shousuushii | Three wind triplets/kans and a wind pair |
| Daisuushii | All four wind triplets/kans |

## 4. Alternative yaku names listed in the dictionary

The external source recommends using the primary names rather than these alternatives. The English explanations describe the source aliases; not every phrase is a standard English name.

| Primary name | English explanation |
| --- | --- |
| Yakuhai | Fanpai; value honors |
| Shousangen | Little dragons |
| Daisangen | Big dragons |
| Shousuushii | Little winds |
| Daisuushii | Big winds |
| Tsuuiisou | All honors |
| Toitoi | All triplets |
| Sanankou | Three concealed triplets |
| Suuankou | Four concealed triplets |
| Sankantsu | Three kans |
| Suukantsu | Four kans |
| Iipeikou | Two identical sequences |
| Ittsu | Pure straight; the second alias literally means “breath” |
| Honitsu | Informal mixed/half-flush labels |
| Chinitsu | Informal pure/full-flush labels |
| Chuuren poutou | Nine gates |
| Ryuuiisou | All green |
| Tanyao | All simples |
| Chinroutou | All terminals |
| Chiitoitsu | Seven pairs |
| Kokushi musou | Thirteen orphans |
| Double riichi | Daburii, shortened double riichi |
| Menzen tsumo | Tsumo; ambiguous with the general draw/win action |

## 5. Abbreviations and combined-hand shorthand

These are the dictionary's community expressions, not additional yaku.

| Expression | Source meaning |
| --- | --- |
| Mentan | Tsumo + tanyao |
| Mentanpin | Tsumo + tanyao + pinfu |
| Menhon | Closed honitsu; sometimes also implies tsumo |
| Menchin | Closed chinitsu; sometimes also implies tsumo |
| Bakahon | Honitsu nomi: honitsu only |
| Tanpin | Tanyao + pinfu |
| Gomi nomi | Hand paying 300/500 on non-dealer tsumo; wordplay involving “three”, “five”, and Japanese “rubbish” |

Do not infer exact yaku or value from these abbreviations without context. For example, the source's mentan/mentanpin expansions explicitly include tsumo, while other uses of the same shorthand may be less precise.

## 6. Number readings used in tile names

The dictionary gives the following mahjong-specific reading sequence. These romanizations are reading aids, rather than a general Japanese-number lesson.

| Rank | Romanized aid |
| ---: | --- |
| 1 | ii |
| 2 | ryan |
| 3 | san |
| 4 | suu |
| 5 | uu |
| 6 | ro |
| 7 | chii |
| 8 | paa |
| 9 | chuu |

The reading combines with the suit: **sanman** is `3m`; **uupin** is `5p`. Suit names remain necessary: “chii” in a spoken tile rank is not necessarily a chi declaration.

## 7. Terminology cautions for automated services

- **Action versus structure:** chi/pon/kan can informally name sets, but a sequence is shuntsu, a triplet is koutsu, and a declared quad is kantsu. A concealed triplet is not a pon-call event.
- **Hand versus starting hand:** haipai means the initially dealt tiles; tehai is the general hand. The source explicitly points out this distinction.
- **Discards:** distinguish the discard action, the discarded tile, and the discard area. A claimed tile still belongs to the original discard history for furiten.
- **Win versus bonus/yaku:** tsumo may mean a draw, a self-draw win, or the abbreviated menzen-tsumo yaku. Dora is a bonus, not a qualifying yaku.
- **Draw versus repetition:** ryuukyoku is an exhaustive draw; renchan is retention of dealership; honba is the payment counter. A dealer-noten draw advances dealership while increasing honba.
- **Tenpai versus legal ron:** a structurally complete wait can lack a yaku, be exhausted outside the player's hand, or be barred from ron by furiten. Keep these concepts distinct.
- **Wait shape versus whole-hand status:** ryankan, harabote, and taatsu describe partial shapes; their presence alone does not establish tenpai. A nobetan completion is not automatically pinfu.
- **Genbutsu and suji:** genbutsu safety is relative to a particular opponent. Suji and kabe are defensive deductions, not universal guarantees that a discard is safe from every winning shape.
- **Source Japanese spellings:** the table deliberately retains entries such as `九種複数` for kyuushu kyuuhai and `冲合` for chombo, and omits Japanese where the source does. Treat these as transcribed source strings, not verified canonical Japanese. Do not use them as the sole identifier for a rule.
- **Sakigiri / push:** the dictionary pairs sakigiri with push and defines a potentially dangerous discard. Preserve this as a source-specific gloss; do not make an automatic one-to-one mapping between this term and a complete offensive strategy.
- **Strategic commentary:** the dictionary's warning about kimeuchi is advice, not an illegal-action rule.
- **Rule profiles:** agariyame, atamahane, tobi, nagashi mangan, ryanhan shibari, yakitori, and abortive-draw terminology describes concepts even when those mechanisms are disabled in default RRC.
- **Stable identifiers:** use explicit internal IDs and map aliases onto them. Preserve the original source text separately when importing records; romanization differences should not create distinct yaku or actions.
