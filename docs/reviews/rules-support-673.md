# Rules support review: #673 referee notes

Issue: https://github.com/MahjongPantheon/pantheon/issues/673

## Implemented behavior

- Forseti has a Referee notes page for each event. All its referees and administrators can read shared notes and append new notes with a server-recorded author and timestamp. The API returns timestamps in ISO UTC format so browsers display the same instant across timezones.
- Notes can apply to the whole event or link to one currently registered player. Linked notes also appear on that event's Penalties page. They remain readable after the player's registration is removed.
- The notes RPCs independently enforce existing Frey event-referee or event-administrator rights, including caller authentication. Ordinary players and anonymous callers cannot read or append notes.
- Notes use their own storage and do not assign/cancel penalties or change ratings. Public event/player APIs and player penalty responses do not expose notes.
- Apply Mimir `Migration20261125000000` before deployment. Generated Twirp clients include `ListRefereeNotes` and `AddRefereeNote`.

## Assumptions and questions for morning review

The user requested reasonable assumptions while unavailable. These choices keep the change contained within the issue:

1. Use the administration panel (Forseti), with no Tyr entry UI in this change. Is an assistant entry point needed later?
2. Notes are private to event referees and administrators. Players cannot see notes linked to themselves. Confirm this privacy policy before considering player-facing exposure.
3. Notes are append-only. Corrections can be appended as new notes; there is no editing or deletion. Is a later moderation or retention policy needed?
4. A note can link to one registered player, or to no player for event-wide instructions. Player links survive unregistration and do not migrate to a replacement player.
5. Trim leading/trailing whitespace and allow 1–5,000 characters. The author and creation time always come from the authenticated server request.
6. Notes are available for all event types, including finished events and events with penalties disabled. Reading/appending still requires current event rights.
7. Refresh notes reloads other referees' additions. No automatic notifications, chat messages, or live subscriptions are introduced.
8. New untranslated messages fall back to English, preserving all existing translations. Russian translations are supplied for the new messages.

## Validation record

- Development Mimir, Frey, and Forseti source mounts were verified against the assigned issue worktree, using isolated Compose project `pantheon-rules-check` and disposable databases. All application checks below ran through the root runner in those development containers.
- `./run proto-gen`: passed; generated clients and development dependencies refreshed. The running Mimir watcher was restarted with `./run restart-watcher Mimir` to load the new route descriptors before browser validation.
- `./run task Mimir migrate`: passed against the disposable development database. The full Mimir suite also applied the new migration to its test database.
- `./run lint Mimir`, `./run lint Forseti`, and `./run lint Fenrir`: passed lint, formatting, and type checks. Logs: `tmp/mimir_*.log`, `tmp/forseti_*.log`, and `tmp/fenrir_*.log`.
- `./run test Mimir`: passed, 1,072 tests and 12 skipped reference tests. Combined coverage: lines 96.52%, statements 92.45%, functions 87.86%, branches 86.55%. Log: `tmp/mimir_notes_final_test.log`.
- Default `./run test Forseti`, with no competing heavy jobs: passed, 371 tests in 40 files. Coverage: lines 94.60%, statements 93.79%, functions 90.93%, branches 85.70%. Log: `tmp/forseti_notes_default_final_test.log`. An earlier concurrent run timed out in three existing BasicSettings tests; both a serial diagnostic run and the clean default rerun passed them.
- `./run e2e dev tests/referee-notes.spec.ts --grep REFEREE-001 --workers=1 --retries=0`: passed, one test in 12.1 seconds. It verifies two referees sharing notes, persistence after reload, authors, UTC timestamps, event isolation, player-linked notes on Penalties, preserved penalty data, and denied player/anonymous access. Log: `tmp/referee_notes_e2e_final.log`.
- `./run i18n extract` and `./run i18n compile Forseti`: completed. Only the 14 new Forseti messages were retained; unrelated service catalog changes were discarded. Every existing compiled translation entry was checked against the base and remained unchanged. The catalog tools still report existing metadata/empty-entry diagnostics and untranslated fallback messages.
- Supplementary `npx react-doctor@latest --verbose --scope changed`: scanned all nine changed React files, score 84/100 with no score regression. One maintainability warning remains for control-flow complexity in the notes component; no correctness diagnostics were reported. This Git-aware scan ran on the host in addition to the required container checks. Log: `tmp/react_doctor_forseti_final.log`.
- `./run task Common lint`: fails with 71 pre-existing protobuf diagnostics. Exactly the same diagnostics were verified on the base branch; the added declarations introduce no additional diagnostics.
- Independent review of the final changes found no actionable issues. No unresolved implementation or integration blocker remains; broader batch checks are recorded by the coordinating task.
