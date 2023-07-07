<?php
namespace Mimir;

ini_set('display_errors', 'On');
ini_set('memory_limit', '1024M');
require __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/Config.php';
require_once __DIR__ . '/../src/Db.php';
require_once __DIR__ . '/../src/DataSource.php';
require_once __DIR__ . '/../src/FreyClientTwirp.php';
require_once __DIR__ . '/../src/helpers/PointsCalc.php';
require_once __DIR__ . '/../src/helpers/SessionState.php';
require_once __DIR__ . '/../src/primitives/Session.php';
require_once __DIR__ . '/../src/primitives/SessionResults.php';
require_once __DIR__ . '/../src/primitives/Round.php';
require_once __DIR__ . '/../src/models/Event.php';

define('ACH_SLEEP_INTERVAL', 2);

if (!empty(getenv('OVERRIDE_CONFIG_PATH'))) {
    $configPath = getenv('OVERRIDE_CONFIG_PATH');
} else {
    $configPath = __DIR__ . '/../config/index.php';
}

try {
    $config = new Config($configPath);
    $db = new Db($config);
    $freyClient = new FreyClientTwirp($config->getStringValue('freyUrl'));
    $mc = new \Memcached();
    $mc->addServer('127.0.0.1', 11211);
    $ds = new DataSource($db, $freyClient, $mc);

    $allEvents = $db->table('event')
        ->rawQuery('select id from event')
        ->findArray();
    $allAchievements = elm2Key($db->table('achievements')
        ->rawQuery('select event_id, last_update from achievements')
        ->findArray(), 'event_id');
    $lastSessions = elm2Key($db->table('session')
        ->rawQuery('select s1.event_id, s1.end_date
        from session s1
        left join session s2 on (s2.event_id = s1.event_id AND s2.end_date > s1.end_date)
        where s1.end_date is not null AND s2.id is null')
        ->findArray(), 'event_id');

    $eventIdsToProcess = [];
    foreach ($allEvents as $ev) {
        if (empty($allAchievements[$ev['id']])) {
            $eventIdsToProcess [] = $ev['id'];
        } else if (!empty($lastSessions[$ev['id']]) && strtotime($lastSessions[$ev['id']]['end_date']) > strtotime($allAchievements[$ev['id']]['last_update'])) {
            $eventIdsToProcess [] = $ev['id'];
        }
    }

    echo 'Found ' . count($eventIdsToProcess) . ' events to process' . PHP_EOL;

    file_put_contents(
        '/tmp/ach_last_run', 'Last start: ' . date('H:i:s d-m-Y') . '; Found ' .
        count($eventIdsToProcess) . ' events to process' . PHP_EOL
    );

    if (count($eventIdsToProcess) === 0) {
        exit(0);
    }

    foreach ($eventIdsToProcess as $id) {
        try {
            $processedData = [];
            $games = SessionPrimitive::findByEventListAndStatus(
                $ds,
                [$id],
                SessionPrimitive::STATUS_FINISHED
            );
            $players = EventModel::getPlayersOfGames($ds, $games);
            /** @var array $sessionIds */
            $sessionIds = array_map(function (SessionPrimitive $el) {
                return $el->getId();
            }, $games);
            $rounds = getRounds($ds, $sessionIds);

            echo 'Running [bestHand] on event #' . $id . PHP_EOL;
            $processedData['bestHand'] = getBestHandOfEvent($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [bestTsumoist] on event #' . $id . PHP_EOL;
            $processedData['bestTsumoist'] = getBestTsumoistInSingleSession($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [braveSapper] on event #' . $id . PHP_EOL;
            $processedData['braveSapper'] = getBraveSappers($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [dieHard] on event #' . $id . PHP_EOL;
            $processedData['dieHard'] = getDieHardData($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [dovakins] on event #' . $id . PHP_EOL;
            $processedData['dovakins'] = getDovakins($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [yakumans] on event #' . $id . PHP_EOL;
            $processedData['yakumans'] = getYakumans($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [shithander] on event #' . $id . PHP_EOL;
            $processedData['shithander'] = getBestShithander($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [bestDealer] on event #' . $id . PHP_EOL;
            $processedData['bestDealer'] = getBestDealer($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [bestFu] on event #' . $id . PHP_EOL;
            $processedData['bestFu'] = getMaxFuHand($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [impossibleWait] on event #' . $id . PHP_EOL;
            $processedData['impossibleWait'] = getImpossibleWait($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [honoredDonor] on event #' . $id . PHP_EOL;
            $processedData['honoredDonor'] = getHonoredDonor($id, $games, $players, $rounds);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [justAsPlanned] on event #' . $id . PHP_EOL;
            $processedData['justAsPlanned'] = getJustAsPlanned($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [carefulPlanning] on event #' . $id . PHP_EOL;
            $processedData['carefulPlanning'] = getMinFeedsScore($id, $games, $players, $rounds);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [doraLord] on event #' . $id . PHP_EOL;
            $processedData['doraLord'] = getMaxAverageDoraCount($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [catchEmAll] on event #' . $id . PHP_EOL;
            $processedData['catchEmAll'] = getMaxDifferentYakuCount($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [favoriteAsapinApprentice] on event #' . $id . PHP_EOL;
            $processedData['favoriteAsapinApprentice'] = getFavoriteAsapinApprentice($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [andYourRiichiBet] on event #' . $id . PHP_EOL;
            $processedData['andYourRiichiBet'] = getMaxStolenRiichiBetsCount($id, $games, $players, $rounds);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [covetousKnight] on event #' . $id . PHP_EOL;
            $processedData['covetousKnight'] = getMinLostRiichiBetsCount($id, $games, $players, $rounds);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [ninja] on event #' . $id . PHP_EOL;
            $processedData['ninja'] = getNinja($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Running [needMoreGold] on event #' . $id . PHP_EOL;
            $processedData['needMoreGold'] = getNeedMoreGold($db, [$id], $players);
            sleep(ACH_SLEEP_INTERVAL);
            echo 'Saving achievements on event #' . $id . PHP_EOL;
            $db->upsertQuery(
                'achievements',
                [['event_id' => $id, 'data' => json_encode($processedData), 'last_update' => date('Y-m-d H:i:s')]],
                ['event_id']
            );
            sleep(ACH_SLEEP_INTERVAL);
        } catch (\Exception $e) {
            echo $e->getMessage() . PHP_EOL;
            echo 'Failed to update achievements for event #' . $id . ', skipping...' . PHP_EOL;
            continue;
        }
    }
} catch (\Exception $e) {
    echo 'Achievements update error!' . PHP_EOL;
    echo $e->getMessage() . PHP_EOL;
}

function elm2Key(array $array, $elmKey)
{
    $result = [];

    foreach ($array as $k => $v) {
        if (!isset($v[$elmKey])) {
            throw new \Exception('Wrong key');
        }
        if (empty($result[$v[$elmKey]])) {
            $result[$v[$elmKey]] = $v;
        }
    }

    return $result;
}

function getRounds(DataSource $ds, array $sessionIds)
{
    $rounds = RoundPrimitive::findBySessionIds($ds, $sessionIds);

    $result = [];
    foreach ($rounds as $item) {
        if (empty($result[$item->getSessionId()])) {
            $result[$item->getSessionId()] = [];
        }
        $result[$item->getSessionId()] []= $item;
    }

    return $result;
}

/**
 * @param int $eventId
 * @param SessionPrimitive[] $games
 * @param array $players
 * @param RoundPrimitive[][] $rounds
 * @return array
 * @throws \Exception
 */
function calcRiichiStat(int $eventId, array $games, array $players, array $rounds)
{
    static $riichiStat = [];
    if (!empty($riichiStat[$eventId])) {
        return $riichiStat[$eventId];
    }

    $riichiStat[$eventId] = [];
    foreach ($players as $playerId => $player) {
        $riichiStat[$eventId][$playerId] = [
            'name'  => $player['title'],
            'won'   => 0,
            'lost'  => 0,
            'stole' => 0
        ];
    }

    foreach ($games as $session) {
        $rules = $session->getEvent()->getRulesetConfig();
        if ($rules->rules()->getRiichiGoesToWinner()) {
            $firstPlace = array_filter($session->getSessionResults(), function (SessionResultsPrimitive $result) {
                return $result->getPlace() === 1;
            });

            $firstPlacePlayerId = array_values($firstPlace)[0]->getPlayerId();
            $riichiStat[$eventId][$firstPlacePlayerId]['stole'] += $session->getCurrentState()->getRiichiBets();
        }

        foreach ($rounds[$session->getId()] as $round) {
            $riichiIds = $round->getRiichiIds();

            if (in_array($round->getOutcome(), ['ron', 'tsumo'])) {
                $winnerId = $round->getWinnerId();

                foreach ($riichiIds as $riichiPlayerId) {
                    if ($riichiPlayerId == $winnerId) {
                        $riichiStat[$eventId][$riichiPlayerId]['won'] ++;
                    } else {
                        $riichiStat[$eventId][$riichiPlayerId]['lost'] ++;
                        $riichiStat[$eventId][$winnerId]['stole'] ++;
                    }
                }

                $riichiStat[$eventId][$winnerId]['stole'] += $round->getLastSessionState()->getRiichiBets();
            }

            if (in_array($round->getOutcome(), ['draw', 'abort'])) {
                foreach ($riichiIds as $riichiPlayerId) {
                    $riichiStat[$eventId][$riichiPlayerId]['lost'] ++;
                }
            }

            if ($round->getOutcome() == 'multiron') {
                /** @var MultiRoundPrimitive $round */
                $riichiIds = $round->getRiichiIds();
                $winnerIds = $round->getWinnerIds();

                foreach ($riichiIds as $playerId) {
                    if (!in_array($playerId, $winnerIds)) {
                        $riichiStat[$eventId][$playerId]['lost'] ++;
                    }
                }

                $lastSessionState = $round->getLastSessionState();
                $riichiWinners = PointsCalc::assignRiichiBets(
                    $round->rounds(),
                    $round->getLoserId(),
                    $lastSessionState->getRiichiBets(),
                    $lastSessionState->getHonba(),
                    $round->getSession()
                );

                foreach ($riichiWinners as $winnerId => $item) {
                    $closestWinner = $item['closest_winner'];

                    if ($rules->rules()->getDoubleronRiichiAtamahane() && $closestWinner) {
                        if ($closestWinner == $winnerId) {
                            if (in_array($winnerId, $riichiIds)) {
                                $riichiStat[$eventId][$winnerId]['won'] ++;
                            }

                            $fromOthers = array_filter($riichiIds, function ($playerId) use ($winnerId) {
                                return $playerId != $winnerId;
                            });

                            $riichiStat[$eventId][$winnerId]['stole'] += count($fromOthers);
                        } else {
                            $riichiStat[$eventId][$winnerId]['lost'] ++;
                        }
                    } else {
                        if (in_array($winnerId, $riichiIds)) {
                            $riichiStat[$eventId][$winnerId]['won'] ++;
                        }

                        $fromOthers = array_filter($item['from_players'], function ($playerId) use ($winnerId) {
                            return $playerId != $winnerId;
                        });

                        $riichiStat[$eventId][$winnerId]['stole'] += count($fromOthers);
                    }

                    $riichiStat[$eventId][$winnerId]['stole'] += $item['from_table'];
                }
            }
        }
    }

    return $riichiStat[$eventId];
}


/**
 * Get players who lost largest number of points as riichi bets
 *
 * @param int $eventId
 * @param SessionPrimitive[] $games
 * @param array $players
 * @param RoundPrimitive[][] $rounds
 *
 *
 * @return array[]
 * @throws \Exception
 */
function getHonoredDonor(int $eventId, array $games, array $players, array $rounds)
{
    try {
        $riichiStat = calcRiichiStat($eventId, $games, $players, $rounds);

        uasort($riichiStat, function ($a, $b) {
            return $a['lost'] < $b['lost'] ? 1 : -1;
        });

        return array_map(
            function ($item) {
                return [
                    'name' => $item['name'],
                    'count' => $item['lost'],
                ];
            },
            array_slice($riichiStat, 0, 5)
        );
    } catch (\Exception $e) {
        return [];
    }
}

/**
 * @param RoundPrimitive $round
 * @param SessionState $sessionState
 * @param array $payments
 * @return array
 * @throws \Exception
 */
function addLoserPayment(RoundPrimitive $round, SessionState $sessionState, array $payments)
{
    if (!in_array($sessionState->getLastOutcome(), ['ron', 'multiron'])) {
        return $payments;
    }

    $lastSessionState = $round->getLastSessionState();
    $loserId = $round->getLoserId();
    $loserHasRiichi = in_array($loserId, $round->getRiichiIds());

    $lastScore = $lastSessionState->getScores()[$loserId];
    $currentScore = $sessionState->getScores()[$loserId];

    $payment = $lastScore - $currentScore;
    if ($loserHasRiichi) {
        $payment -= 1000;
    }

    if (empty($payments[$loserId])) {
        $payments[$loserId] = [
            'sum'   => 0,
            'count' => 0
        ];
    }

    $payments[$loserId]['sum'] += $payment;

    if ($round instanceof MultiRoundPrimitive) {
        $rounds = $round->rounds();
        $multiRonCount = $rounds[0]->getMultiRon();
        $payments[$loserId]['count'] += $multiRonCount;
    } else {
        $payments[$loserId]['count']++;
    }

    return $payments;
}

/**
 * Get players who has the smallest average cost of opponents hand that player has dealt
 *
 * @param int $eventId
 * @param SessionPrimitive[] $games
 * @param array $players
 * @param RoundPrimitive[][] $rounds
 * @return array
 * @throws \Exception
 */
function getMinFeedsScore(int $eventId, array $games, array $players, array $rounds)
{
    $payments = [];
    foreach ($games as $session) {
        $lastRound = null;
        foreach ($rounds[$session->getId()] as $round) {
            if ($lastRound === null) {
                $lastRound = $round;
                continue;
            }

            $lastSessionState = $round->getLastSessionState();
            $payments = addLoserPayment($lastRound, $lastSessionState, $payments);
            $lastRound = $round;
        }

        if (!empty($lastRound)) {
            $payments = addLoserPayment($lastRound, $session->getCurrentState(), $payments);
        }
    }

    $feedsScores = [];
    foreach ($payments as $key => $value) {
        $feedsScores[$key] = $value['sum'] / $value['count'];
    }

    asort($feedsScores);

    return array_map(
        function ($playerId, $feedsScore) use ($players) {
            return [
                'name'  => $players[$playerId]['title'],
                'score' => round($feedsScore)
            ];
        },
        array_slice(array_keys($feedsScores), 0, 5),
        array_slice(array_values($feedsScores), 0, 5)
    );
}

/**
 * Get players who collected the largest amount of other players' riichi bets during the tournament
 *
 * @param int $eventId
 * @param SessionPrimitive[] $games
 * @param array $players
 * @param RoundPrimitive[][] $rounds
 * @return array[]
 * @throws \Exception
 */
function getMaxStolenRiichiBetsCount(int $eventId, array $games, array $players, array $rounds)
{
    try {
        $riichiStat = calcRiichiStat($eventId, $games, $players, $rounds);

        $filteredRiichiStat = array_filter($riichiStat, function ($item) {
            return $item['stole'] > 0;
        });

        uasort($filteredRiichiStat, function ($a, $b) {
            return $a['stole'] < $b['stole'] ? 1 : -1;
        });

        return array_map(
            function ($item) {
                return [
                    'name'  => $item['name'],
                    'count' => $item['stole'],
                ];
            },
            array_slice($filteredRiichiStat, 0, 5)
        );
    } catch (\Exception $e) {
        return [];
    }
}

/**
 * Get players with losing the smallest riichi bets count
 *
 * @param int $eventId
 * @param SessionPrimitive[] $games
 * @param array $players
 * @param RoundPrimitive[][] $rounds
 * @return array[]
 * @throws \Exception
 */
function getMinLostRiichiBetsCount(int $eventId, array $games, array $players, array $rounds)
{
    try {
        $riichiStat = calcRiichiStat($eventId, $games, $players, $rounds);

        uasort($riichiStat, function ($a, $b) {
            return $a['lost'] > $b['lost'] ? 1 : -1;
        });

        return array_map(
            function ($item) {
                return [
                    'name'  => $item['name'],
                    'count'  => (string)$item['lost'],
                ];
            },
            array_slice($riichiStat, 0, 5)
        );
    } catch (\Exception $e) {
        return [];
    }
}


/**
 * Get players who collected hand with maximum fu
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @throws \Exception
 * @return array
 */
function getMaxFuHand(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('fu')
        ->select('winner_id')
        ->whereIn('event_id', $eventIdList)
        ->whereGt('fu', 0)
        ->orderByDesc('fu')
        ->limit(10)
        ->findArray();

    $maxFu = 0;
    $names = [];
    foreach ($rounds as $round) {
        if ($maxFu === 0) {
            $maxFu = $round['fu'];
        }

        if ($round['fu'] < $maxFu) {
            continue;
        }

        $names []= $players[$round['winner_id']]['title'];
    }

    return [
        'fu' => $maxFu,
        'names' => array_values(array_unique($names))
    ];
}

/**
 * Get players who played most as dealer
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @throws \Exception
 * @return array
 */
function getBestDealer(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('winner_id')
        ->select('round')
        ->select('session_id')
        ->whereIn('event_id', $eventIdList)
        ->whereIn('outcome', ['ron', 'tsumo', 'multiron'])
        ->orderByAsc('session_id')
        ->orderByAsc('id')
        ->findArray();

    $dealerWinnings = [];

    for ($i = 1; $i < count($rounds); $i ++) {
        $currentRound = $rounds[$i - 1];
        $nextRound = $rounds[$i];

        if (// renchan with agari
            $nextRound['session_id'] == $currentRound['session_id'] &&
            $nextRound['round'] == $currentRound['round']
        ) {
            if (!isset($dealerWinnings[$currentRound['winner_id']])) {
                $dealerWinnings[$currentRound['winner_id']] = 0;
            }
            $dealerWinnings[$currentRound['winner_id']] ++;
        }
    }

    arsort($dealerWinnings);
    $bestCount = reset($dealerWinnings);

    $bestDealers = [];
    foreach ($dealerWinnings as $id => $count) {
        if ($count < $bestCount) {
            continue;
        }
        $bestDealers []= $players[$id]['title'];
    }

    return [
        'names' => $bestDealers,
        'bestWinCount' => $bestCount
    ];
}

/**
 * Get players who collected largest amount of 1/30 hands
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @throws \Exception
 * @return array
 */
function getBestShithander(Db $db, array $eventIdList, array $players)
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

        $names []= $players[$round['winner_id']]['title'];
    }

    return [
        'handsCount' => $maxHands,
        'names' => $names
    ];
}

/**
 * Get player who collected most expensive hand
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @throws \Exception
 * @return array
 */
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

        $names []= $players[$round['winner_id']]['title'];
    }

    return [
        'han' => $maxHan,
        'names' => $names
    ];
}

/**
 * Get players who collected a yakuman
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @throws \Exception
 *
 * @return array|string
 */
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

/**
 * Get players who has largest count of feeding into others' hands
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @throws \Exception
 * @return array
 */
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

        $names []= $players[$round['loser_id']]['title'];
    }

    return [
        'feed' => $maxThrows,
        'names' => $names
    ];
}

/**
 * Get players who has smallest count of feeding into others' hands
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @throws \Exception
 * @return array
 */
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

        $names []= $players[$round['loser_id']]['title'];
    }

    return [
        'feed' => $minThrows,
        'names' => $names
    ];
}

/**
 * Get players with largest tsumo count during single hanchan
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @throws \Exception
 * @return array
 */
function getBestTsumoistInSingleSession(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('winner_id')
        ->select('session_id')
        ->selectExpr('count(*)', 'cnt')
        ->whereIn('event_id', $eventIdList)
        ->where('outcome', 'tsumo')
        ->groupBy('winner_id')
        ->groupBy('session_id')
        ->orderByDesc('cnt')
        ->findArray();
    $maxTsumo = 0;
    $names = [];
    foreach ($rounds as $round) {
        if ($maxTsumo === 0) {
            $maxTsumo = $round['cnt'];
        }

        if ($round['cnt'] < $maxTsumo) {
            continue;
        }

        $names []= $players[$round['winner_id']]['title'];
    }

    return [
        'tsumo' => $maxTsumo,
        'names' => $names
    ];
}

/**
 * Get players who collected largest amount of yakuhais
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @throws \Exception
 * @return array
 */
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
        $name = $players[$round['winner_id']]['title'];
        if (empty($yakuhaiStats[$name])) {
            $yakuhaiStats[$name] = 0;
        }

        $yaku = explode(',', $round['yaku']);
        foreach ($yaku as $id) {
            switch ($id) {
                case Y_YAKUHAI1:
                    $yakuhaiStats[$name] ++;
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
                default:
                    ;
            }
        }
    }

    arsort($yakuhaiStats);
    $arr = array_slice($yakuhaiStats, 0, 3);
    $retval = [];
    foreach ($arr as $k => $v) {
        $retval []= ['count' => $v, 'name' => $k];
    }
    return $retval;
}

/**
 * Get players who fed into most expensive hand (but not while being riichi)
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @throws \Exception
 * @return array
 */
function getImpossibleWait(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('loser_id')
        ->select('riichi')
        ->select('han')
        ->select('fu')
        ->whereIn('event_id', $eventIdList)
        ->whereIn('outcome', ['multiron', 'ron'])
        ->orderByDesc('han')
        ->orderByDesc('fu')
        ->limit(100) // limit here for performance reasons
        ->findArray();

    $filteredRounds = array_filter($rounds, function ($round) {
        return !in_array($round['loser_id'], explode(',', $round['riichi']));
    });

    return array_map(function ($round) use (&$players) {
        return [
            'name' => $players[$round['loser_id']]['title'],
            'hand' => ['han' => $round['han'], 'fu' => $round['han'] > 4 ? null : $round['fu']]
        ];
    }, array_slice($filteredRounds, 0, 10));
}

/**
 * Get players with largest ippatsu count
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @throws \Exception
 * @return array
 */
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

/**
 * Get players with largest average count of dora in player's hand
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @return array
 */
function getMaxAverageDoraCount(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('winner_id')
        ->selectExpr('sum(dora)*1.0/count(*) as average')
        ->whereIn('event_id', $eventIdList)
        ->whereIn('outcome', ['multiron', 'ron', 'tsumo'])
        ->groupBy('winner_id')
        ->orderByDesc('average')
        ->findArray();

    $filteredRounds = array_filter($rounds, function ($round) {
        return !empty($round['average']);
    });

    return array_map(
        function ($round) use (&$players) {
            return [
                'name' => $players[$round['winner_id']]['title'],
                'count' => sprintf('%.2f', $round['average'])
            ];
        },
        array_slice($filteredRounds, 0, 5)
    );
}

/**
 * Get players with largest amount of unique yaku collected during the tournament
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @return array
 */
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

/**
 * Get players with largest amount of points received as ryukoku payments
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @return array
 */
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
            default:
                ;
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

/**
 * Get players with largest damaten count
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @return array
 */
function getNinja(Db $db, array $eventIdList, array $players)
{
    $rounds = $db->table('round')
        ->select('winner_id')
        ->select('riichi')
        ->whereIn('event_id', $eventIdList)
        ->whereIn('outcome', ['multiron', 'ron', 'tsumo'])
        ->where('open_hand', 0)
        ->findArray();

    $filteredRounds = array_filter($rounds, function ($round) {
        return !in_array($round['winner_id'], explode(',', $round['riichi']));
    });

    $counts = [];
    if ($filteredRounds) {
        foreach ($filteredRounds as $round) {
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

/**
 * Get top 3 players with biggest score by the end of session
 *
 * @param Db $db
 * @param int[] $eventIdList
 * @param array $players
 * @return array
 */
function getNeedMoreGold(Db $db, array $eventIdList, array $players)
{
    $results = $db->table('session_results')
        ->select('player_id')
        ->select('score')
        ->whereIn('event_id', $eventIdList)
        ->orderByDesc('score')
        ->limit(3)
        ->findArray();
    foreach ($results as &$result) {
        $result['title'] = $players[$result['player_id']]['title'];
    }
    return $results;
}
