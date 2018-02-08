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
require_once __DIR__ . '/../primitives/PlayerEnrollment.php';
require_once __DIR__ . '/../primitives/PlayerHistory.php';
require_once __DIR__ . '/../primitives/Achievements.php';
require_once __DIR__ . '/../primitives/Round.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';

class EventRatingTableModel extends Model
{
    /**
     * @param EventPrimitive $event
     * @param $orderBy
     * @param $order
     * @param bool $withPrefinished
     * @return array
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getRatingTable(EventPrimitive $event, $orderBy, $order, $withPrefinished = false)
    {
        if (!in_array($order, ['asc', 'desc'])) {
            throw new InvalidParametersException("Parameter order should be either 'asc' or 'desc'");
        }

        $tmpPlayersHistoryItems = PlayerHistoryPrimitive::findLastByEvent($this->_db, $event->getId());
        $playersHistoryItems = [];
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

        $playerItems = $this->_getPlayers($playersHistoryItems);
        $this->_sortItems($orderBy, $playerItems, $playersHistoryItems);

        if ($order === 'desc') {
            $playersHistoryItems = array_reverse($playersHistoryItems);
        }

        if ($event->getSortByGames()) {
            $this->_stableSort(
                $playersHistoryItems,
                function (PlayerHistoryPrimitive $el1, PlayerHistoryPrimitive $el2) {
                    if ($el1->getGamesPlayed() == $el2->getGamesPlayed()) {
                        return 0;
                    }

                    return $el1->getGamesPlayed() < $el2->getGamesPlayed() ? 1 : -1; // swap for desc sort
                }
            );
        }

        // TODO: среднеквадратичное отклонение

        return array_map(function (PlayerHistoryPrimitive $el) use (&$playerItems, $event) {
            return [
                'id'            => (int)$el->getPlayerId(),
                'display_name'  => $playerItems[$el->getPlayerId()]->getDisplayName(),
                'rating'        => (float)$el->getRating(),
                'winner_zone'   => (
                    $event->getRuleset()->subtractStartPoints()
                        ? $el->getRating() >= $event->getRuleset()->startRating()
                        : $el->getRating() >= (
                            ($event->getRuleset()->startPoints() * $el->getGamesPlayed())
                                /
                            ($event->getRuleset()->tenboDivider() * $event->getRuleset()->ratingDivider())
                        )
                ),
                'avg_place'     => round($el->getAvgPlace(), 4),
                'avg_score'     => round(($el->getRating() - $event->getRuleset()->startRating()) / $el->getGamesPlayed(), 4),
                'games_played'  => (int)$el->getGamesPlayed()
            ];
        }, $playersHistoryItems);
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
        $sessions = SessionPrimitive::findByEventAndStatus($this->_db, $event->getId(), SessionPrimitive::STATUS_PREFINISHED);
        $historyItems = [];

        foreach ($sessions as $session) {
            $sessionResults = $session->getSessionResults();
            foreach ($sessionResults as $sessionResult) {
                $historyItems []= PlayerHistoryPrimitive::makeNewHistoryItem(
                    $this->_db,
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
        $players = PlayerPrimitive::findById($this->_db, $ids);

        $result = [];
        foreach ($players as $p) {
            $result[$p->getId()] = $p;
        }

        return $result;
    }

    /**
     * @param $orderBy
     * @param PlayerPrimitive[] $playerItems
     * @param PlayerHistoryPrimitive[] $playersHistoryItems
     * @throws InvalidParametersException
     */
    protected function _sortItems($orderBy, &$playerItems, &$playersHistoryItems)
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
                        return $el2->getAvgPlace() - $el1->getAvgPlace(); // lower avg place is better, so invert
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
                        return $el2->getRating() - $el1->getRating(); // lower rating is worse, so invert
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
                ) {
                    if (abs(
                        ($el1->getRating() / $el1->getGamesPlayed()) -
                            ($el2->getRating() / $el2->getGamesPlayed())
                    ) < 0.0001) {
                        return $el2->getAvgPlace() - $el1->getAvgPlace(); // lower avg place is better, so invert
                    }
                    if (($el1->getRating() / $el1->getGamesPlayed()) -
                        ($el2->getRating() / $el2->getGamesPlayed()) < 0) { // higher rating is better
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

    protected function _stableSort(&$array, $comparer = 'strcmp')
    {
        // Arrays of size < 2 require no action.
        if (count($array) < 2) {
            return;
        }

        // Split the array in half
        $halfway = count($array) / 2;
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
