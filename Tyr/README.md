## Tyr: mobile game manager
![Tyr](src/assets/tyrhires.png?raw=true "Tyr")

**Tyr** is a tool for online game recording in japanese (riichi) mahjong sessions. Tyr uses [Mimir](https://github.com/MahjongPantheon/Mimir) as its supporting backend. 
Features:

- Preview of current game state: players' points, riichi bets on table, renchan/honba count, current round.
- Preview of payments scheme.
- In-place check of yaku compatibility (to reduce common mistakes).
- In-place points calculation based on given yaku list.
- Live preview of timer (in tournament mode).
- Ability to start the game with arbitrary player list (in regular mode).

**Tyr** is a part of [Pantheon](https://github.com/MahjongPantheon) system.

Please use our [Bug tracker](https://pantheon.myjetbrains.com/youtrack/issues/TYR) for error reports and feature requests.

### Technologies of Tyr

- Tyr is a _single-page web application_. It runs inside your mobile browser.
- Based on Angular.js framework and hardly depends on it.
- Written in Typescript.
- Created with Angular CLI tool, thus supporting all commands of `ng`-tool, like `ng build` or `ng test`.

### Local installation

- Make sure you run *nix-based OS or VM. Tyr is not tested to run on Windows host.
- Make sure you have Nodejs v6 or later installed globally on your system. Also you will need `npm` v3+ or `yarn`.
- Run `make deps` from Tyr's root directory. This will take some time.
- Run `make dev`. Tyr will be run in development mode on port 4200 (`http://localhost:4200/`).
- If you want some production build, run `make build` - this will output production-compiled files into `dist` folder. Tyr does not have any server-side logic, so you need just to put these files somewhere on your server.
- If you want Tyr to use some other API entry point other than default, change API_URL constant (in `app/services/riichiApi.ts`) to whatever you need, then re-run dev or build task.

### Development

Run `make deps` and then `make dev` to run dev server.

Please send your issues and pull requests. Any help is appreciated.

### Legend

**Týr** (/ˈtɪər/) is germanic one-handed god, associated with law, warriors and glory. See wikipedia for details :)
