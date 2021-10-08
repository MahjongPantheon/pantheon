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

require_once __DIR__ . '/../Controller.php';
require_once __DIR__ . '/../helpers/Seating.php';
require_once __DIR__ . '/../models/Event.php';
require_once __DIR__ . '/../models/EventRatingTable.php';

class SeatingController extends Controller
{
    /**
     * Make new shuffled seating.
     * This will also start games immediately if timer is not used.
     *
     * @param int $eventId
     * @param int $groupsCount
     * @param int $seed
     * @throws InvalidParametersException
     * @throws AuthFailedException
     * @throws \Exception
     * @return bool
     */
    public function makeShuffledSeating($eventId, $groupsCount, $seed)
    {
        $this->_log->addInfo('Creating new shuffled seating by seed #' . $seed . ' for event #' . $eventId);
        $this->_checkIfAllowed($eventId);

        $sessions = SessionPrimitive::findByEventAndStatus($this->_ds, $eventId, SessionPrimitive::STATUS_INPROGRESS);
        if (!empty($sessions)) {
            throw new InvalidParametersException('Failed to start new game: not all games finished in event id#' . $eventId);
        }

        $gamesWillStart = $this->_updateEventStatus($eventId);

        list ($playersMap, $tables) = $this->_getData($eventId);
        $seating = array_chunk(array_keys(Seating::shuffledSeating($playersMap, $tables, $groupsCount, $seed) ?? []), 4);
        $tableIndex = 1;
        foreach ($seating as $table) {
            (new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta))
                ->startGame($eventId, $table, $tableIndex++); // TODO: here might be an exception inside loop!
        }

        $this->_log->addInfo('Created new shuffled seating by seed #' . $seed . ' for event #' . $eventId);
        if ($gamesWillStart) {
            $this->_log->addInfo('Started all games with shuffled seating by seed #' . $seed . ' for event #' . $eventId);
        }
        return true;
    }

    /**
     * Make new swiss seating.
     * This will also start games immediately if timer is not used.
     *
     * @param int $eventId
     * @throws InvalidParametersException
     * @throws AuthFailedException
     * @throws \Exception
     * @return bool
     */
    public function makeSwissSeating($eventId)
    {
        $this->_log->addInfo('Creating new swiss seating for event #' . $eventId);
        $this->_checkIfAllowed($eventId);

        $sessions = SessionPrimitive::findByEventAndStatus($this->_ds, $eventId, SessionPrimitive::STATUS_INPROGRESS);
        if (!empty($sessions)) {
            throw new InvalidParametersException('Failed to start new game: not all games finished in event id#' . $eventId);
        }

        $gamesWillStart = $this->_updateEventStatus($eventId);

        list ($playersMap, $tables) = $this->_getData($eventId);
        $seating = array_chunk(array_keys(Seating::swissSeating($playersMap, $tables)), 4);
        $tableIndex = 1;
        foreach ($seating as $table) {
            (new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta))
                ->startGame($eventId, $table, $tableIndex++); // TODO: here might be an exception inside loop!
        }

        $this->_log->addInfo('Created new swiss seating for event #' . $eventId);
        if ($gamesWillStart) {
            $this->_log->addInfo('Started all games with swiss seating for event #' . $eventId);
        }
        return true;
    }

    /**
     * Generate a new swiss seating.
     * It is here because of online tournaments.
     *
     * @param int $eventId
     * @throws AuthFailedException
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array a multidimensional numerically indexed array
     */
    public function generateSwissSeating($eventId)
    {
        $this->_checkIfAllowed($eventId);
        $this->_log->addInfo('Generating new swiss seating for event #' . $eventId);

        list ($playersMap, $tables) = $this->_getData($eventId);
        $seating = array_chunk(array_keys(Seating::swissSeating($playersMap, $tables)), 4);

        $this->_log->addInfo('Generated new swiss seating for event #' . $eventId);
        return $seating;
    }

    /**
     * Make new interval seating.
     * This will also start games immediately if timer is not used.
     *
     * @param int $eventId
     * @param int $step
     * @throws AuthFailedException
     * @throws DatabaseException
     * @throws InvalidParametersException
     * @throws InvalidUserException
     * @throws \Exception
     * @return bool
     */
    public function makeIntervalSeating($eventId, $step)
    {
        $this->_log->addInfo('Creating new interval seating for event #' . $eventId);
        $this->_checkIfAllowed($eventId);

        $sessions = SessionPrimitive::findByEventAndStatus($this->_ds, $eventId, SessionPrimitive::STATUS_INPROGRESS);
        if (!empty($sessions)) {
            throw new InvalidParametersException('Failed to start new game: not all games finished in event id#' . $eventId);
        }

        $gamesWillStart = $this->_updateEventStatus($eventId);

        $eventList = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($eventList)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $currentRatingTable = (new EventRatingTableModel($this->_ds, $this->_config, $this->_meta))
            ->getRatingTable($eventList, 'rating', 'desc');

        // In rare cases we want to exclude players from seating
        $ignoredPlayerIds = PlayerRegistrationPrimitive::findIgnoredPlayersIdsByEvent($this->_ds, [$eventId]);
        // array_values required: array_filter maintains numeric keys!
        $currentRatingTable = array_values(array_filter($currentRatingTable, function ($player) use (&$ignoredPlayerIds) {
            return !in_array($player['id'], $ignoredPlayerIds);
        }));

        $seating = Seating::makeIntervalSeating($currentRatingTable, $step, true);

        $tableIndex = 1;
        foreach ($seating as $table) {
            (new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta))
                ->startGame($eventId, $table, $tableIndex++); // TODO: here might be an exception inside loop!
        }

        $this->_log->addInfo('Created new interval seating for event #' . $eventId);
        if ($gamesWillStart) {
            $this->_log->addInfo('Started all games by interval seating for event #' . $eventId);
        }
        return true;
    }

    /**
     * @param int $eventId
     * @param bool $randomizeAtTables
     * @return bool
     * @throws AuthFailedException
     * @throws DatabaseException
     * @throws InvalidParametersException
     * @throws InvalidUserException
     * @throws \Exception
     */
    public function makePrescriptedSeating($eventId, $randomizeAtTables = false)
    {
        $this->_log->addInfo('Creating new prescripted seating for event #' . $eventId);
        $this->_checkIfAllowed($eventId);

        $sessions = SessionPrimitive::findByEventAndStatus($this->_ds, $eventId, SessionPrimitive::STATUS_INPROGRESS);
        if (!empty($sessions)) {
            throw new InvalidParametersException('Failed to start new game: not all games finished in event id#' . $eventId);
        }

        $seating = $this->_getNextPrescriptedSeating($eventId);
        $gamesWillStart = $this->_updateEventStatus($eventId);
        $tableIndex = 1;

        foreach ($seating as $table) {
            $table = array_filter(array_map(function ($el) {
                return $el['id'];
            }, $table));

            if (empty($table) || count($table) != 4) {
                $this->_log->addInfo('Failed to form a table from predefined seating at event #' . $eventId);
                continue;
            }

            if ($randomizeAtTables) {
                Seating::shuffleSeed();
                $table = Seating::shuffle($table);
            }

            (new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta))
                ->startGame($eventId, $table, $tableIndex++); // TODO: here might be an exception inside loop!
        }

        // increment game index when seating is generated
        $prescript = EventPrescriptPrimitive::findByEventId($this->_ds, [$eventId]);
        $prescript[0]->setNextGameIndex($prescript[0]->getNextGameIndex() + 1)->save();

        $this->_log->addInfo('Created new prescripted seating for event #' . $eventId);
        if ($gamesWillStart) {
            $this->_log->addInfo('Started all games by prescripted seating for event #' . $eventId);
        }
        return true;
    }

    /**
     * @param int $eventId
     * @return array [id => int, local_id => int][][]
     * @throws AuthFailedException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    protected function _getNextPrescriptedSeating(int $eventId)
    {
        $this->_checkIfAllowed($eventId);
        $this->_log->addInfo('Getting next seating for event #' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $prescript = EventPrescriptPrimitive::findByEventId($this->_ds, [$eventId]);
        if (empty($prescript)) {
            throw new InvalidParametersException('Event prescript for id#' . $eventId . ' not found in DB', 1404);
        }
        $prescriptForSession = $prescript[0]->getNextGameSeating();
        return Seating::makePrescriptedSeating(
            $prescriptForSession,
            PlayerRegistrationPrimitive::findLocalIdsMapByEvent($this->_ds, $eventId)
        );
    }

    /**
     * Get list of tables for next session. Each table is a list of players data.
     *
     * @param int $eventId
     * @return array
     * @throws AuthFailedException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getNextSeatingForPrescriptedEvent(int $eventId)
    {
        $this->_checkIfAllowed($eventId);
        $seating = $this->_getNextPrescriptedSeating($eventId);
        if (empty($seating)) {
            // No next seating: probably, all games are finished already.
            return [];
        }

        $playerIds = array_filter(array_map(function ($el) {
            return $el['id'];
        }, array_reduce($seating, 'array_merge', [])));

        if (empty($playerIds)) {
            throw new InvalidParametersException('No valid players found in predefined seating');
        }

        $players = PlayerPrimitive::findById($this->_ds, $playerIds);
        /** @var PlayerPrimitive[] $playersMap */
        $playersMap = [];
        foreach ($players as $player) {
            $playersMap[$player->getId()] = $player;
        }

        $regs = PlayerRegistrationPrimitive::findByEventId($this->_ds, $eventId);
        /** @var PlayerRegistrationPrimitive[] $replacementMap */
        $replacementMap = [];
        foreach ($regs as $reg) {
            if (!empty($playersMap[$reg->getPlayerId()])) {
                $replacementMap[$reg->getPlayerId()] = $reg->getReplacementPlayerId();
            }
        }

        return array_map(function ($table) use (&$playersMap, &$replacementMap) {
            return array_map(function ($player) use (&$playersMap,&$replacementMap) {
                return [
                    'id' => $playersMap[$player['id']]->getId(),
                    'local_id' => $player['local_id'],
                    'display_name' => $playersMap[$player['id']]->getDisplayName(),
                    'replacement_id' => $replacementMap[$player['id']]
                ];
            }, $table);
        }, $seating);
    }

    /**
     * Update event "seating ready" status.
     * This should be done before games start, or admin panel will show some inadequate data.
     * @param int $eventId
     * @throws \Exception
     * @return bool flag if games are started immediately
     */
    protected function _updateEventStatus(int $eventId)
    {
        $this->_checkIfAllowed($eventId);
        list($event) = EventPrimitive::findById($this->_ds, [$eventId]);
        if ($event->getUseTimer()) {
            $event->setGamesStatus(EventPrimitive::GS_SEATING_READY)->save();
            return false;
        }
        return true;
    }

    /**
     * Check if seating is allowed now
     *
     * @param int $eventId
     *
     * @throws AuthFailedException
     * @throws InvalidParametersException
     * @throws \Exception
     *
     * @return void
     */
    protected function _checkIfAllowed(int $eventId): void
    {
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new AuthFailedException('Authentication failed! Ask for some assistance from admin team', 403);
        }
    }

    /**
     * @param int $eventId
     * @return array
     * @throws InvalidParametersException
     * @throws \Exception
     */
    protected function _getData(int $eventId)
    {
        $playersMap = [];

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        // In rare cases we want to exclude players from seating
        $ignoredPlayerIds = PlayerRegistrationPrimitive::findIgnoredPlayersIdsByEvent($this->_ds, [$eventId]);

        // First step is adding players that already played games
        $histories = PlayerHistoryPrimitive::findLastByEvent($this->_ds, $eventId);
        foreach ($histories as $h) {
            if (!in_array($h->getPlayerId(), $ignoredPlayerIds)) {
                $playersMap[$h->getPlayerId()] = $h->getRating();
            }
        }

        // Second step is adding players that didn't play yet
        // this situation is possible only in online tournament
        // when we added replacement player
        $initialRating = $event[0]->getRuleset()->startRating();
        $playersReg = PlayerRegistrationPrimitive::findRegisteredPlayersIdsByEvent($this->_ds, $eventId);
        foreach ($playersReg as $player) {
            if (!in_array($player['id'], $ignoredPlayerIds) && !isset($playersMap[$player['id']])) {
                $playersMap[$player['id']] = $initialRating;
            }
        }

        $seatingInfo = SessionPrimitive::getPlayersSeatingInEvent($this->_ds, $eventId);
        $tables = array_chunk(array_map(function ($el) {
            return $el['player_id'];
        }, $seatingInfo), 4);

        return [$playersMap, $tables];
    }
}
