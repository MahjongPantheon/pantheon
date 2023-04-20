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

class EventUserManagementModel extends Model
{
    /**
     * Register player to event
     *
     * @param int $playerId
     * @param int $eventId
     * @throws \Exception
     * @throws InvalidParametersException
     * @return bool success?
     */
    public function registerPlayer(int $playerId, int $eventId)
    {
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new AuthFailedException('Only administrators are allowed to register players to event');
        }

        $player = PlayerPrimitive::findById($this->_ds, [$playerId]);
        if (empty($player)) {
            throw new InvalidParametersException('Player id#' . $playerId . ' not found in DB');
        }

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $eId = $event[0]->getId();
        if (empty($eId)) {
            throw new InvalidParametersException('Attempted to use deidented primitive');
        }

        $nextLocalId = null;
        if ($event[0]->getIsPrescripted()) {
            $nextLocalId = PlayerRegistrationPrimitive::findNextFreeLocalId($this->_ds, $eId);
        }

        $regItemOld = PlayerRegistrationPrimitive::findByPlayerAndEvent($this->_ds, $playerId, $eventId);
        if (count($regItemOld) > 0) {
            throw new InvalidParametersException('Player already registered to this event');
        }

        $regItem = (new PlayerRegistrationPrimitive($this->_ds))
            ->setLocalId($nextLocalId)
            ->setReg($player[0], $event[0]);
        $success = $regItem->save();

        return $success;
    }

    /**
     * Unregister player from event
     *
     * @param int $playerId
     * @param int $eventId
     * @throws \Exception
     * @return bool
     */
    public function unregisterPlayer(int $playerId, int $eventId)
    {
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new AuthFailedException('Only administrators are allowed to unregister players to event');
        }

        $regItem = PlayerRegistrationPrimitive::findByPlayerAndEvent($this->_ds, $playerId, $eventId);
        if (empty($regItem)) {
            return false;
        }

        $regItem[0]->drop();
        return true;
    }

    /**
     * Update ignore_seating flag for registered player
     *
     * @param int $playerId
     * @param int $eventId
     * @param int $ignoreSeating
     * @throws \Exception
     * @return bool
     */
    public function updateSeatingFlag(int $playerId, int $eventId, int $ignoreSeating)
    {
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new AuthFailedException('Only administrators are allowed to update player information');
        }

        $regItem = PlayerRegistrationPrimitive::findByPlayerAndEvent($this->_ds, $playerId, $eventId);
        if (empty($regItem)) {
            throw new EntityNotFoundException('Player is not registered for this event');
        }

        return $regItem[0]
            ->setIgnoreSeating($ignoreSeating)
            ->save();
    }

    /**
     * Update replacement_id for registered player
     *
     * @param int $playerId
     * @param int $eventId
     * @param int $replacementId
     * @throws \Exception
     * @return bool
     */
    public function updateReplacement(int $playerId, int $eventId, int $replacementId)
    {
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new AuthFailedException('Only administrators are allowed to update player information');
        }

        $regItem = PlayerRegistrationPrimitive::findByPlayerAndEvent($this->_ds, $playerId, $eventId);
        if (empty($regItem)) {
            throw new EntityNotFoundException('Player is not registered for this event');
        }

        return $regItem[0]
            ->setReplacementPlayerId($replacementId === -1 ? null : $replacementId)
            ->save();
    }

    /**
     * Update players' local id mapping for prescripted event
     *
     * @param int $eventId
     * @param array $idMap
     * @return bool
     * @throws AuthFailedException
     * @throws \Exception
     */
    public function updateLocalIds(int $eventId, array $idMap)
    {
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new AuthFailedException('Only administrators are allowed to update local players\' ids');
        }

        return PlayerRegistrationPrimitive::updateLocalIds($this->_ds, $eventId, $idMap);
    }

    /**
     * Update players' team mapping for team event
     *
     * @param int $eventId
     * @param array $teamMap
     * @return bool
     * @throws AuthFailedException
     * @throws \Exception
     */
    public function updateTeamNames(int $eventId, array $teamMap)
    {
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new AuthFailedException('Only administrators are allowed to update players\' teams');
        }

        return PlayerRegistrationPrimitive::updateTeamNames($this->_ds, $eventId, $teamMap);
    }
}
