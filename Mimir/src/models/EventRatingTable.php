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

use Common\PlatformType;

require_once __DIR__ . '/../Model.php';
require_once __DIR__ . '/../helpers/MultiRound.php';
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/Session.php';
require_once __DIR__ . '/../primitives/SessionResults.php';
require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../primitives/PlayerRegistration.php';
require_once __DIR__ . '/../primitives/PlayerHistory.php';
require_once __DIR__ . '/../primitives/Round.php';
require_once __DIR__ . '/../primitives/Penalty.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';

class EventRatingTableModel extends Model
{
    /**
     * @param EventPrimitive[] $eventList
     * @param array $playerRegs
     * @param string $orderBy
     * @param string $order
     * @param bool $isAdmin show prefinished games and also all rating table if it's hidden
     * @param bool $onlyMinGames
     * @return array
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getRatingTable($eventList, $playerRegs, string $orderBy, string $order, $isAdmin = false, $onlyMinGames = false)
    {
        if (!in_array($order, ['asc', 'desc'])) {
            throw new InvalidParametersException("Parameter order should be either 'asc' or 'desc'");
        }

        $eventIds = array_filter(array_map(function (EventPrimitive $e) {
            return $e->getId();
        }, $eventList));

        $mainEvent = $eventList[0];
        $minGamesCount = $mainEvent->getMinGamesCount();

        /** @var PlayerHistoryPrimitive[] $playersHistoryItemsCombined */
        $playersHistoryItemsCombined = [];

        $historyItems = array_reduce(PlayerHistoryPrimitive::findLastByEvent($this->_ds, $eventIds), function ($acc, PlayerHistoryPrimitive $item) {
            if (empty($acc[$item->getEventId()])) {
                $acc[$item->getEventId()] = [];
            }
            $acc[$item->getEventId()] []= $item;
            return $acc;
        }, []);

        $tmpFakeItems = $isAdmin ? $this->_getFakePrefinishedItems($eventIds) : [];

        /* Algorithm is kinda complicated when we want to get rating table for several events,
         * so here is its description step by step:
         * 1. We get history items for each event and place them all in a
         *    single $playersHistoryItemsCombined array.
         *    In the same loop we also get all unique players for all the events. We
         *    want unique players, because some players may have participated in all the events,
         *    some - only in one event. They are placed into $playerItems array.
         * 2. For each player we find all history items that are related to him. Then we create a new
         *    history item that is the sum of all player's history items. New items are
         *    placed into $playerHistoryItemsSummed array. The size of this array is now the
         *    same as the size of $playerItems array.
         * 3. The rest is the same for one-event case and multi-event case. */

        foreach ($eventList as $event) {
            $playersHistoryItems = [];
            $eId = $event->getId();
            if (empty($eId)) {
                throw new InvalidParametersException('Attempted to use deidented primitive');
            }

            if (!$event->getHideResults() || $isAdmin) {
                foreach ($historyItems[$eId] as $item) {
                    // php kludge: keys should be string, not numeric (to overwrite values)
                    $playersHistoryItems['id' . $item->getPlayerId()] = $item;
                }

                if ($isAdmin) {
                    // Include fake player history items made of prefinished games results
                    $fakeItems = [];
                    foreach ($tmpFakeItems[$eId] as $item) {
                        // php kludge: keys should be string, not numeric (to overwrite values)
                        $fakeItems['id' . $item->getPlayerId()] = $item;
                    }
                    $playersHistoryItems = array_merge($playersHistoryItems, $fakeItems);
                    // Warning: don't ever call ->save() on these items!
                }

                $playersHistoryItemsCombined = array_merge($playersHistoryItemsCombined, array_values($playersHistoryItems));
            }
        }

        $playerItems = $this->_getPlayers($playersHistoryItemsCombined);

        /** @var PlayerHistoryPrimitive[] $playerHistoryItemsSummed */
        $playerHistoryItemsSummed = [];
        foreach ($playerItems as $player) {
            $itemsByPlayer = array_values(
                array_filter(
                    $playersHistoryItemsCombined,
                    function ($v, $k) use ($player) {
                        /** @var $v PlayerHistoryPrimitive */
                        return $v->getPlayerId() == $player->getId();
                    },
                    ARRAY_FILTER_USE_BOTH
                )
            );

            $newItem = $itemsByPlayer[0];
            foreach ($itemsByPlayer as $k => $item) {
                if ($k == 0) {
                    continue;
                }
                $newItem = PlayerHistoryPrimitive::makeHistoryItemsSum(
                    $newItem,
                    $item
                );
            }

            array_push($playerHistoryItemsSummed, $newItem);
        }

        $teams = [];
        foreach ($playerRegs as $reg) {
            $teams[$reg['id']] = $reg['team_name'];
        }

        $soulNicknames = [];
        if ($mainEvent->getPlatformId() === PlatformType::PLATFORM_TYPE_MAHJONGSOUL) {
            $soulNicknames = $this->_ds->remote()->getMajsoulNicknames(array_map(function (PlayerHistoryPrimitive $el) {
                return (int)$el->getPlayerId();
            }, $playerHistoryItemsSummed));
        }

        $startRating = $mainEvent->getRulesetConfig()->rules()->getStartRating();

        // arbitrary penalties
        /** @var (int|float)[] $penalties */
        $penalties = array_reduce(PenaltyPrimitive::findByEventId($this->_ds, $eventIds), function ($acc, PenaltyPrimitive $item) {
            if (empty($acc[$item->getPlayerId()])) {
                $acc[$item->getPlayerId()] = ['amount' => 0, 'count' => 0];
            }
            $acc[$item->getPlayerId()]['amount'] += $item->getAmount();
            $acc[$item->getPlayerId()]['count'] ++;
            return $acc;
        }, []);

        $data = array_map(function (PlayerHistoryPrimitive $el) use ($playerItems, $penalties, $mainEvent, $teams, $startRating, $soulNicknames) {
            $penalty = ['amount' => 0, 'count' => 0];
            if (!empty($penalties[(int)$el->getPlayerId()])) {
                $penalty = $penalties[(int)$el->getPlayerId()];
            }

            return [
                'id'              => (int)$el->getPlayerId(),
                'title'           => $playerItems[$el->getPlayerId()]->getDisplayName(),
                'has_avatar'      => $playerItems[$el->getPlayerId()]->getHasAvatar(),
                'last_update'     => $playerItems[$el->getPlayerId()]->getLastUpdate(),
                'tenhou_id'       => $mainEvent->getPlatformId() === PlatformType::PLATFORM_TYPE_MAHJONGSOUL
                    ? ($soulNicknames[(int)$el->getPlayerId()] ?? '')
                    : $playerItems[$el->getPlayerId()]->getTenhouId(),
                'rating'          => (float)$el->getRating() - $penalty['amount'],
                'penalties'       => ['count' => $penalty['count'], 'amount' => $penalty['amount']],
                'chips'           => (int)$el->getChips(),
                'team_name'       => empty($teams[$el->getPlayerId()]) ? '' : $teams[$el->getPlayerId()],
                'winner_zone'     => $el->getRating() >= $mainEvent->getRulesetConfig()->rules()->getStartRating(),
                'avg_place'       => round($el->getAvgPlace(), 4),
                'avg_score'       => $el->getGamesPlayed() == 0
                    ? 0
                    : round($el->getAvgScore($startRating), 4),
                'games_played'    => (int)$el->getGamesPlayed()
            ];
        }, $playerHistoryItemsSummed);

        // Now we have all the data and all modifications applied, and we need just to apply some sorting

        $this->_sortItems($startRating, $orderBy, $playerItems, $data);

        if ($order === 'desc') {
            $data = array_reverse($data);
        }

        if ($mainEvent->getSortByGames()) {
            $this->_stableSort(
                $data,
                function ($el1, $el2) {
                    if ($el1['games_played'] == $el2['games_played']) {
                        return 0;
                    }

                    return $el1['games_played'] < $el2['games_played'] ? 1 : -1; // swap for desc sort
                }
            );
        }

        if ($onlyMinGames) {
            $data = array_filter($data, function ($el) use ($minGamesCount) {
                return $el['games_played'] >= $minGamesCount;
            });
        }

        return $data;
    }

    /**
     * For games that should end synchronously, make fake history items
     * to properly display rating table for tournament administrators.
     * These history items are NOT intended to be SAVED!
     *
     * @param int[] $eventIds
     * @return PlayerHistoryPrimitive[]
     * @throws \Exception
     */
    protected function _getFakePrefinishedItems($eventIds)
    {
        $sessions = SessionPrimitive::findByEventAndStatus($this->_ds, $eventIds, SessionPrimitive::STATUS_PREFINISHED);
        $historyItems = [];

        foreach ($sessions as $session) {
            if (empty($historyItems[$session->getEventId()])) {
                $historyItems[$session->getEventId()] = [];
            }

            $sessionResults = $session->getSessionResults();
            foreach ($sessionResults as $sessionResult) {
                $historyItems[$session->getEventId()] []= PlayerHistoryPrimitive::makeNewHistoryItem(
                    $this->_ds,
                    $sessionResult->getPlayer(),
                    $session,
                    $sessionResult->getRatingDelta(),
                    $sessionResult->getPlace()
                );
            }
        }

        return $historyItems;
    }

    /**
     * @param PlayerHistoryPrimitive[] $playersHistoryItems
     * @return PlayerPrimitive[]
     * @throws \Exception
     */
    protected function _getPlayers($playersHistoryItems)
    {
        $ids = array_map(function (PlayerHistoryPrimitive $el) {
            return $el->getPlayerId();
        }, $playersHistoryItems);
        $players = PlayerPrimitive::findById($this->_ds, $ids);

        $result = [];
        foreach ($players as $p) {
            $result[$p->getId()] = $p;
        }

        return $result;
    }

    /**
     * @param float $startRating
     * @param string $orderBy
     * @param PlayerPrimitive[] $playerItems
     * @param array $ratingLines
     *
     * @return void
     *@throws InvalidParametersException
     *
     */
    protected function _sortItems(float $startRating, string $orderBy, &$playerItems, &$ratingLines): void
    {
        switch ($orderBy) {
            case 'name':
                usort($ratingLines, function ($el1, $el2) use (&$playerItems) {
                    return strcmp(
                        $playerItems[$el1['id']]->getDisplayName(),
                        $playerItems[$el2['id']]->getDisplayName()
                    );
                });
                break;
            case 'rating':
                usort($ratingLines, function ($el1, $el2) {
                    if (abs($el1['rating'] - $el2['rating']) < 0.0001) {
                        return ($el2['avg_place'] - $el1['avg_place']) > 0 ? 1 : -1; // lower avg place is better, so invert
                    }
                    if ($el1['rating'] - $el2['rating'] < 0) { // higher rating is better
                        return -1;  // usort casts return result to int, so pass explicit int here.
                    } else {
                        return 1;
                    }
                });
                break;
            case 'avg_place':
                usort($ratingLines, function ($el1, $el2) {
                    if (abs($el1['avg_place'] - $el2['avg_place']) < 0.0001) { // floats need epsilon
                        return ($el2['rating'] - $el1['rating']) > 0 ? 1 : -1; // lower rating is worse, so invert
                    }
                    if ($el1['avg_place'] - $el2['avg_place'] < 0) { // higher avg place is worse
                        return -1; // usort casts return result to int, so pass explicit int here.
                    } else {
                        return 1;
                    }
                });
                break;
            case 'avg_score':
                usort($ratingLines, function ($el1, $el2) use ($startRating) {
                    if (abs($el1['avg_score'] - $el2['avg_score']) < 0.0001) {
                        return ($el2['avg_place'] - $el1['avg_place']) > 0 ? 1 : -1; // lower avg place is better, so invert
                    }
                    if ($el1['avg_score'] - $el2['avg_score'] < 0) { // higher rating is better
                        return -1;  // usort casts return result to int, so pass explicit int here.
                    } else {
                        return 1;
                    }
                });
                break;
            case 'chips':
                usort($ratingLines, function ($el1, $el2) {
                    if (abs($el1['chips'] - $el2['chips']) < 0.0001) {
                        return ($el2['rating'] - $el1['rating']) > 0 ? 1 : -1; // lower rating is worse, so invert
                    }
                    if ($el1['chips'] - $el2['chips'] < 0) {
                        return -1; // usort casts return result to int, so pass explicit int here.
                    } else {
                        return 1;
                    }
                });
                break;
            default:
                throw new InvalidParametersException("Parameter orderBy should be either 'name', 'rating' or 'avg_place'");
        }
    }

    /**
     * @param array $array
     * @param callable|null $comparer
     *
     * @return void
     */
    protected function _stableSort(array &$array, callable $comparer = null)
    {
        // Arrays of size < 2 require no action.
        if (count($array) < 2) {
            return;
        }

        if ($comparer === null) {
            $comparer = 'strcmp';
        }

        // Split the array in half
        $halfway = intval(count($array) / 2);
        $array1 = array_slice($array, 0, $halfway);
        $array2 = array_slice($array, $halfway);

        // Recurse to sort the two halves
        $this->_stableSort($array1, $comparer);
        $this->_stableSort($array2, $comparer);
        // If all of $array1 is <= all of $array2, just append them.
        if (call_user_func($comparer, end($array1), $array2[0]) < 1) {
            $array = array_merge($array1, $array2);
            return;
        }

        // Merge the two sorted arrays into a single sorted array
        $array = array();
        $ptr1 = $ptr2 = 0;
        while ($ptr1 < count($array1) && $ptr2 < count($array2)) {
            if (call_user_func($comparer, $array1[$ptr1], $array2[$ptr2]) < 1) {
                $array[] = $array1[$ptr1++];
            } else {
                $array[] = $array2[$ptr2++];
            }
        }

        // Merge the remainder
        while ($ptr1 < count($array1)) {
            $array[] = $array1[$ptr1++];
        }
        while ($ptr2 < count($array2)) {
            $array[] = $array2[$ptr2++];
        }
    }
}
