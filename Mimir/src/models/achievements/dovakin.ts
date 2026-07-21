/*
function getDovakins(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('yaku')
        ->select('winner_id')
        ->whereIn('event_id', $eventIdList)
        ->whereIn('outcome', ['tsumo', 'ron', 'multiron'])
        ->findArray();

    $yakuhaiStats = [];
    foreach ($rounds as $round) {
        if (empty($players[$round['winner_id']])) {
            continue;
        }
        $name = $players[$round['winner_id']]['title'];
        if (empty($yakuhaiStats[$name])) {
            $yakuhaiStats[$name] = 0;
        }

        $yaku = explode(',', $round['yaku']);
        foreach ($yaku as $id) {
            switch ($id) {
                case Y_YAKUHAI1:
                    $yakuhaiStats[$name]++;
                    break;
                case Y_YAKUHAI2:
                    $yakuhaiStats[$name] += 2;
                    break;
                case Y_YAKUHAI3:
                    $yakuhaiStats[$name] += 3;
                    break;
                case Y_YAKUHAI4:
                    $yakuhaiStats[$name] += 4;
                    break;
                default:;
            }
        }
    }

    arsort($yakuhaiStats);
    $arr = array_slice($yakuhaiStats, 0, 3);
    $retval = [];
    foreach ($arr as $k => $v) {
        $retval[] = ['count' => $v, 'name' => $k];
    }
    return $retval;
}
*/
