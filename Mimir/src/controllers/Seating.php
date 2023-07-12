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

use Common\TwirpError;
use Twirp\ErrorCode;

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
        $this->_log->info('Creating new shuffled seating by seed #' . $seed . ' for event #' . $eventId);
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

        $this->_log->info('Created new shuffled seating by seed #' . $seed . ' for event #' . $eventId);
        if ($gamesWillStart) {
            $this->_log->info('Started all games with shuffled seating by seed #' . $seed . ' for event #' . $eventId);
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
        $this->_log->info('Creating new swiss seating for event #' . $eventId);
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

        $this->_log->info('Created new swiss seating for event #' . $eventId);
        if ($gamesWillStart) {
            $this->_log->info('Started all games with swiss seating for event #' . $eventId);
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
        $this->_log->info('Generating new swiss seating for event #' . $eventId);

        list ($playersMap, $tables) = $this->_getData($eventId);
        $seating = array_chunk(array_keys(Seating::swissSeating($playersMap, $tables)), 4);

        $this->_log->info('Generated new swiss seating for event #' . $eventId);
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
        $this->_log->info('Creating new interval seating for event #' . $eventId);
        $this->_checkIfAllowed($eventId);

        $sessions = SessionPrimitive::findByEventAndStatus($this->_ds, $eventId, SessionPrimitive::STATUS_INPROGRESS);
        if (!empty($sessions)) {
            throw new InvalidParametersException('Failed to start new game: not all games finished in event id#' . $eventId);
        }

        $gamesWillStart = $this->_updateEventStatus($eventId);

        $eventList = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($eventList)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event id#' . $eventId . ' not found in DB');
        }

        $currentRatingTable = (new EventRatingTableModel($this->_ds, $this->_config, $this->_meta))
            ->getRatingTable($eventList, [], 'rating', 'desc');

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

        $this->_log->info('Created new interval seating for event #' . $eventId);
        if ($gamesWillStart) {
            $this->_log->info('Started all games by interval seating for event #' . $eventId);
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
        $this->_log->info('Creating new prescripted seating for event #' . $eventId);
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
                $this->_log->info('Failed to form a table from predefined seating at event #' . $eventId);
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

        $this->_log->info('Created new prescripted seating for event #' . $eventId);
        if ($gamesWillStart) {
            $this->_log->info('Started all games by prescripted seating for event #' . $eventId);
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
        $this->_log->info('Getting next seating for event #' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event id#' . $eventId . ' not found in DB');
        }

        $prescript = EventPrescriptPrimitive::findByEventId($this->_ds, [$eventId]);
        if (empty($prescript)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event prescript for id#' . $eventId . ' not found in DB', 1404);
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

        $ev = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($ev)) {
            throw new InvalidParametersException('No event found with this id');
        }

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

        $teamNames = [];
        if ($ev[0]->getIsTeam()) {
            $teamNames = PlayerRegistrationPrimitive::findTeamNameMapByEvent($this->_ds, $eventId);
        }

        // Players who should ignore seating
        $ignoredPlayers = PlayerRegistrationPrimitive::findIgnoredPlayersIdsByEvent($this->_ds, [$eventId]);

        $regs = PlayerRegistrationPrimitive::findByEventId($this->_ds, $eventId);
        $replacementMap = [];
        foreach ($regs as $reg) {
            if (!empty($playersMap[$reg->getPlayerId()])) {
                $replacementMap[$reg->getPlayerId()] = $reg->getReplacementPlayerId();
            }
        }

        $replacementMapToPlayer = [];
        $replacements = PlayerPrimitive::findById($this->_ds, array_filter(array_values($replacementMap)));
        foreach ($replacements as $rep) {
            $replacementMapToPlayer[$rep->getId()] = $rep;
        }

        return array_map(function ($table) use (&$playersMap, &$replacementMapToPlayer, &$teamNames, &$ignoredPlayers) {
            return array_map(function ($player) use (&$playersMap, &$replacementMapToPlayer, &$teamNames, &$ignoredPlayers) {
                return [
                    'id'            => $playersMap[$player['id']]->getId(),
                    'title'         => $playersMap[$player['id']]->getDisplayName(),
                    'has_avatar'    => $playersMap[$player['id']]->getHasAvatar(),
                    'local_id'      => $player['local_id'],
                    'team_name'     => empty($teamNames[$playersMap[$player['id']]->getId()])
                        ? null
                        : $teamNames[$playersMap[$player['id']]->getId()],
                    'tenhou_id'     => $playersMap[$player['id']]->getTenhouId(),
                    'ignore_seating' => in_array($playersMap[$player['id']]->getId(), $ignoredPlayers),
                    'replaced_by' => empty($replacementMapToPlayer[$player['id']])
                        ? null
                        : [
                            'id' => $replacementMapToPlayer[$player['id']]->getId(),
                            'title' => $replacementMapToPlayer[$player['id']]->getDisplayName(),
                        ],
                ];
            }, $table);
        }, $seating);
    }

    /**
     * Reset current seating in case of any mistake
     *
     * @param int $eventId
     * @throws \Exception
     * @return bool
     */
    public function resetSeating(int $eventId)
    {
        $this->_checkIfAllowed($eventId);
        $events = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($events) || $events[0]->getGamesStatus() !== EventPrimitive::GS_SEATING_READY) {
            throw new TwirpError(ErrorCode::NotFound, 'Event not found in database or event is not in proper state');
        }

        if ($events[0]->getIsPrescripted()) {
            // decrement game index when seating is reset
            $prescript = EventPrescriptPrimitive::findByEventId($this->_ds, [$eventId]);
            $prescript[0]->setNextGameIndex($prescript[0]->getNextGameIndex() - 1)->save();
        }

        $events[0]->setGamesStatus(EventPrimitive::GS_STARTED)->save();
        $sessions = SessionPrimitive::findByEventAndStatus($this->_ds, $eventId, SessionPrimitive::STATUS_INPROGRESS);
        foreach ($sessions as $session) {
            $session->drop();
        }
        return true;
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
        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event #' . $eventId . ' not found in database');
        }

        if ($event[0]->getIsFinished()) {
            throw new InvalidParametersException('Event is already finished');
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
            throw new TwirpError(ErrorCode::NotFound, 'Event id#' . $eventId . ' not found in DB');
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
        $initialRating = $event[0]->getRulesetConfig()->rules()->getStartRating();
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
