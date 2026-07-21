/*
function getJustAsPlanned(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('winner_id')
        ->select('yaku')
        ->whereIn('event_id', $eventIdList)
        ->whereIn('outcome', ['multiron', 'ron', 'tsumo'])
        ->findArray();

    $filteredRounds = array_filter($rounds, function ($round) {
        return in_array(Y_IPPATSU, explode(',', $round['yaku']));
    });

    $counts = [];
    if ($filteredRounds) {
        foreach ($filteredRounds as $round) {
            if (empty($players[$round['winner_id']])) {
                continue;
            }
            $name = $players[$round['winner_id']]['title'];
            if (empty($counts[$name])) {
                $counts[$name] = 0;
            }

            $counts[$name]++;
        }
    }

    arsort($counts);
    return array_map(
        function ($name, $count) {
            return [
                'name' => $name,
                'count' => $count
            ];
        },
        array_slice(array_keys($counts), 0, 5),
        array_slice(array_values($counts), 0, 5)
    );
}
*/
