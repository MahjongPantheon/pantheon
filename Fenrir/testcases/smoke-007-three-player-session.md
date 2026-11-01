# SMOKE-007: Three-player session

Create four fresh accounts: one event administrator and three players. In Forseti,
create a local event using the sanma ruleset and register the three players.
In Tyr, sign in as the first player and start a session in East/South/West order.
The North selector must be absent.

Record six exhaustive draws with no tenpai players. Before each submission,
verify three player panels, 35000 points each, the rotating East/South/West winds,
and the round labels East 1 through South 3. After South 3, verify the session
finishes and displays exactly three results, each with 35000 points and zero
rating change because all scores are tied.

Run against the development stack with `bin/pantheon e2e dev` from the repository root.
