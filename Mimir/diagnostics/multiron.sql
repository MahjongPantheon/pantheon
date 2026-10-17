-- Read-only: find multiron hands incompatible with their round's saved seating.
-- Run against the affected Mimir database with psql -f multiron.sql.
SELECT r.event_id, r.session_id, r.id AS round_id, h.id AS hand_id,
       h.winner_id, h.loser_id, r.last_session_state->'player_ids' AS saved_seating,
       r.last_session_state->'scores' AS saved_scores,
       (SELECT jsonb_agg(sp.player_id ORDER BY sp."order")
        FROM session_players sp WHERE sp.session_id = r.session_id) AS session_seating
FROM round r
JOIN hand h ON h.round_id = r.id
WHERE r.outcome = 'ROUND_OUTCOME_MULTIRON'
  AND (h.winner_id IS NULL
       OR h.loser_id IS NULL
       OR h.winner_id = h.loser_id
       OR NOT COALESCE(r.last_session_state->'player_ids', '[]'::jsonb) @> to_jsonb(h.winner_id)
       OR NOT COALESCE(r.last_session_state->'player_ids', '[]'::jsonb) @> to_jsonb(h.loser_id)
       OR NOT COALESCE(r.last_session_state->'scores', '{}'::jsonb) ? h.winner_id::text
       OR NOT COALESCE(r.last_session_state->'scores', '{}'::jsonb) ? h.loser_id::text)
ORDER BY r.session_id, r.id, h.id;

-- Also find merged/malformed groups even if all winners happen to share seating.
SELECT r.event_id, r.session_id, r.id AS round_id,
       count(h.id) AS hands, array_agg(h.winner_id ORDER BY h.id) AS winners,
       array_agg(h.loser_id ORDER BY h.id) AS losers
FROM round r
LEFT JOIN hand h ON h.round_id = r.id
WHERE r.outcome = 'ROUND_OUTCOME_MULTIRON'
GROUP BY r.event_id, r.session_id, r.id
HAVING count(h.id) NOT BETWEEN 2 AND 3
    OR count(DISTINCT h.winner_id) <> count(h.id)
    OR count(DISTINCT h.loser_id) <> 1
ORDER BY r.session_id, r.id;
