/*
function getImpossibleWait(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('loser_id')
        ->select('riichi')
        ->select('han')
        ->select('fu')
        ->whereIn('event_id', $eventIdList)
        ->whereIn('outcome', ['multiron', 'ron'])
        ->orderByDesc('han')
        ->orderByDesc('fu')
        ->limit(100) // limit here for performance reasons
        ->findArray();

    $filteredRounds = array_filter($rounds, function ($round) use (&$players) {
        return !empty($players[$round['loser_id']]) && !in_array($round['loser_id'], explode(',', $round['riichi']));
    });

    return array_map(function ($round) use (&$players) {
        return [
            'name' => $players[$round['loser_id']]['title'],
            'hand' => ['han' => $round['han'], 'fu' => $round['han'] > 4 ? null : $round['fu']]
        ];
    }, array_slice($filteredRounds, 0, 10));
}
*/
