/* function getBestShithander(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('winner_id')
        ->selectExpr('count(*)', 'cnt')
        ->whereIn('event_id', $eventIdList)
        ->where('han', 1)
        ->where('fu', 30)
        ->whereRaw('dora is null')
        ->groupBy('winner_id')
        ->orderByDesc('cnt')
        ->limit(10)
        ->findArray();
    $maxHands = 0;
    $names = [];
    foreach ($rounds as $round) {
        if ($maxHands === 0) {
            $maxHands = $round['cnt'];
        }

        if ($round['cnt'] < $maxHands) {
            continue;
        }

        $names[] = $players[$round['winner_id']]['title'];
    }

    return [
        'handsCount' => $maxHands,
        'names' => $names
    ];
    } */
