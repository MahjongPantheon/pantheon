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

require_once __DIR__ . '/../Model.php';
require_once __DIR__ . '/../helpers/MultiRound.php';
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/Session.php';
require_once __DIR__ . '/../primitives/SessionResults.php';
require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../primitives/PlayerRegistration.php';
require_once __DIR__ . '/../primitives/PlayerHistory.php';
require_once __DIR__ . '/../primitives/Round.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';

class EventRatingTableModel extends Model
{
    /**
     * @param EventPrimitive[] $eventList
     * @param array $playerRegs
     * @param string $orderBy
     * @param string $order
     * @param bool $withPrefinished
     * @param bool $onlyMinGames
     * @return array
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getRatingTable($eventList, $playerRegs, string $orderBy, string $order, $withPrefinished = false, $onlyMinGames = false)
    {
        if (!in_array($order, ['asc', 'desc'])) {
            throw new InvalidParametersException("Parameter order should be either 'asc' or 'desc'");
        }

        $mainEvent = $eventList[0];
        $minGamesCount = $mainEvent->getMinGamesCount();

        /** @var PlayerHistoryPrimitive[] $playersHistoryItemsCombined */
        $playersHistoryItemsCombined = [];
        /** @var PlayerPrimitive[] $playerItems */
        $playerItems = [];

        /* Algorithm is kinda complicated when we want to get rating table for several events,
         * so here is its description step by step:
         * 1. We get history items for each event and place them all in a
         *    single $playersHistoryItemsCombined array.
         *    In the same loop we also get all unique players for all the events. We
         *    want unique players, because some players may have participated in all of the events,
         *    some - only in one event. They are placed into $playerItems array.
         * 2. For each player we find all history items that concern him. Then we create a new
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

            /* FIXME (PNTN-237): refactor to get rid of accessing DB in a loop. */
            $tmpPlayersHistoryItems = PlayerHistoryPrimitive::findLastByEvent($this->_ds, $eId);
            foreach ($tmpPlayersHistoryItems as $item) {
                // php kludge: keys should be string, not numeric (to overwrite values)
                $playersHistoryItems['id' . $item->getPlayerId()] = $item;
            }

            if ($withPrefinished) {
                // Include fake player history items made of prefinished games results
                $tmpFakeItems = $this->_getFakePrefinishedItems($event);
                $fakeItems = [];
                foreach ($tmpFakeItems as $item) {
                    // php kludge: keys should be string, not numeric (to overwrite values)
                    $fakeItems['id' . $item->getPlayerId()] = $item;
                }
                $playersHistoryItems = array_merge($playersHistoryItems, $fakeItems);
                // Warning: don't ever call ->save() on these items!
            }

            $playersHistoryItems = array_values($playersHistoryItems);
            /* We use '+' operator here, because we want to keep keys (player id) and we know, that
             * merged arrays can't have different values for same keys. */
            $playerItems = $playerItems + $this->_getPlayers($playersHistoryItems);

            $playersHistoryItemsCombined = array_merge($playersHistoryItemsCombined, $playersHistoryItems);
        }

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

        $startRating = $mainEvent->getRulesetConfig()->rules()->getStartRating();
        $this->_sortItems($startRating, $orderBy, $playerItems, $playerHistoryItemsSummed);

        if ($order === 'desc') {
            $playerHistoryItemsSummed = array_reverse($playerHistoryItemsSummed);
        }

        if ($mainEvent->getSortByGames()) {
            $this->_stableSort(
                $playerHistoryItemsSummed,
                function (PlayerHistoryPrimitive $el1, PlayerHistoryPrimitive $el2) {
                    if ($el1->getGamesPlayed() == $el2->getGamesPlayed()) {
                        return 0;
                    }

                    return $el1->getGamesPlayed() < $el2->getGamesPlayed() ? 1 : -1; // swap for desc sort
                }
            );
        }

        $teams = [];
        foreach ($playerRegs as $reg) {
            $teams[$reg['id']] = $reg['team_name'];
        }

        $data = array_map(function (PlayerHistoryPrimitive $el) use ($playerItems, $mainEvent, $teams, $startRating) {
            return [
                'id'            => (int)$el->getPlayerId(),
                'title'  => $playerItems[$el->getPlayerId()]->getDisplayName(),
                'tenhou_id'     => $playerItems[$el->getPlayerId()]->getTenhouId(),
                'rating'        => (float)$el->getRating(),
                'chips'         => (int)$el->getChips(),
                'team_name'     => empty($teams[$el->getPlayerId()]) ? '' : $teams[$el->getPlayerId()],
                'winner_zone'   => $el->getRating() >= $mainEvent->getRulesetConfig()->rules()->getStartRating(),
                'avg_place'     => round($el->getAvgPlace(), 4),
                'avg_score'     => $el->getGamesPlayed() == 0
                    ? 0
                    : round($el->getAvgScore($startRating), 4),
                'games_played'  => (int)$el->getGamesPlayed()
            ];
        }, $playerHistoryItemsSummed);

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
     * These history items are not intended to be SAVED!
     *
     * @param EventPrimitive $event
     * @return PlayerHistoryPrimitive[]
     * @throws \Exception
     */
    protected function _getFakePrefinishedItems(EventPrimitive $event)
    {
        $eId = $event->getId();
        if (empty($eId)) {
            throw new InvalidParametersException('Attempted to use deidented primitive');
        }
        $sessions = SessionPrimitive::findByEventAndStatus($this->_ds, $eId, SessionPrimitive::STATUS_PREFINISHED);
        $historyItems = [];

        foreach ($sessions as $session) {
            $sessionResults = $session->getSessionResults();
            foreach ($sessionResults as $sessionResult) {
                $historyItems []= PlayerHistoryPrimitive::makeNewHistoryItem(
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
     * @param PlayerHistoryPrimitive[] $playersHistoryItems
     *
     * @throws InvalidParametersException
     *
     * @return void
     */
    protected function _sortItems(float $startRating, string $orderBy, &$playerItems, &$playersHistoryItems): void
    {
        switch ($orderBy) {
            case 'name':
                usort($playersHistoryItems, function (
                    PlayerHistoryPrimitive $el1,
                    PlayerHistoryPrimitive $el2
                ) use (&$playerItems) {
                    return strcmp(
                        $playerItems[$el1->getPlayerId()]->getDisplayName(),
                        $playerItems[$el2->getPlayerId()]->getDisplayName()
                    );
                });
                break;
            case 'rating':
                usort($playersHistoryItems, function (
                    PlayerHistoryPrimitive $el1,
                    PlayerHistoryPrimitive $el2
                ) {
                    if (abs($el1->getRating() - $el2->getRating()) < 0.0001) {
                        return ($el2->getAvgPlace() - $el1->getAvgPlace()) > 0 ? 1 : -1; // lower avg place is better, so invert
                    }
                    if ($el1->getRating() - $el2->getRating() < 0) { // higher rating is better
                        return -1;  // usort casts return result to int, so pass explicit int here.
                    } else {
                        return 1;
                    }
                });
                break;
            case 'avg_place':
                usort($playersHistoryItems, function (
                    PlayerHistoryPrimitive $el1,
                    PlayerHistoryPrimitive $el2
                ) {
                    if (abs($el1->getAvgPlace() - $el2->getAvgPlace()) < 0.0001) { // floats need epsilon
                        return ($el2->getRating() - $el1->getRating()) > 0 ? 1 : -1; // lower rating is worse, so invert
                    }
                    if ($el1->getAvgPlace() - $el2->getAvgPlace() < 0) { // higher avg place is worse
                        return -1; // usort casts return result to int, so pass explicit int here.
                    } else {
                        return 1;
                    }
                });
                break;
            case 'avg_score':
                usort($playersHistoryItems, function (
                    PlayerHistoryPrimitive $el1,
                    PlayerHistoryPrimitive $el2
                ) use ($startRating) {
                    if (abs($el1->getAvgScore($startRating) - $el2->getAvgScore($startRating)) < 0.0001) {
                        return ($el2->getAvgPlace() - $el1->getAvgPlace()) > 0 ? 1 : -1; // lower avg place is better, so invert
                    }
                    if ($el1->getAvgScore($startRating) - $el2->getAvgScore($startRating) < 0) { // higher rating is better
                        return -1;  // usort casts return result to int, so pass explicit int here.
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
