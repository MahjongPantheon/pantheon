# SETTINGS-001: Administrator can save and reload the tobi setting

## Purpose

Verify that enabling and disabling bankruptcy (tobi) survives event creation, settings updates, and full navigation back to settings.

## Scope

Forseti event settings, Frey account authentication, and Mimir event persistence through the generated Twirp client.

## Preconditions

- Development services and Fenrir are running with their configured service URLs.
- Account fixtures can create an ordinary account using the documented development confirmation flow or guarded superadmin fixture API.
- The test creates its own administrator and event; it requires no existing event permissions.

## Test data

| Input               | Value or generation rule                                             |
| ------------------- | -------------------------------------------------------------------- |
| Administrator       | One fresh account per attempt from `createTestAccounts`              |
| Event title         | `TEST SETTINGS-001 <UUID>`                                           |
| Event configuration | Local event, Russian Riichi Community rules, Europe/Moscow timezone  |
| Tobi sequence       | Enabled on creation; disabled, enabled, disabled on subsequent saves |

## Steps and expected results

| Step | Action                                                                                                                                  | Expected result                                                                                                                                                                                           |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Log in and create the local event with bankruptcy enabled in Forseti.                                                                   | CreateEvent succeeds and sends `rulesetConfig.withTobi: true` without `withButtobi`.                                                                                                                      |
| 2    | Read the event independently with authenticated GetEventForEdit and navigate to its settings.                                           | The API returns tobi enabled without `withButtobi`; the checkbox is checked after navigation.                                                                                                             |
| 3    | Save with bankruptcy disabled, enabled, and disabled again. After each save, independently read the event and navigate to its settings. | Each UpdateEvent succeeds, sends the selected `withTobi` value without `withButtobi`, and the API and reloaded checkbox match the saved choice. Protobuf omission of a false boolean is treated as false. |

## Cleanup and isolation

The unique account and TEST event remain in the development database. Each attempt, including retries, creates independent data. The test produces no mail through the development fixture path and does not modify existing events.

## Implementation and coverage

- Status: Implemented.
- Implementation: [tests/tobi-settings.spec.ts](../tests/tobi-settings.spec.ts), `SETTINGS-001: Administrator can save and reload the tobi setting`.
- Coverage limits: Proves persistence and displayed settings through the real Forseti/Frey/Mimir flow. It does not exercise riichi or bankruptcy during a session, production SSR, or migrations of pre-existing settings.
