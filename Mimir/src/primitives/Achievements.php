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
namespace Riichi;

require_once __DIR__ . '/../helpers/YakuMap.php';
require_once __DIR__ . '/../Primitive.php';

/**
 * Class MultiRoundPrimitive
 * Special case of round: multi-ron, contains multiple RoundPrimitives
 *
 * Low-level model with basic CRUD operations and relations
 * @package Riichi
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

    public function __construct(IDb $db)
    {
        throw new BadActionException('This primitive is not expected to be instantiated, use static methods instead');
    }

    protected function _create()
    {
        // nothing
    }

    public static function getBestHandOfEvent(IDb $db, $eventId)
    {
        $rounds = $db->table('round')
            ->select('han')
            ->select('winner_id')
            ->select('display_name')
            ->join('player', ['player.id', '=', 'round.winner_id'])
            ->where('event_id', $eventId)
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

    public static function getChomboMasters(IDb $db, $eventId)
    {
        $rounds = $db->table('round')
            ->select('loser_id')
            ->select('display_name')
            ->selectExpr('count(*)', 'cnt')
            ->join('player', ['player.id', '=', 'round.loser_id'])
            ->where('event_id', $eventId)
            ->where('outcome', 'chombo')
            ->groupBy('loser_id')
            ->orderByDesc('cnt')
            ->findArray();
        return array_map(function ($round) {
            return [
                'name' => $round['display_name'],
                'count' => $round['cnt']
            ];
        }, $rounds);
    }

    public static function getYakumans(IDb $db, $eventId)
    {
        $rounds = $db->table('round')
            ->select('winner_id')
            ->select('display_name')
            ->join('player', ['player.id', '=', 'round.winner_id'])
            ->where('event_id', $eventId)
            ->whereIn('outcome', ['ron', 'tsumo'])
            ->whereLt('han', 0) // yakuman
            ->findArray();
        return array_map(function ($round) {
            return $round['display_name'];
        }, $rounds);
    }

    public static function getBraveSappers(IDb $db, $eventId)
    {
        $rounds = $db->table('round')
            ->select('loser_id')
            ->select('display_name')
            ->selectExpr('count(*)', 'cnt')
            ->join('player', ['player.id', '=', 'round.loser_id'])
            ->where('event_id', $eventId)
            ->where('outcome', 'ron')
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

            $names []= $round['display_name'];
        }

        return [
            'feed' => $maxThrows,
            'names' => $names
        ];
    }

    public static function getBestTsumoistInSingleSession(IDb $db, $eventId)
    {
        $rounds = $db->table('round')
            ->select('winner_id')
            ->select('session_id')
            ->select('display_name')
            ->selectExpr('count(*)', 'cnt')
            ->join('player', ['player.id', '=', 'round.winner_id'])
            ->where('event_id', $eventId)
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

            $names []= $round['display_name'];
        }

        return [
            'tsumo' => $maxTsumo,
            'names' => $names
        ];
    }

    public static function getDovakins(IDb $db, $eventId)
    {
        $rounds = $db->table('round')
            ->select('display_name')
            ->select('yaku')
            ->join('player', ['player.id', '=', 'round.winner_id'])
            ->where('event_id', $eventId)
            ->whereIn('outcome', ['tsumo', 'ron'])
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
        return array_slice($yakuhaiStats, 0, 3);
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
