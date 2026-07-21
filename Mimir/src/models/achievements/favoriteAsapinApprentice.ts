/*
function getFavoriteAsapinApprentice(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('tempai')
        ->whereIn('event_id', $eventIdList)
        ->where('outcome', 'draw')
        ->whereNotEqual('tempai', '')
        ->findArray();

    $payments = [];
    foreach ($rounds as $round) {
        $tempai = explode(',', $round['tempai']);
        $amount = 0;
        switch (count($tempai)) {
            case 1:
                $amount = 3000;
                break;
            case 2:
                $amount = 1500;
                break;
            case 3:
                $amount = 1000;
                break;
            default:;
        }

        foreach ($tempai as $playerId) {
            if (empty($payments[$playerId])) {
                $payments[$playerId] = 0;
            }

            $payments[$playerId] += $amount;
        }
    }

    $filteredPayments = array_filter($payments, function ($payment) {
        return $payment != 0;
    });

    foreach ($filteredPayments as $playerId => $payment) {
        if (empty($players[$playerId])) {
            unset($filteredPayments[$playerId]);
        }
    }

    arsort($filteredPayments);

    return array_map(
        function ($playerId, $payment) use ($players) {
            return [
                'name' => $players[$playerId]['title'],
                'score' => $payment
            ];
        },
        array_slice(array_keys($filteredPayments), 0, 5),
        array_slice(array_values($filteredPayments), 0, 5)
    );
}
*/
