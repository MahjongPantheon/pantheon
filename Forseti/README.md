## Forseti: user and ratings control panel

![Forseti](app/forsetiico.png?raw=true 'Forseti')

**Forseti** provides control panel for user profiles and mahjong sessions and events.

Features:

- Allows user profile management
- Allows starting a tournament session with random or manual seating
- Allows players' registration.
- Allows additional penalties for players.
- Shows current state of tournament tables and recently added rounds.
- Allows cancellation of round results, recently added through [Tyr](https://github.com/MahjongPantheon/pantheon/tree/master/Tyr).

### Technologies of Forseti

- Forseti is a single-page application (SPA).
- Written in TypeScript and React 19.
- Uses Mantine UI v9 with package stylesheets and CSS Modules.
- `app/components/NumberInput.tsx` preserves numeric form values and integer precision while allowing intermediate editing states.
- Settings tabs use `keepMountedMode="display-none"` so validation can find and focus invalid fields across tabs.
- Theme preferences retain the shared `day`/`night` cookies and separate dimmed palette.

### Legend

**Forseti** is the god of justice and reconciliation in Norse mythology. See wikipedia for details :)
