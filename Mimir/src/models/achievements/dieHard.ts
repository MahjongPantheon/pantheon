/*
function getDieHardData(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('loser_id')
        ->selectExpr('count(*)', 'cnt')
        ->whereIn('event_id', $eventIdList)
        ->whereIn('outcome', ['ron', 'multiron'])
        ->groupBy('loser_id')
        ->orderByDesc('cnt')
        ->findArray();

    $namesWithZeroCount = [];
    $idsWithFeedCount = array_map(function ($round) {
        return $round['loser_id'];
    }, $rounds);

    foreach ($players as $player) {
        if (!in_array($player['id'], $idsWithFeedCount)) {
            array_push($namesWithZeroCount, $player['title']);
        }
    }

    if (count($namesWithZeroCount) > 0) {
        return [
            'feed' => 0,
            'names' => $namesWithZeroCount
        ];
    }

    $minThrows = 0;
    $names = [];
    foreach ($rounds as $round) {
        if ($minThrows === 0) {
            $minThrows = $round['cnt'];
        }

        if ($round['cnt'] < $minThrows) {
            $minThrows = $round['cnt'];
            $names = [];
        }

        if (!empty($players[$round['loser_id']])) {
            $names[] = $players[$round['loser_id']]['title'];
        }
    }

    return [
        'feed' => $minThrows,
        'names' => $names
    ];
}
*/
