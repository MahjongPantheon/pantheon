<?php
/*  Mimir: mahjong games storage
 *  Copyright (C) 2016  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
namespace Mimir;

require_once __DIR__ . '/../helpers/YakuMap.php';
require_once __DIR__ . '/../Primitive.php';

/**
 * Class AchievementsPrimitive
 * Should not be used in AR scenarios; all functions are static
 *
 * @package Mimir
 */
class AchievementsPrimitive extends Primitive
{
    protected static $_table = '';
    protected static $_fieldsMapping = [];

    protected function _deident()
    {
        // nothing
    }

    protected function _getFieldsTransforms()
    {
        return [];
    }

    /**
     * AchievementsPrimitive constructor.
     * @param DataSource $ds
     * @throws BadActionException
     */
    public function __construct(DataSource $ds) // Missing parent constructor call is intended
    {
        throw new BadActionException('This primitive is not expected to be instantiated, use static methods instead');
    }

    protected function _create()
    {
        // nothing
    }

    /**
     * Get players who collected hand with maximum fu
     *
     * @param DataSource $ds
     * @param $eventIdList
     * @throws \Exception
     * @return array
     */
    public static function getMaxFuHand(DataSource $ds, $eventIdList)
    {
        $rounds = $ds->table('round')
            ->select('fu')
            ->select('winner_id')
            ->select('display_name')
            ->join('player', ['player.id', '=', 'round.winner_id'])
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

            $names []= $round['display_name'];
        }

        return [
            'fu' => $maxFu,
            'names' => array_values(array_unique($names))
        ];
    }

    /**
     * Get players who played most as dealer
     *
     * @param DataSource $ds
     * @param $eventIdList
     * @throws \Exception
     * @return array
     */
    public static function getBestDealer(DataSource $ds, $eventIdList)
    {
        $rounds = $ds->table('round')
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
            $bestDealers []= $id;
        }

        $players = $ds->table('player')
            ->select('id')
            ->select('display_name')
            ->whereIdIn($bestDealers)
            ->findArray();

        return [
            'names' => array_map(function ($p) {
                return $p['display_name'];
            }, $players),
            'bestWinCount' => $bestCount
        ];
    }

    /**
     * Get players who collected largest amount of 1/30 hands
     *
     * @param DataSource $ds
     * @param $eventIdList
     * @throws \Exception
     * @return array
     */
    public static function getBestShithander(DataSource $ds, $eventIdList)
    {
        $rounds = $ds->table('round')
            ->select('winner_id')
            ->select('display_name')
            ->selectExpr('count(*)', 'cnt')
            ->join('player', ['player.id', '=', 'round.winner_id'])
            ->whereIn('event_id', $eventIdList)
            ->where('han', 1)
            ->where('fu', 30)
            ->whereRaw('dora is null')
            ->groupBy('winner_id')
            ->groupBy('display_name')
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

            $names []= $round['display_name'];
        }

        return [
            'handsCount' => $maxHands,
            'names' => $names
        ];
    }

    /**
     * Get player who collected most expensive hand
     *
     * @param DataSource $ds
     * @param $eventIdList
     * @throws \Exception
     * @return array
     */
    public static function getBestHandOfEvent(DataSource $ds, $eventIdList)
    {
        $rounds = $ds->table('round')
            ->select('han')
            ->select('winner_id')
            ->select('display_name')
            ->join('player', ['player.id', '=', 'round.winner_id'])
            ->whereIn('event_id', $eventIdList)
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

            $names []= $round['display_name'];
        }

        return [
            'han' => $maxHan,
            'names' => $names
        ];
    }

    /**
     * Get players who collected a yakuman
     *
     * @param DataSource $ds
     * @param $eventIdList
     * @throws \Exception
     * @return array
     */
    public static function getYakumans(DataSource $ds, $eventIdList)
    {
        $rounds = $ds->table('round')
            ->select('winner_id')
            ->select('display_name')
            ->select('yaku')
            ->join('player', ['player.id', '=', 'round.winner_id'])
            ->whereIn('event_id', $eventIdList)
            ->whereIn('outcome', ['ron', 'tsumo', 'multiron'])
            ->whereLt('han', 0) // yakuman
            ->findArray();
        $players = array_map(function ($round) {
            return [
                'name' => $round['display_name'],
                'yaku' => $round['yaku']
            ];
        }, $rounds);
        return empty($players) ? 'No yakumans!' : $players;
    }

    /**
     * Get players who has largest count of feeding into others' hands
     *
     * @param DataSource $ds
     * @param $eventIdList
     * @throws \Exception
     * @return array
     */
    public static function getBraveSappers(DataSource $ds, $eventIdList)
    {
        $rounds = $ds->table('round')
            ->select('loser_id')
            ->select('display_name')
            ->selectExpr('count(*)', 'cnt')
            ->join('player', ['player.id', '=', 'round.loser_id'])
            ->whereIn('event_id', $eventIdList)
            ->whereIn('outcome', ['ron', 'multiron'])
            ->groupBy('loser_id')
            ->groupBy('display_name')
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

            $names []= $round['display_name'];
        }

        return [
            'feed' => $maxThrows,
            'names' => $names
        ];
    }

    /**
     * Get players who has smallest count of feeding into others' hands
     *
     * @param DataSource $ds
     * @param $eventIdList
     * @throws \Exception
     * @return array
     */
    public static function getDieHardData(DataSource $ds, $eventIdList)
    {
        $rounds = $ds->table('round')
            ->select('loser_id')
            ->select('display_name')
            ->selectExpr('count(*)', 'cnt')
            ->join('player', ['player.id', '=', 'round.loser_id'])
            ->whereIn('event_id', $eventIdList)
            ->whereIn('outcome', ['ron', 'multiron'])
            ->groupBy('loser_id')
            ->groupBy('display_name')
            ->orderByDesc('cnt')
            ->findArray();

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

            $names []= $round['display_name'];
        }

        return [
            'feed' => $minThrows,
            'names' => $names
        ];
    }

    /**
     * Get players with largest tsumo count during single hanchan
     *
     * @param DataSource $ds
     * @param $eventIdList
     * @throws \Exception
     * @return array
     */
    public static function getBestTsumoistInSingleSession(DataSource $ds, $eventIdList)
    {
        $rounds = $ds->table('round')
            ->select('winner_id')
            ->select('session_id')
            ->select('display_name')
            ->selectExpr('count(*)', 'cnt')
            ->join('player', ['player.id', '=', 'round.winner_id'])
            ->whereIn('event_id', $eventIdList)
            ->where('outcome', 'tsumo')
            ->groupBy('winner_id')
            ->groupBy('session_id')
            ->groupBy('display_name')
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

            $names []= $round['display_name'];
        }

        return [
            'tsumo' => $maxTsumo,
            'names' => $names
        ];
    }

    /**
     * Get players who collected largest amount of yakuhais
     *
     * @param DataSource $ds
     * @param $eventIdList
     * @throws \Exception
     * @return array
     */
    public static function getDovakins(DataSource $ds, $eventIdList)
    {
        $rounds = $ds->table('round')
            ->select('display_name')
            ->select('yaku')
            ->join('player', ['player.id', '=', 'round.winner_id'])
            ->whereIn('event_id', $eventIdList)
            ->whereIn('outcome', ['tsumo', 'ron', 'multiron'])
            ->findArray();

        $yakuhaiStats = [];
        foreach ($rounds as $round) {
            if (empty($yakuhaiStats[$round['display_name']])) {
                $yakuhaiStats[$round['display_name']] = 0;
            }

            $yaku = explode(',', $round['yaku']);
            foreach ($yaku as $id) {
                switch ($id) {
                    case Y_YAKUHAI1:
                        $yakuhaiStats[$round['display_name']] ++;
                        break;
                    case Y_YAKUHAI2:
                        $yakuhaiStats[$round['display_name']] += 2;
                        break;
                    case Y_YAKUHAI3:
                        $yakuhaiStats[$round['display_name']] += 3;
                        break;
                    case Y_YAKUHAI4:
                        $yakuhaiStats[$round['display_name']] += 4;
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
     * @param DataSource $ds
     * @param $eventIdList
     * @throws \Exception
     * @return array
     */
    public static function getImpossibleWait(DataSource $ds, $eventIdList)
    {
        $rounds = $ds->table('round')
            ->select('loser_id')
            ->select('display_name')
            ->select('riichi')
            ->select('han')
            ->select('fu')
            ->join('player', ['player.id', '=', 'round.loser_id'])
            ->whereIn('event_id', $eventIdList)
            ->whereIn('outcome', ['multiron', 'ron'])
            ->orderByDesc('han')
            ->orderByDesc('fu')
            ->limit(100) // limit here for performance reasons
            ->findArray();

        $filteredRounds = array_filter($rounds, function ($round) {
            return !in_array($round['loser_id'], explode(',', $round['riichi']));
        });

        return array_map(function ($round) {
            return [
                'name' => $round['display_name'],
                'hand' => ['han' => $round['han'], 'fu' => $round['han'] > 4 ? null : $round['fu']]
            ];
        }, array_slice($filteredRounds, 0, 10));
    }

    /**
     * Get players with largest ippatsu count
     *
     * @param DataSource $ds
     * @param $eventIdList
     * @throws \Exception
     * @return array
     */
    public static function getJustAsPlanned(DataSource $ds, $eventIdList)
    {
        $rounds = $ds->table('round')
            ->select('winner_id')
            ->select('display_name')
            ->select('yaku')
            ->join('player', ['player.id', '=', 'round.winner_id'])
            ->whereIn('event_id', $eventIdList)
            ->whereIn('outcome', ['multiron', 'ron', 'tsumo'])
            ->findArray();

        $filteredRounds = array_filter($rounds, function ($round) {
            return in_array(Y_IPPATSU, explode(',', $round['yaku']));
        });

        $counts = [];
        foreach ($filteredRounds as $round) {
            if (empty($counts[$round['display_name']])) {
                $counts[$round['display_name']] = 0;
            }

            $counts[$round['display_name']] ++;
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
     * @param IDb $db
     * @param $eventIdList
     * @return array
     */
    public static function getMaxAverageDoraCount(IDb $db, $eventIdList)
    {
        $rounds = $db->table('round')
            ->select('winner_id')
            ->select('display_name')
            ->selectExpr('sum(dora)*1.0/count(*) as average')
            ->join('player', ['player.id', '=', 'round.winner_id'])
            ->whereIn('event_id', $eventIdList)
            ->whereIn('outcome', ['multiron', 'ron', 'tsumo'])
            ->groupBy('winner_id')
            ->groupBy('display_name')
            ->orderByDesc('average')
            ->findArray();

        $filteredRounds = array_filter($rounds, function ($round) {
            return !empty($round['average']);
        });

        return array_map(
            function ($round) {
                return [
                    'name' => $round['display_name'],
                    'count' => sprintf('%.2f', $round['average'])
                ];
            },
            array_slice($filteredRounds, 0, 5)
        );
    }

    /**
     * Get players with largest amount of unique yaku collected during the tournament
     *
     * @param IDb $db
     * @param $eventIdList
     * @return array
     */
    public static function getMaxDifferentYakuCount(IDb $db, $eventIdList)
    {
        $rounds = $db->table('round')
            ->select('winner_id')
            ->select('display_name')
            ->select('yaku')
            ->join('player', ['player.id', '=', 'round.winner_id'])
            ->whereIn('event_id', $eventIdList)
            ->whereIn('outcome', ['multiron', 'ron', 'tsumo'])
            ->findArray();

        $playersYaku = [];
        foreach ($rounds as $round) {
            if (empty($playersYaku[$round['display_name']])) {
                $playersYaku[$round['display_name']] = [];
            }

            foreach (explode(',', $round['yaku']) as $yaku) {
                if (in_array($yaku, [Y_YAKUHAI2, Y_YAKUHAI3, Y_YAKUHAI4, Y_YAKUHAI5])) {
                    $yaku = Y_YAKUHAI1;
                }

                if (!in_array($yaku, $playersYaku[$round['display_name']])) {
                    array_push($playersYaku[$round['display_name']], $yaku);
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
     * @param IDb $db
     * @param $eventIdList
     * @return array
     */
    public static function getFavoriteAsapinApprentice(IDb $db, $eventIdList)
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

        $names = $db->table('player')
            ->select('id')
            ->select('display_name')
            ->whereIdIn(array_slice(array_keys($filteredPayments), 0, 5))
            ->findArray();

        $namesAssoc = [];
        foreach ($names as $item) {
            $namesAssoc[$item['id']] = $item['display_name'];
        }

        return array_map(
            function ($playerId, $payment) use ($namesAssoc) {
                return [
                    'name' => $namesAssoc[$playerId],
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
     * @param IDb $db
     * @param $eventIdList
     * @return array
     */
    public static function getNinja(IDb $db, $eventIdList)
    {
        $rounds = $db->table('round')
            ->select('winner_id')
            ->select('display_name')
            ->select('riichi')
            ->join('player', ['player.id', '=', 'round.winner_id'])
            ->whereIn('event_id', $eventIdList)
            ->whereIn('outcome', ['multiron', 'ron', 'tsumo'])
            ->where('open_hand', 0)
            ->findArray();

        $filteredRounds = array_filter($rounds, function ($round) {
            return !in_array($round['winner_id'], explode(',', $round['riichi']));
        });

        $counts = [];
        foreach ($filteredRounds as $round) {
            if (empty($counts[$round['display_name']])) {
                $counts[$round['display_name']] = 0;
            }

            $counts[$round['display_name']] ++;
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

    public function save()
    {
        // nothing
    }

    public function drop()
    {
        // nothing
    }

    public function getId()
    {
        // nothing
    }
}
