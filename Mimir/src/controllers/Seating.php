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
        $this->_checkIfAllowed($eventId);
        $this->_log->addInfo('Creating new shuffled seating by seed #' . $seed . ' for event #' . $eventId);
        $gamesWillStart = $this->_updateEventStatus($eventId);

        list ($playersMap, $tables) = $this->_getData($eventId);
        $seating = array_chunk(array_keys(Seating::shuffledSeating($playersMap, $tables, $groupsCount, $seed)), 4);
        $tableIndex = 1;
        foreach ($seating as $table) {
            (new InteractiveSessionModel($this->_db, $this->_config, $this->_meta))
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
        $this->_checkIfAllowed($eventId);
        $this->_log->addInfo('Creating new swiss seating for event #' . $eventId);
        $gamesWillStart = $this->_updateEventStatus($eventId);

        list ($playersMap, $tables) = $this->_getData($eventId);
        $seating = array_chunk(array_keys(Seating::swissSeating($playersMap, $tables)), 4);
        $tableIndex = 1;
        foreach ($seating as $table) {
            (new InteractiveSessionModel($this->_db, $this->_config, $this->_meta))
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
     * Make new manual seating.
     * This will also start games immediately if timer is not used.
     *
     * @param int $eventId
     * @param string $tablesDescription
     * @param boolean $randomize  - randomize each table by winds
     * @throws AuthFailedException
     * @throws DatabaseException
     * @throws InvalidParametersException
     * @throws InvalidUserException
     * @throws \Exception
     * @return bool
     */
    public function makeManualSeating($eventId, $tablesDescription, $randomize = false)
    {
        $this->_checkIfAllowed($eventId);
        $this->_log->addInfo('Creating new manual seating for event #' . $eventId);
        $gamesWillStart = $this->_updateEventStatus($eventId);

        $seating = $this->_makeManualSeating($eventId, $tablesDescription, $randomize);

        $tableIndex = 1;
        foreach ($seating as $table) {
            (new InteractiveSessionModel($this->_db, $this->_config, $this->_meta))
                ->startGame($eventId, $table, $tableIndex++); // TODO: here might be an exception inside loop!
        }

        $this->_log->addInfo('Created new manual seating for event #' . $eventId);
        if ($gamesWillStart) {
            $this->_log->addInfo('Started all games by manual seating for event #' . $eventId);
        }
        return true;
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
        $this->_checkIfAllowed($eventId);
        $this->_log->addInfo('Creating new interval seating for event #' . $eventId);
        $gamesWillStart = $this->_updateEventStatus($eventId);

        $event = EventPrimitive::findById($this->_db, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $currentRatingTable = (new EventRatingTableModel($this->_db, $this->_config, $this->_meta))
            ->getRatingTable($event[0], 'rating', 'desc');

        $seating = Seating::makeIntervalSeating($currentRatingTable, $step, true);

        $tableIndex = 1;
        foreach ($seating as $table) {
            (new InteractiveSessionModel($this->_db, $this->_config, $this->_meta))
                ->startGame($eventId, $table, $tableIndex++); // TODO: here might be an exception inside loop!
        }

        $this->_log->addInfo('Created new interval seating for event #' . $eventId);
        if ($gamesWillStart) {
            $this->_log->addInfo('Started all games by interval seating for event #' . $eventId);
        }
        return true;
    }

    /**
     * @param integer $eventId
     * @param boolean $randomizeAtTables
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
        $seating = $this->_getNextPrescriptedSeating($eventId);
        $gamesWillStart = $this->_updateEventStatus($eventId);
        $tableIndex = 1;

        foreach ($seating as $table) {
            $table = array_filter($table);
            if (empty($table) || count($table) != 4) {
                $this->_log->addInfo('Failed to form a table from predefined seating at event #' . $eventId);
                continue;
            }

            if ($randomizeAtTables) {
                srand(microtime());
                $table = Seating::shuffle($table);
            }

            (new InteractiveSessionModel($this->_db, $this->_config, $this->_meta))
                ->startGame($eventId, $table, $tableIndex++); // TODO: here might be an exception inside loop!
        }

        // increment game index when seating is generated
        $prescript = EventPrescriptPrimitive::findByEventId($this->_db, [$eventId]);
        $prescript[0]->setNextGameIndex($prescript[0]->getNextGameIndex() + 1)->save();

        $this->_log->addInfo('Created new prescripted seating for event #' . $eventId);
        if ($gamesWillStart) {
            $this->_log->addInfo('Started all games by prescripted seating for event #' . $eventId);
        }
        return true;
    }

    /**
     * @param $eventId
     * @return \int[][]
     * @throws AuthFailedException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    protected function _getNextPrescriptedSeating($eventId)
    {
        $this->_checkIfAllowed($eventId);
        $this->_log->addInfo('Getting next seating for event #' . $eventId);

        $event = EventPrimitive::findById($this->_db, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $prescript = EventPrescriptPrimitive::findByEventId($this->_db, [$eventId]);
        if (empty($prescript)) {
            throw new InvalidParametersException('Event prescript for id#' . $eventId . ' not found in DB');
        }
        $prescriptForSession = $prescript[0]->getNextGameSeating();
        return Seating::makePrescriptedSeating(
            $prescriptForSession,
            PlayerRegistrationPrimitive::findLocalIdsMapByEvent($this->_db, $eventId)
        );
    }

    /**
     * Get list of tables for next session. Each table is a list of players data.
     *
     * @param integer $eventId
     * @return array
     * @throws AuthFailedException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getNextSeatingForPrescriptedEvent($eventId)
    {
        $seating = $this->_getNextPrescriptedSeating($eventId);
        if (empty($seating)) {
            // No next seating: probably, all games are finished already.
            return [];
        }

        $playerIds = array_filter(array_reduce($seating, 'array_merge', []));
        if (empty($playerIds)) {
            throw new InvalidParametersException('No valid players found in predefined seating');
        }

        $players = PlayerPrimitive::findById($this->_db, $playerIds);
        /** @var PlayerPrimitive[] $playersMap */
        $playersMap = [];
        foreach ($players as $player) {
            $playersMap[$player->getId()] = $player;
        }

        return array_map(function ($table) use (&$playersMap) {
            return array_map(function ($playerId) use (&$playersMap) {
                return [
                    'id' => $playersMap[$playerId]->getId(),
                    'alias' => $playersMap[$playerId]->getAlias(),
                    'display_name' => $playersMap[$playerId]->getDisplayName(),
                    'is_replacement' => $playersMap[$playerId]->getIsReplacement()
                ];
            }, $table);
        }, $seating);
    }

    /**
     * Update event "seating ready" status.
     * This should be done before games start, or admin panel will show some inadequate data.
     * @param $eventId
     * @throws \Exception
     * @return bool flag if games are started immediately
     */
    protected function _updateEventStatus($eventId)
    {
        list($event) = EventPrimitive::findById($this->_db, [$eventId]);
        if ($event->getUseTimer()) {
            $event->setGamesStatus(EventPrimitive::GS_SEATING_READY)->save();
            return false;
        }
        return true;
    }

    /**
     * Check if seating is allowed now
     *
     * @param $eventId
     * @throws AuthFailedException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    protected function _checkIfAllowed($eventId)
    {
        if (!(new EventModel($this->_db, $this->_config, $this->_meta))->checkAdminToken()) {
            throw new AuthFailedException('Authentication failed! Ask for some assistance from admin team', 403);
        }

        $sessions = SessionPrimitive::findByEventAndStatus($this->_db, $eventId, SessionPrimitive::STATUS_INPROGRESS);
        if (!empty($sessions)) {
            throw new InvalidParametersException('Failed to start new game: not all games finished in event id#' . $eventId);
        }
    }

    /**
     * @param $eventId
     * @return array
     * @throws InvalidParametersException
     * @throws \Exception
     */
    protected function _getData($eventId)
    {
        $playersMap = [];

        $event = EventPrimitive::findById($this->_db, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $histories = PlayerHistoryPrimitive::findLastByEvent($this->_db, $eventId);
        if (!empty($histories)) {
            foreach ($histories as $h) {
                $playersMap[$h->getPlayerId()] = $h->getRating();
            }
        } else {
            $initialRating = $event[0]->getRuleset()->startRating();
            $playersReg = PlayerRegistrationPrimitive::findRegisteredPlayersIdsByEvent($this->_db, $eventId);
            foreach ($playersReg as $id) {
                $playersMap[$id] = $initialRating;
            }
        }

        $seatingInfo = SessionPrimitive::getPlayersSeatingInEvent($this->_db, $eventId);
        $tables = array_chunk(array_map(function ($el) {
            return $el['player_id'];
        }, $seatingInfo), 4);

        return [$playersMap, $tables];
    }

    /**
     * Make manual seating
     *
     * Input:
     * 1-3-5-6
     * 2-4-7-9
     *
     * Where numbers mean current place of player in rating table.
     *
     * Output:
     * seating by player id:
     * [
     *    [12, 43, 23, 43],
     *    [24, 41, 93, 10]
     * ]
     *
     * @param $eventId
     * @param $tablesDescription
     * @param $randomize
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    protected function _makeManualSeating($eventId, $tablesDescription, $randomize)
    {
        $tables = array_map(function ($t) use ($randomize) {
            $places = array_map('trim', explode('-', $t));
            if (!$randomize) {
                return $places;
            }
            srand(microtime());
            return Seating::shuffle($places);
        }, explode("\n", $tablesDescription));

        $event = EventPrimitive::findById($this->_db, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $currentRatingTable = (new EventRatingTableModel($this->_db, $this->_config, $this->_meta))
            ->getRatingTable($event[0], 'rating', 'desc');

        $participatingPlayers = [];
        foreach ($tables as &$table) {
            foreach ($table as $k => $player) {
                if (!is_numeric($player) || empty($player) || empty($currentRatingTable[intval($player) - 1])) {
                    throw new InvalidParametersException('Wrong rating place found: ' . $player);
                }

                $playerId = $currentRatingTable[intval($player) - 1]['id'];
                if (!empty($participatingPlayers[$playerId])) {
                    throw new InvalidParametersException(
                        'Player id #' . $playerId . ' (place #' . $player . ') is already placed at another table!'
                    );
                }

                $table[$k] = $playerId;
                $participatingPlayers[$playerId] = true;
            }
        }

        return $tables;
    }
}
