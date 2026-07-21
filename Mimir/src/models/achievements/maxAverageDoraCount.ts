/*
function getMaxAverageDoraCount(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('winner_id')
        ->selectExpr('sum(dora)*1.0/count(*) as average')
        ->whereIn('event_id', $eventIdList)
        ->whereIn('outcome', ['multiron', 'ron', 'tsumo'])
        ->groupBy('winner_id')
        ->orderByDesc('average')
        ->findArray();

    $filteredRounds = array_filter($rounds, function ($round) use (&$players) {
        return !empty($players[$round['winner_id']]) && !empty($round['average']);
    });

    return array_map(
        function ($round) use (&$players) {
            return [
                'name' => $players[$round['winner_id']]['title'],
                'count' => sprintf('%.2f', $round['average'])
            ];
        },
        array_slice($filteredRounds, 0, 5)
    );
}
*/
