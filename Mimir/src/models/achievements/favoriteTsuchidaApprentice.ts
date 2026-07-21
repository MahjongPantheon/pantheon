/*
function getFavoriteTsuchidaApprentice(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('winner_id')
        ->select('yaku')
        ->whereIn('event_id', $eventIdList)
        ->whereIn('outcome', ['tsumo', 'multiron', 'ron'])
        ->whereGt('han', 2)
        ->findArray();

    $candidates = [];
    foreach ($rounds as $round) {
        if (!empty($round['winner_id'])) {
            if (!array_key_exists($round['winner_id'], $candidates)) {
                $candidates[$round['winner_id']] = 0;
            }

            if (str_contains($round['yaku'], strval(Y_CHIITOITSU))) {
                $candidates[$round['winner_id']] += 1;
            }
        }
    }

    $filteredCandidates = array_filter($candidates, function ($chiitoitsuCount) {
        return $chiitoitsuCount > 2;
    });

    arsort($filteredCandidates);
    return array_map(
        function ($id, $count) use ($players) {
            return [
                'name' => $players[$id]['title'],
                'count' => $count
            ];
        },
        array_slice(array_keys($filteredCandidates), 0, 5),
        array_slice(array_values($filteredCandidates), 0, 5)
    );
}
*/
