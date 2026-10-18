## Pantheon terminology

Checked against the current codebase on 18 October 2026. The domain vocabulary follows [technical terminology](../../docs/technical/terminology.md), with implementation corrections documented here. The [mahjong glossary](Riichi_Mahjong_Glossary.md) uses “round” in a different, traditional sense; use Pantheon's meaning for API and storage work.

- **Session** — one game with a particular set of players. In administration screens, “session” can also mean a set of games played simultaneously during a tournament; distinguish this from one stored `SessionEntity`.
- **Event** — a tournament, a local club rating, or an online event. An event has its own rating table. The API represents these types with `EventType`.
- **Round** — one hand/deal within a session, ending with a recorded **outcome**. `RoundOutcome` includes ron, tsumo, draw, abort, chombo, nagashi, and multiron. The session state's `round` index represents East 1 through South 4 (1–8), with possible extensions under the event's rules; honba distinguishes repeat hands at the same index.
- **Session hash / game hash / representational hash** — the public game lookup identifier, stored as `SessionEntity.representationalHash`. Newly created offline and imported online sessions use a **40-character SHA-1 hex digest**, not a 24-character identifier. Treat existing hashes as opaque strings. Numeric session IDs also exist and appear in some API messages, such as `PlayerSeating.session_id`; they are not an authentication boundary. A replay hash identifies an external replay for deduplication and is a separate field.
- **Player registration** — adding an existing player to an event's rating table. Forseti provides administration workflows for this.
- **Player sign-up / account creation** — adding a person to the system through Frey. Players can sign up themselves, or an administrator with the required permission can create an account.
- **Service (subsystem)** — a separately owned Pantheon application or backend, such as Tyr, Frey, or Mimir.
- **Service (frontend code)** — a class or functions responsible for external effects, separate from React components; used in Tyr, Forseti, and Sigrun.

Implementation references: [API enums and messages](../../Common/proto/atoms.proto), [session entity](../../Mimir/src/entities/Session.entity.ts), [offline session creation](../../Mimir/src/models/SessionModel.ts), [online session creation](../../Mimir/src/models/OnlineSessionModel.ts), [hash helper](../../Mimir/src/helpers/crypto.ts), and [session progression](../../Mimir/src/helpers/SessionState.ts).
