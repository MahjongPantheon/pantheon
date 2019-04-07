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

class EventUserManagementModel extends Model
{
    /**
     * Enroll player to event
     *
     * @param $eventId
     * @param $playerId
     * @throws AuthFailedException
     * @throws BadActionException
     * @throws \Exception
     * @throws InvalidParametersException
     * @return string secret pin code
     */
    public function enrollPlayer($eventId, $playerId)
    {
        if (!$this->checkAdminToken()) {
            throw new AuthFailedException('Only administrators are allowed to enroll players to event');
        }

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }
        $player = PlayerPrimitive::findById($this->_ds, [$playerId]);
        if (empty($player)) {
            throw new InvalidParametersException('Player id#' . $playerId . ' not found in DB');
        }

        $regItem = (new PlayerEnrollmentPrimitive($this->_ds))
            ->setReg($player[0], $event[0]);
        $success = $regItem->save();

        if (!$success) {
            throw new BadActionException('Something went wrong: enrollment failed while saving to db');
        }

        return $regItem->getPin();
    }

    /**
     * Register player to event
     *
     * @param $playerId
     * @param $eventId
     * @throws \Exception
     * @throws InvalidParametersException
     * @return bool success?
     */
    public function registerPlayer($playerId, $eventId)
    {
        $player = PlayerPrimitive::findById($this->_ds, [$playerId]);
        if (empty($player)) {
            throw new InvalidParametersException('Player id#' . $playerId . ' not found in DB');
        }

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $nextLocalId = null;
        if ($event[0]->getIsPrescripted()) {
            $nextLocalId = PlayerRegistrationPrimitive::findNextFreeLocalId($this->_ds, $event[0]->getId());
        }

        $regItem = (new PlayerRegistrationPrimitive($this->_ds))
            ->setLocalId($nextLocalId)
            ->setReg($player[0], $event[0]);
        $success = $regItem->save();

        $eItem = PlayerEnrollmentPrimitive::findByPlayerAndEvent($this->_ds, $playerId, $eventId);
        if ($success) {
            $eItem->drop();
        }
        return $success;
    }

    /**
     * Unregister player from event
     *
     * @param $playerId
     * @param $eventId
     * @throws \Exception
     * @return void
     */
    public function unregisterPlayer($playerId, $eventId)
    {
        if (!$this->checkAdminToken()) {
            throw new AuthFailedException('Only administrators are allowed to enroll players to event');
        }

        $regItem = PlayerRegistrationPrimitive::findByPlayerAndEvent($this->_ds, $playerId, $eventId);
        if (empty($regItem)) {
            return;
        }

        $regItem->drop();
    }

    /**
     * Update ignore_seating flag for registered player
     *
     * @param $playerId
     * @param $eventId
     * @param $ignoreSeating
     * @throws \Exception
     * @return bool
     */
    public function updateSeatingFlag($playerId, $eventId, $ignoreSeating)
    {
        if (!$this->checkAdminToken()) {
            throw new AuthFailedException('Only administrators are allowed to update player information');
        }

        $regItem = PlayerRegistrationPrimitive::findByPlayerAndEvent($this->_ds, $playerId, $eventId);
        if (empty($regItem)) {
            throw new EntityNotFoundException('Player is not registered for this event');
        }

        return $regItem
            ->setIgnoreSeating($ignoreSeating)
            ->save();
    }

    /**
     * Self-register player to event by pin
     *
     * @param $pin
     * @throws BadActionException
     * @throws \Exception
     * @return string auth token
     */
    public function registerPlayerPin($pin)
    {
        $success = false;
        $token = null;
        $nextLocalId = null;

        if ($pin === '0000000000') {
            // Special pin & token for universal watcher
            return '0000000000';
        }

        $eItem = PlayerEnrollmentPrimitive::findByPin($this->_ds, $pin);
        if ($eItem) {
            $event = EventPrimitive::findById($this->_ds, [$eItem->getEventId()]);

            if (!$event[0]->getAllowPlayerAppend()) {
                $reggedItems = PlayerRegistrationPrimitive::findByPlayerAndEvent($this->_ds, $eItem->getPlayerId(), $event[0]->getId());
                // check that games are not started yet
                if ($event[0]->getLastTimer() && empty($reggedItems)) {
                    // do not allow new players to enter already tournament
                    // but allow to reenroll/reenter pin for already participating people
                    throw new BadActionException('Pin is expired: game sessions are already started.');
                }
            }

            if ($event[0]->getIsPrescripted()) {
                $nextLocalId = PlayerRegistrationPrimitive::findNextFreeLocalId($this->_ds, $event[0]->getId());
            }

            $player = PlayerPrimitive::findById($this->_ds, [$eItem->getPlayerId()]);
            $regItem = (new PlayerRegistrationPrimitive($this->_ds))
                ->setLocalId($nextLocalId)
                ->setReg($player[0], $event[0]);
            $success = $regItem->save();
            $token = $regItem->getToken();
        }
        if (!$success || empty($regItem)) {
            throw new BadActionException('Something went wrong: registration failed while saving to db');
        }

        $eItem->drop();
        return $token;
    }

    /**
     * Update players' local id mapping for prescripted event
     *
     * @param $eventId
     * @param $idMap
     * @return bool
     * @throws AuthFailedException
     * @throws \Exception
     */
    public function updateLocalIds($eventId, $idMap)
    {
        if (!$this->checkAdminToken()) {
            throw new AuthFailedException('Only administrators are allowed to update local players\' ids');
        }

        return PlayerRegistrationPrimitive::updateLocalIds($this->_ds, $eventId, $idMap);
    }

    /**
     * Update players' team mapping for team event
     *
     * @param $eventId
     * @param $teamMap
     * @return bool
     * @throws AuthFailedException
     * @throws \Exception
     */
    public function updateTeamNames($eventId, $teamMap)
    {
        if (!$this->checkAdminToken()) {
            throw new AuthFailedException('Only administrators are allowed to update players\' teams');
        }

        return PlayerRegistrationPrimitive::updateTeamNames($this->_db, $eventId, $teamMap);
    }

    /**
     * Checks if token is ok.
     * Reads token value from X-Auth-Token request header
     *
     * Also should return true to admin-level token to allow everything
     *
     * @param $playerId
     * @param $eventId
     * @return bool
     * @throws \Exception
     */
    public function checkToken($playerId, $eventId)
    {
        if ($this->checkAdminToken()) {
            return true;
        }

        $regItem = $this->dataFromToken();
        return $regItem
            && $regItem->getEventId() == $eventId
            && $regItem->getPlayerId() == $playerId;
    }

    /**
     * Get player and event ids by auth token
     * @return null|PlayerRegistrationPrimitive
     * @throws \Exception
     */
    public function dataFromToken()
    {
        return PlayerRegistrationPrimitive::findEventAndPlayerByToken($this->_ds, $this->_meta->getAuthToken());
    }
}
