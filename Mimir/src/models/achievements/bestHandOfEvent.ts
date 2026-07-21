/*
function getBestHandOfEvent(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('han')
        ->select('winner_id')
        ->whereIn('event_id', $eventIdList)
        ->whereNotNull('winner_id')
        ->orderByDesc('han')
        ->limit(10)
        ->findArray();
    $maxHan = 0;
    $names = [];
    foreach ($rounds as $round) {
        if ($maxHan === 0) {
            $maxHan = $round['han'];
        }

        if ($round['han'] < $maxHan) {
            continue;
        }

        $names[] = $players[$round['winner_id']]['title'];
    }

    return [
        'han' => $maxHan,
        'names' => $names
    ];
}
*/
