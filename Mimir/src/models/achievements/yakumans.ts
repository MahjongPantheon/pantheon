/*
function getYakumans(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('winner_id')
        ->select('yaku')
        ->whereIn('event_id', $eventIdList)
        ->whereIn('outcome', ['ron', 'tsumo', 'multiron'])
        ->whereLt('han', 0) // yakuman
        ->findArray();
    $players = array_map(function ($round) use (&$players) {
        return [
            'name' => (string)$players[$round['winner_id']]['title'],
            'yaku' => (string)$round['yaku']
        ];
    }, $rounds);
    return empty($players) ? [] : $players;
}
*/
