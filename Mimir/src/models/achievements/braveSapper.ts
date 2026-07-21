/*
function getBraveSappers(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('loser_id')
        ->selectExpr('count(*)', 'cnt')
        ->whereIn('event_id', $eventIdList)
        ->whereIn('outcome', ['ron', 'multiron'])
        ->groupBy('loser_id')
        ->orderByDesc('cnt')
        ->findArray();
    $maxThrows = 0;
    $names = [];
    foreach ($rounds as $round) {
        if ($maxThrows === 0) {
            $maxThrows = $round['cnt'];
        }

        if ($round['cnt'] < $maxThrows) {
            continue;
        }

        $names[] = $players[$round['loser_id']]['title'];
    }

    return [
        'feed' => $maxThrows,
        'names' => $names
    ];
}
*/
