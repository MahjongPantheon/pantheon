/*
function getMaxDifferentYakuCount(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('winner_id')
        ->select('yaku')
        ->whereIn('event_id', $eventIdList)
        ->whereIn('outcome', ['multiron', 'ron', 'tsumo'])
        ->findArray();

    $playersYaku = [];
    foreach ($rounds as $round) {
        if (empty($players[$round['winner_id']])) {
            continue;
        }
        $name = $players[$round['winner_id']]['title'];
        if (empty($playersYaku[$name])) {
            $playersYaku[$name] = [];
        }

        foreach (explode(',', $round['yaku']) as $yaku) {
            if (in_array($yaku, [Y_YAKUHAI2, Y_YAKUHAI3, Y_YAKUHAI4])) {
                $yaku = Y_YAKUHAI1;
            }

            if (!in_array($yaku, $playersYaku[$name])) {
                array_push($playersYaku[$name], $yaku);
            }
        }
    }

    array_walk($playersYaku, function (&$item) {
        $item = count($item);
    });


    arsort($playersYaku);
    return array_map(
        function ($name, $count) {
            return [
                'name' => $name,
                'count' => $count
            ];
        },
        array_slice(array_keys($playersYaku), 0, 5),
        array_slice(array_values($playersYaku), 0, 5)
    );
}
*/
