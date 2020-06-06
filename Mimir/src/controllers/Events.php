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

require_once __DIR__ . '/../models/Event.php';
require_once __DIR__ . '/../models/EventSeries.php';
require_once __DIR__ . '/../models/EventUserManagement.php';
require_once __DIR__ . '/../models/Achievements.php';
require_once __DIR__ . '/../models/EventFinishedGames.php';
require_once __DIR__ . '/../models/EventRatingTable.php';
require_once __DIR__ . '/../primitives/PlayerRegistration.php';
require_once __DIR__ . '/../Controller.php';

class EventsController extends Controller
{
    /**
     * @param string $title
     * @param string $description
     * @param string $ruleset one of possible ruleset names ('ema', 'jpmlA', 'tenhounet', or any other supported by system)
     * @param int $gameDuration duration of game in this event in minutes
     * @param string $timezone name of timezone, 'Asia/Irkutsk' for example
     * @throws BadActionException
     * @throws InvalidParametersException
     * @throws \Exception
     * @return int
     */
    public function createEvent($title, $description, $ruleset, $gameDuration, $timezone)
    {
        $this->_log->addInfo('Creating new event with [' . $ruleset . '] rules');

        $event = (new EventPrimitive($this->_ds))
            ->setTitle($title)
            ->setDescription($description)
            ->setGameDuration($gameDuration)
            ->setTimeZone($timezone)
            ->setRuleset(Ruleset::instance($ruleset))
        ;
        $success = $event->save();
        if (!$success) {
            throw new BadActionException('Somehow we couldn\'t create event - this should not happen');
        }

        $id = $event->getId();
        if (empty($id)) {
            throw new InvalidParametersException('Attempted to return deidented primitive');
        }
        $this->_log->addInfo('Successfully create new event (id# ' . $id . ')');
        return $id;
    }

    /**
     * List all available events in system (paginated)
     *
     * @param int $limit
     * @param int $offset
     * @throws \Exception
     * @return array
     */
    public function getEvents($limit, $offset)
    {
        $this->_log->addInfo('Listing all events with limit/offset [' . $limit . '/' . $offset . ']');

        $data = (new EventModel($this->_ds, $this->_config, $this->_meta))
            ->getAllEvents($limit, $offset);

        $this->_log->addInfo('Successfully listed all events with limit/offset [' . $limit . '/' . $offset . ']');
        return $data;
    }

    /**
     * List available events by id list
     *
     * @param array $ids
     * @throws \Exception
     * @return array
     */
    public function getEventsById($ids)
    {
        $this->_log->addInfo('Listing events by id [' . implode($ids) . ']');
        $data = [];
        if (!empty($ids)) {
            $data = (new EventModel($this->_ds, $this->_config, $this->_meta))->getEventsById($ids);
        }
        $this->_log->addInfo('Successfully listed events by id [' . implode($ids) . ']');
        return $data;
    }

    /**
     * Get all players registered for event
     *
     * @param array $eventIdList
     * @throws \Exception
     * @return array
     */
    public function getAllRegisteredPlayers($eventIdList)
    {
        $this->_log->addInfo('Getting all players for event ids: ' . implode(", ", $eventIdList));

        if (!is_array($eventIdList) || empty($eventIdList)) {
            throw new InvalidParametersException('Event id list is not array or array is empty');
        }

        $eventList = EventPrimitive::findById($this->_ds, $eventIdList);
        if (count($eventList) != count($eventIdList)) {
            throw new InvalidParametersException('Some of events for ids ' . implode(", ", $eventIdList) . ' were not found in DB');
        }

        if (!EventPrimitive::areEventsCompatible($eventList)) {
            throw new InvalidParametersException('Incompatible events: ' . implode(", ", $eventIdList));
        }

        $needLocalIds = false;
        if (count($eventIdList) == 1 && $eventList[0]->getIsPrescripted()) {
            $needLocalIds = true;
        }

        $players = PlayerRegistrationPrimitive::findRegisteredPlayersByEventList($this->_ds, $eventIdList);
        $localMap = [];
        $teamNames = [];

        $ignoredPlayers = PlayerRegistrationPrimitive::findIgnoredPlayersIdsByEvent($this->_ds, $eventIdList);

        if ($needLocalIds) {
            $localMap = array_flip(PlayerRegistrationPrimitive::findLocalIdsMapByEvent($this->_ds, $eventIdList[0]));
        }

        if ($eventList[0]->getIsTeam()) {
            $teamNames = PlayerRegistrationPrimitive::findTeamNameMapByEvent($this->_ds, $eventIdList[0]);
        }

        $data = array_map(function (PlayerPrimitive $p) use (&$localMap, &$teamNames, &$ignoredPlayers) {
            return [
                'id'            => $p->getId(),
                'display_name'  => $p->getDisplayName(),
                'local_id'      => empty($localMap[$p->getId()]) ? null : $localMap[$p->getId()],
                'team_name'  => empty($teamNames[$p->getId()]) ? null : $teamNames[$p->getId()],
                'tenhou_id'     => $p->getTenhouId(),
                'ignore_seating' => in_array($p->getId(), $ignoredPlayers)
            ];
        }, $players);

        $this->_log->addInfo('Successfully received all players for event ids: ' . implode(", ", $eventIdList));

        return $data;
    }

    /**
     * Get all players registered for event
     *
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getAllRegisteredPlayersFromToken()
    {
        $this->_log->addInfo('Getting all players for event (by token)');
        $data = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))->dataFromToken();
        if (empty($data)) {
            throw new InvalidParametersException('Invalid player token', 401);
        }
        return $this->getAllRegisteredPlayers([$data->getEventId()]);
    }

    /**
     * Get tables state in tournament
     *
     * @param int $eventId
     * @throws \Exception
     * @return array
     */
    public function getTablesState($eventId)
    {
        $this->_log->addInfo('Getting tables state for event #' . $eventId);
        $data = (new EventModel($this->_ds, $this->_config, $this->_meta))
            ->getTablesState($eventId);
        $this->_log->addInfo('Successfully got tables state for event #' . $eventId);
        return $data;
    }

    /**
     * Get tables state in tournament from token
     *
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getTablesStateFromToken()
    {
        $this->_log->addInfo('Getting tables state for event (by token)');
        $eventModel = new EventModel($this->_ds, $this->_config, $this->_meta);

        if ($this->_meta->isGlobalWatcher()) {
            $data = $eventModel->getGlobalTablesState();
        } else {
            $eventUserModel = new EventUserManagementModel($this->_ds, $this->_config, $this->_meta);
            $reg = $eventUserModel->dataFromToken();
            if (empty($reg)) {
                throw new InvalidParametersException('Invalid player token', 401);
            }

            $data = $eventModel->getTablesState($reg->getEventId());
        }

        $this->_log->addInfo('Successfully got tables state for event (by token)');
        return $data;
    }


    /**
     * Get current seating in tournament
     *
     * @param int $eventId
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getCurrentSeating($eventId)
    {
        $this->_log->addInfo('Getting current seating for event #' . $eventId);
        $data = (new EventModel($this->_ds, $this->_config, $this->_meta))
            ->getCurrentSeating($eventId);
        $this->_log->addInfo('Successfully got current seating for event #' . $eventId);
        return $data;
    }

    /**
     * Register for participation in event
     *
     * @param string $pin
     * @throws \Exception
     * @return string Auth token
     */
    public function registerPlayer($pin)
    {
        $this->_log->addInfo('Registering pin code #' . $pin);
        $authToken = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))
            ->registerPlayerPin($pin);
        if (empty($authToken)) {
            throw new EntityNotFoundException('Pin code was already used or does not exist');
        }
        $this->_log->addInfo('Successfully registered pin code #' . $pin);
        return $authToken;
    }

    /**
     * Register for participation in event (from admin control panel)
     *
     * @param int $playerId
     * @param int $eventId
     * @throws InvalidParametersException
     * @throws \Exception
     * @return bool success?
     */
    public function registerPlayerAdmin($playerId, $eventId)
    {
        $this->_log->addInfo('Registering player id# ' . $playerId . ' for event id# ' . $eventId);
        $success = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))
            ->registerPlayer($playerId, $eventId);
        $this->_log->addInfo('Successfully registered player id# ' . $playerId . ' for event id# ' . $eventId);
        return $success;
    }

    /**
     * Unregister from participation in event (from admin control panel)
     *
     * @param int $playerId
     * @param int $eventId
     * @throws \Exception
     * @return void
     */
    public function unregisterPlayerAdmin($playerId, $eventId)
    {
        $this->_log->addInfo('Unregistering player id# ' . $playerId . ' for event id# ' . $eventId);
        (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))->unregisterPlayer($playerId, $eventId);
        $this->_log->addInfo('Successfully unregistered player id# ' . $playerId . ' for event id# ' . $eventId);
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
    public function updatePlayerSeatingFlag($playerId, $eventId, $ignoreSeating)
    {
        $this->_log->addInfo('Update player seating flag id# ' . $playerId . ' for event id# ' . $eventId);
        $result = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))->updateSeatingFlag(
            $playerId,
            $eventId,
            $ignoreSeating
        );
        $this->_log->addInfo('Successfully updated player seating flag id# ' . $playerId . ' for event id# ' . $eventId);
        return $result;
    }

    /**
     * Enroll player to registration lists. Player should make a self-registration after this, or
     * administrator may approve the player manually, and only after that the player will appear in rating table.
     *
     * @param int $playerId
     * @param int $eventId
     * @throws AuthFailedException
     * @throws BadActionException
     * @throws InvalidParametersException
     * @throws \Exception
     * @return string Secret pin code for self-registration
     */
    public function enrollPlayer($playerId, $eventId)
    {
        $this->_log->addInfo('Enrolling player id# ' . $playerId . ' for event id# ' . $eventId);
        $pin = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))
            ->enrollPlayer($eventId, $playerId);
        $this->_log->addInfo('Successfully enrolled player id# ' . $playerId . ' for event id# ' . $eventId);
        return $pin;
    }

    /**
     * Update static local identifiers for events with predefined seating.
     *
     * @param int $eventId
     * @param array $idMap Mapping of player_id => local_id
     * @return bool
     * @throws AuthFailedException
     * @throws \Exception
     */
    public function updateLocalIds($eventId, $idMap)
    {
        $this->_log->addInfo('Updating players\' local ids for event id# ' . $eventId);
        $success = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))
            ->updateLocalIds($eventId, $idMap);
        $this->_log->addInfo('Successfully updated players\' local ids for event id# ' . $eventId);
        return $success;
    }

    /**
     * Update team names for events with teams.
     *
     * @param int $eventId
     * @param array $teamNameMap Mapping of player_id => team_name
     * @return bool
     * @throws AuthFailedException
     * @throws \Exception
     */
    public function updateTeamNames($eventId, $teamNameMap)
    {
        $this->_log->addInfo('Updating players\' teams for event id# ' . $eventId);
        $success = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))
            ->updateTeamNames($eventId, $teamNameMap);
        $this->_log->addInfo('Successfully updated players\' teams for event id# ' . $eventId);
        return $success;
    }

    /**
     * Get all players enrolled for event
     *
     * @param int $eventId
     * @throws \Exception
     * @return array
     */
    public function getAllEnrolledPlayers($eventId)
    {
        $this->_log->addInfo('Getting all enrolled players for event id# ' . $eventId);

        $enrolled = PlayerEnrollmentPrimitive::findByEvent($this->_ds, $eventId);
        $players = PlayerPrimitive::findById(
            $this->_ds,
            array_map(function (PlayerEnrollmentPrimitive $e) {
                return $e->getPlayerId();
            }, $enrolled)
        );

        /** @var PlayerEnrollmentPrimitive[] $enrolledByKey */
        $enrolledByKey = [];
        foreach ($enrolled as $e) {
            $enrolledByKey[$e->getPlayerId()] = $e;
        }

        $data = array_map(function (PlayerPrimitive $p) use (&$enrolledByKey) {
            return [
                'id'            => $p->getId(),
                'display_name'  => $p->getDisplayName(),
                'tenhou_id'     => $p->getTenhouId(),
                'pin'           => $enrolledByKey[$p->getId()]->getPin()
            ];
        }, $players);

        $this->_log->addInfo('Successfully received all enrolled players for event id# ' . $eventId);
        return $data;
    }

    /**
     * Get event rules configuration
     *
     * @param int $eventId
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getGameConfig($eventId)
    {
        $this->_log->addInfo('Getting config for event id# ' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $rules = $event[0]->getRuleset();
        # we don't need to display add replay button to the online tournaments
        $hideAddReplayButton = $rules->title() == 'online' || $rules->title() == 'onlineJpmlA' || $rules->title() == 'onlineChips';
        $data = [
            'allowedYaku'         => array_values($rules->allowedYaku()),
            'startPoints'         => $rules->startPoints(),
            'goalPoints'          => $rules->goalPoints(),
            'playAdditionalRounds' => $rules->playAdditionalRounds(),
            'withKazoe'           => $rules->withKazoe(),
            'withKiriageMangan'   => $rules->withKiriageMangan(),
            'withAbortives'       => $rules->withAbortives(),
            'withNagashiMangan'   => $rules->withNagashiMangan(),
            'withAtamahane'       => $rules->withAtamahane(),
            'rulesetTitle'        => $rules->title(),
            'tenboDivider'        => $rules->tenboDivider(),
            'ratingDivider'       => $rules->ratingDivider(),
            'tonpuusen'           => $rules->tonpuusen(),
            'startRating'         => $rules->startRating(),
            'riichiGoesToWinner'  => $rules->riichiGoesToWinner(),
            'doubleronRiichiAtamahane' => $rules->doubleronRiichiAtamahane(),
            'doubleronHonbaAtamahane'  => $rules->doubleronHonbaAtamahane(),
            'extraChomboPayments' => $rules->extraChomboPayments(),
            'chomboPenalty'       => $rules->chomboPenalty(),
            'withKuitan'          => $rules->withKuitan(),
            'withButtobi'         => $rules->withButtobi(),
            'withMultiYakumans'   => $rules->withMultiYakumans(),
            'gameExpirationTime'  => $rules->gameExpirationTime(),
            'minPenalty'          => $rules->minPenalty(),
            'maxPenalty'          => $rules->maxPenalty(),
            'penaltyStep'         => $rules->penaltyStep(),
            'yakuWithPao'         => $rules->yakuWithPao(),
            'eventTitle'          => $event[0]->getTitle(),
            'eventDescription'    => $event[0]->getDescription(),
            'eventStatHost'       => $event[0]->getStatHost(),
            'useTimer'            => (bool)$event[0]->getUseTimer(),
            'usePenalty'          => (bool)$event[0]->getUsePenalty(),
            'timerPolicy'         => $rules->timerPolicy(),
            'redZone'             => $rules->redZone(), // in seconds!
            'yellowZone'          => $rules->yellowZone(), // in seconds!
            'gameDuration'        => $event[0]->getGameDuration(), // in minutes!
            'timezone'            => $event[0]->getTimezone(),
            'isOnline'            => (bool)$event[0]->getIsOnline(),
            'isTeam'              => (bool)$event[0]->getIsTeam(),
            'autoSeating'         => (bool)$event[0]->getAutoSeating(),
            'syncStart'           => (bool)$event[0]->getSyncStart(),
            'syncEnd'             => (bool)$event[0]->getSyncEnd(),
            'sortByGames'         => (bool)$event[0]->getSortByGames(),
            'allowPlayerAppend'   => (bool)$event[0]->getAllowPlayerAppend(),
            'withLeadingDealerGameover' => $rules->withLeadingDealerGameOver(),
            'subtractStartPoints' => $rules->subtractStartPoints(),
            'seriesLength'        => $event[0]->getSeriesLength(),
            'minGamesCount'        => $event[0]->getMinGamesCount(),
            'gamesStatus'         => $event[0]->getGamesStatus(),
            'hideResults'         => (bool)$event[0]->getHideResults(),
            'hideAddReplayButton' => $hideAddReplayButton,
            'isPrescripted'       => (bool)$event[0]->getIsPrescripted(),
            'chipsValue'          => (int) $rules->chipsValue(),
        ];

        $this->_log->addInfo('Successfully received config for event id# ' . $eventId);
        return $data;
    }

    /**
     * Get event rules configuration
     *
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getGameConfigFromToken()
    {
        $this->_log->addInfo('Getting config for event (by token)');
        $data = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))->dataFromToken();
        if (empty($data)) {
            throw new InvalidParametersException('Invalid player token', 401);
        }
        return $this->getGameConfig($data->getEventId());
    }

    /**
     * Get rating table for event
     *
     * @param array $eventIdList
     * @param string $orderBy either 'name', 'rating', 'avg_place' or 'avg_score'
     * @param string $order either 'asc' or 'desc'
     * @param bool $withPrefinished include prefinished games score
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getRatingTable($eventIdList, $orderBy, $order, $withPrefinished)
    {
        if (!is_array($eventIdList) || empty($eventIdList)) {
            throw new InvalidParametersException('Event id list is not array or array is empty');
        }

        $this->_log->addInfo('Getting rating table for event ids: ' . implode(", ", $eventIdList));

        $eventList = EventPrimitive::findById($this->_ds, $eventIdList);
        if (count($eventList) != count($eventIdList)) {
            throw new InvalidParametersException('Some of events for ids: ' . implode(", ", $eventIdList) . ' were not found in DB');
        }

        if (!EventPrimitive::areEventsCompatible($eventList)) {
            throw new InvalidParametersException('Incompatible events: ' . implode(", ", $eventIdList));
        }

        $table = (new EventRatingTableModel($this->_ds, $this->_config, $this->_meta))
            ->getRatingTable($eventList, $orderBy, $order, $withPrefinished);

        $this->_log->addInfo('Successfully received rating table for event ids: ' . implode(", ", $eventIdList));

        return $table;
    }

    /**
     * @return array
     * @throws AuthFailedException
     */
    public function getAchievementsList()
    {
        $this->_log->addInfo('Getting achievements code list');

        $list = (new AchievementsModel($this->_ds, $this->_config, $this->_meta))
            ->getAchievementsList();

        $this->_log->addInfo('Successfully received achievements code list');

        return $list;
    }

    /**
     * Get achievements list for event
     *
     * @param array $eventIdList
     * @param array $achievementsList
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getAchievements($eventIdList, $achievementsList)
    {
        if (!is_array($eventIdList) || empty($eventIdList)) {
            throw new InvalidParametersException('Event id list is not array or array is empty');
        }

        $this->_log->addInfo('Getting achievements list for event ids# ' . implode(", ", $eventIdList));

        $eventList = EventPrimitive::findById($this->_ds, $eventIdList);
        if (count($eventList) != count($eventIdList)) {
            throw new InvalidParametersException('Some of events for ids ' . implode(", ", $eventIdList) . ' were not found in DB');
        }

        if (!EventPrimitive::areEventsCompatible($eventList)) {
            throw new InvalidParametersException('Incompatible events: ' . implode(", ", $eventIdList));
        }

        $table = (new AchievementsModel($this->_ds, $this->_config, $this->_meta))
            ->getAchievements($eventIdList, $achievementsList);

        $this->_log->addInfo('Successfully received achievements list for event ids# ' . implode(", ", $eventIdList));

        return $table;
    }

    /**
     * Get last games for the event
     *
     * @param array $eventIdList
     * @param int $limit
     * @param int $offset
     * @param string $orderBy either 'id' or 'end_date'
     * @param string $order either 'asc' or 'desc'
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getLastGames($eventIdList, $limit, $offset, $orderBy = 'id', $order = 'desc')
    {
        if (!is_array($eventIdList) || empty($eventIdList)) {
            throw new InvalidParametersException('Event id list is not array or array is empty');
        }

        $this->_log->addInfo('Getting games list [' . $limit . '/' . $offset . '] for event ids: ' . implode(", ", $eventIdList));

        $eventList = EventPrimitive::findById($this->_ds, $eventIdList);
        if (count($eventList) != count($eventIdList)) {
            throw new InvalidParametersException('Some of events for ids ' . implode(", ", $eventIdList) . ' were not found in DB');
        }

        if (!EventPrimitive::areEventsCompatible($eventList)) {
            throw new InvalidParametersException('Incompatible events: ' . implode(", ", $eventIdList));
        }

        if (!in_array($orderBy, ['id', 'end_date']) || !in_array($order, ['asc', 'desc'])) {
            throw new InvalidParametersException('Invalid order attributes');
        }

        $table = (new EventFinishedGamesModel($this->_ds, $this->_config, $this->_meta))
            ->getLastFinishedGames($eventList, $limit, $offset, $orderBy, $order);

        $this->_log->addInfo('Successfully got games list [' . $limit . '/' . $offset . '] for event ids: ' . implode(", ", $eventIdList));
        return $table;
    }

    /**
     * Get game information
     *
     * @param string $representationalHash
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getGame($representationalHash)
    {
        $this->_log->addInfo('Getting game for session hash#' . $representationalHash);

        $session = SessionPrimitive::findByRepresentationalHash($this->_ds, [$representationalHash]);
        if (empty($session)) {
            throw new InvalidParametersException('Session hash#' . $representationalHash . ' not found in DB');
        }

        $result = (new EventFinishedGamesModel($this->_ds, $this->_config, $this->_meta))->getFinishedGame($session[0]);

        $this->_log->addInfo('Successfully got game for session hash#' . $representationalHash);
        return $result;
    }

    /**
     * Get games series for each player in event
     *
     * @param int $eventId
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getGamesSeries($eventId)
    {
        $this->_log->addInfo('Getting games series for event id# ' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $data = (new EventSeriesModel($this->_ds, $this->_config, $this->_meta))->getGamesSeries($event[0]);

        $this->_log->addInfo('Successfully got games series for event id# ' . $eventId);
        return $data;
    }

    /**
     * @param int $eventId
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getTimerState($eventId)
    {
        $this->_log->addInfo('Getting timer for event id#' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        if (!$event[0]->getUseTimer()) {
            $this->_log->addInfo('Timer is not used for event id#' . $eventId);
            return [];
        }

        // default: game finished
        $response = [
            'started' => false,
            'finished' => true,
            'time_remaining' => null
        ];

        if (empty($event[0]->getLastTimer())) {
            // no timer started
            $response = [
                'started' => false,
                'finished' => false,
                'time_remaining' => null
            ];
        } else if ($event[0]->getLastTimer() + $event[0]->getGameDuration() * 60 > time()) {
            // game in progress
            $response = [
                'started' => true,
                'finished' => false,
                'time_remaining' => $event[0]->getLastTimer() + $event[0]->getGameDuration() * 60 - time()
            ];
        }

        $response['waiting_for_timer'] = ($event[0]->getGamesStatus() == EventPrimitive::GS_SEATING_READY);

        $this->_log->addInfo('Successfully got timer data for event id#' . $eventId);

        return $response;
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getTimerStateFromToken()
    {
        $this->_log->addInfo('Getting timer for event (by token)');
        $data = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))->dataFromToken();
        if (empty($data)) {
            throw new InvalidParametersException('Invalid player token', 401);
        }
        return $this->getTimerState($data->getEventId());
    }

    /**
     * Start or restart timer for event
     *
     * @param int $eventId
     * @throws InvalidParametersException
     * @throws \Exception
     * @return bool
     */
    public function startTimer($eventId)
    {
        $this->_log->addInfo('Starting timer for event id#' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        if ($event[0]->getGamesStatus() == EventPrimitive::GS_SEATING_READY) {
            $event[0]->setGamesStatus(EventPrimitive::GS_STARTED);
        }

        $success = $event[0]->setLastTimer(time())->save();
        $this->_log->addInfo('Successfully started timer for event id#' . $eventId);
        return $success;
    }

    /**
     * Toggle hide results table flag
     *
     * @param int $eventId
     * @throws InvalidParametersException
     * @throws \Exception
     * @return bool
     */
    public function toggleHideResults($eventId)
    {
        $this->_log->addInfo('Toggle hide results flag for event id#' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $success = $event[0]->setHideResults($event[0]->getHideResults() == 1 ? 0 : 1)->save();
        $this->_log->addInfo('Successfully toggle hide results flag for event id#' . $eventId);
        return $success;
    }

    /**
     * Get prescripted config for event
     *
     * @param int $eventId
     * @return mixed
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getPrescriptedEventConfig($eventId)
    {
        $this->_log->addInfo('Getting prescripted config for event id#' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $config = (new EventModel($this->_ds, $this->_config, $this->_meta))
            ->getPrescriptedConfig($eventId);
        $this->_log->addInfo('Successfully received prescripted config for event id#' . $eventId);
        return $config;
    }

    /**
     * Update prescripted config for event
     *
     * @param int $eventId
     * @param int $nextSessionIndex
     * @param string $prescript
     * @return mixed
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function updatePrescriptedEventConfig($eventId, $nextSessionIndex, $prescript)
    {
        $this->_log->addInfo('Updating prescripted config for event id#' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $success = (new EventModel($this->_ds, $this->_config, $this->_meta))
            ->updatePrescriptedConfig($eventId, $nextSessionIndex - 1, $prescript);
        $this->_log->addInfo('Successfully updated prescripted config for event id#' . $eventId);
        return $success;
    }
}
