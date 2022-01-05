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
require_once __DIR__ . '/EventUserManagement.php';
require_once __DIR__ . '/../helpers/MultiRound.php';
require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/Round.php';
require_once __DIR__ . '/../primitives/Session.php';
require_once __DIR__ . '/../primitives/SessionResults.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';
require_once __DIR__ . '/../exceptions/AuthFailed.php';
require_once __DIR__ . '/../exceptions/InvalidUser.php';
require_once __DIR__ . '/../exceptions/BadAction.php';
require_once __DIR__ . '/../exceptions/Database.php';

/**
 * Class SessionModel
 *
 * Domain model for high-level logic
 * @package Mimir
 */
class PenaltySessionModel extends Model
{
    /**
     * @throws InvalidParametersException
     * @throws InvalidUserException
     * @throws DatabaseException
     * @throws AuthFailedException
     * @param int $eventId
     * @param int[] $playerIds
     * @throws \Exception
     * @return string
     */
    public function addPenaltyGame($eventId, $playerIds)
    {
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new AuthFailedException('Only administrators are allowed to create penalty games');
        }

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        if (!is_array($playerIds)) {
            throw new InvalidParametersException('Players list is not array');
        }

        $players = PlayerPrimitive::findById($this->_ds, $playerIds);
        $players = array_filter(array_map(function ($id) use (&$players) {
            // Re-sort players to match request order - important!
            foreach ($players as $p) {
                if ($p->getId() == $id) {
                    return $p;
                }
            }
            return null;
        }, $playerIds));

        if (count($players) !== 4) {
            throw new InvalidUserException('Some players do not exist in DB, check ids');
        }

        $session = (new SessionPrimitive($this->_ds))
            ->setEvent($event[0])
            ->setPlayers($players)
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setReplayHash(null)
            ->setTableIndex(null);
        $session->save();

        $ruleset = $event[0]->getRuleset();
        $penalty = 1. * ($ruleset->replacementPlayerFixedPoints() ?? 0);
        foreach ($players as $i => $player) {
            $result = (new SessionResultsPrimitive($this->_ds))
                ->setPlayer($player)
                ->setSession($session)
                ->setRatingDelta($penalty)
                ->setPlace($i);
            $result->save();

            PlayerHistoryPrimitive::makeNewHistoryItem(
                $this->_ds,
                $player,
                $session,
                $penalty,
                $i
            )->save();
        }

        $session
            ->setEndDate(date('Y-m-d H:i:s'))
            ->setStatus(SessionPrimitive::STATUS_FINISHED)
            ->save();

        return $session->getRepresentationalHash();
    }
}
