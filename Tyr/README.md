## Tyr: mobile game manager

![Tyr](app/tyrico.png?raw=true 'Tyr')

**Tyr** is a tool for online game recording in japanese (riichi) mahjong sessions. Tyr uses [Frey](https://github.com/MahjongPantheon/pantheon/tree/master/Frey)\
(user data storage) and [Mimir](https://github.com/MahjongPantheon/pantheon/tree/master/Mimir) (games data storage) as backend.

Features:

- Preview of current game state: players' points, riichi bets on table, renchan/honba count, current round.
- Preview of payments scheme.
- In-place check of yaku compatibility (to reduce common mistakes).
- In-place points calculation based on given yaku list.
- Live preview of timer (in tournament mode).
- Ability to start the game with arbitrary player list (in regular mode).

### UI test selectors

Key controls and state displays use `data-testid` values beginning with `tyr-` so
Fenrir can select them without depending on translated text or CSS. Use the
screen/action name for a single control (for example, `tyr-home-new-game`) and
append a stable event, player, or table ID for repeated items. Keep each new
value unique across the frontend services.

### Legend

**Týr** (/ˈtɪər/) is norse one-handed god, associated with law, warriors and glory. See wikipedia for details :)

### Yakuhai entry mode

Event admins choose separate wind/dragon names or aggregated Yakuhai ×1–×4 in
Forseti's yaku settings. When creating an event, Forseti defaults tournaments to
aggregated yakuhai and local/online events to separate names. The upgrade
migration preserves aggregated yakuhai for existing events. The mode
also controls new online imports and does not rewrite recorded hands.
