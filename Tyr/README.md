## Tyr: mobile game manager

![Tyr](app/tyrico.png?raw=true 'Tyr')

**Tyr** is a tool for online game recording in japanese (riichi) mahjong sessions. Tyr uses [Frey](https://github.com/MahjongPantheon/pantheon/tree/master/Frey)\
(user data storage) and [Mimir](https://github.com/MahjongPantheon/pantheon/tree/master/Mimir) (games data storage) as backend.

Tyr targets mobile browsers only. Design and validate interactions for touch; do not add desktop keyboard shortcuts or keyboard-driven navigation.

### iPhone Home Screen installation

Tyr explicitly requests the default iOS status bar style, keeps controls inside
the screen's safe areas, and paints a fixed status-bar surface with the active
theme's background color. This avoids placing controls beneath the blurred edge
of a translucent status bar. Theme changes update the surface with the app.

iOS saves the status-bar configuration when installing a Home Screen app.
Existing installations may need to be removed and added to the Home Screen
again after updating. See [Apple's status-bar documentation](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html)
and the [iOS PWA blur report](https://www.reddit.com/r/PWA/comments/1w5mqj1/ios_27_beta_blurs_the_top_edge_of_installed_pwas/).

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

### Unit tests

Unit test coverage (`./run test tyr` from the repository root) must reach
at least 85% for lines, statements, functions, and branches. Reports are written
to `Tyr/coverage/`.

### Legend

**Týr** (/ˈtɪər/) is norse one-handed god, associated with law, warriors and glory. See wikipedia for details :)

### Yakuhai entry mode

Event admins choose separate wind/dragon names or aggregated Yakuhai ×1–×4 in
Forseti's yaku settings. When creating an event, Forseti defaults tournaments to
aggregated yakuhai and local/online events to separate names. The upgrade
migration preserves aggregated yakuhai for existing events. The mode
also controls new online imports and does not rewrite recorded hands.

### Chombo selection

Select every player who received chombo before confirming the round. The preview
shows all penalties and the submission records them together, including after
the timer expires. A group of penalties consumes one timed hand. Tapping a
selected player removes only that player; at least one must remain selected.

### Event rules in Tyr

Tyr keeps the selected event's rules only in memory. It loads them when selecting
a different event in settings or reloading the browser. Refreshing the current
game, entering a round, and selecting winners retain the loaded rules. After an
administrator changes event rules, switch events or reload Tyr to apply them.
