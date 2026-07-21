/*
function getNeedMoreGold(Db $db, array $eventIdList, array $players)
{
    $results = $db->table('session_results')
        ->select('player_id')
        ->select('score')
        ->whereIn('event_id', $eventIdList)
        ->orderByDesc('score')
        ->limit(3)
        ->findArray();
    foreach ($results as &$result) {
        if (empty($players[$result['player_id']])) {
            continue;
        }
        $result['title'] = $players[$result['player_id']]['title'];
    }
    return $results;
}
*/
