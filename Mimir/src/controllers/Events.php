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

require_once __DIR__ . '/../WsClient.php';
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
     * @param string $type Either 'club', 'tournament' or 'online'
     * @param string $title
     * @param string $description
     * @param string $titleEn
     * @param string $descriptionEn
     * @param string $ruleset one of possible ruleset names ('ema', 'jpmlA', 'tenhounet', or any other supported by system)
     * @param int $gameDuration duration of game in this event in minutes
     * @param string $timezone name of timezone, 'Asia/Irkutsk' for example
     * @param int $series Length of game series, 0 to disable
     * @param int $minGamesCount Minimum of games to be counted for ratings. 0 to disable.
     * @param int $lobbyId Tenhou lobby id for online tournaments
     * @param bool $isTeam If event is team tournament
     * @param bool $isPrescripted If tournament should have predefined seating
     * @param string $rulesetChangesJson Json-encoded changes for base ruleset
     * @throws BadActionException
     * @throws InvalidParametersException
     * @throws \Exception
     * @return int
     */
    public function createEvent(
        $type,
        $title,
        $description,
        $titleEn,
        $descriptionEn,
        $ruleset,
        $gameDuration,
        $timezone,
        $series,
        $minGamesCount,
        $lobbyId,
        $isTeam,
        $isPrescripted,
        $rulesetChangesJson
    ) {
        $this->_log->addInfo('Creating new event with [' . $ruleset . '] rules');

        // Check we have rights to create new event
        if (!$this->_meta->getCurrentPersonId() || !$this->_meta->isInternalRequest()) {
            throw new BadActionException("You don't have enough privileges to create new event");
        }

        if (!in_array($type, ['club', 'tournament', 'online'])) {
            throw new BadActionException(' Unsupported type of event requested');
        }

        try {
            $rulesetChanges = json_decode($rulesetChangesJson, true);
        } catch (\Exception $e) {
            $rulesetChanges = [];
        }

        /** @phpstan-ignore-next-line */
        $statHost = $this->_config->getStringValue('rhedaUrl') . '/eid' . EventPrimitive::ID_PLACEHOLDER;
        $event = (new EventPrimitive($this->_ds))
            ->setTitle($title)
            ->setTitleEn($titleEn)
            ->setDescription($description)
            ->setDescriptionEn($descriptionEn)
            ->setGameDuration($gameDuration)
            ->setTimeZone($timezone)
            ->setSeriesLength($series)
            ->setMinGamesCount($minGamesCount)
            ->setRuleset(\Common\Ruleset::instance($ruleset))
            ->setRulesetChanges($rulesetChanges)
            ->setStatHost($statHost)
        ;

        switch ($type) {
            case 'club':
                $event->setAllowPlayerAppend(1)
                    ->setAutoSeating(0)
                    ->setIsOnline(0)
                    ->setSyncStart(0)
                    ->setSyncEnd(0)
                    ->setUseTimer(0)
                    ->setUsePenalty(0)
                    ->setIsTeam(0)
                    ->setIsPrescripted(0)
                    ;
                break;
            case 'tournament':
                $event->setAllowPlayerAppend(0)
                    ->setAutoSeating($isPrescripted ? 0 : 1)
                    ->setIsOnline(0)
                    ->setSyncStart(1)
                    ->setSyncEnd(1)
                    ->setUseTimer(1)
                    ->setUsePenalty(1)
                    ->setIsTeam($isTeam ? 1 : 0)
                    ->setIsPrescripted($isPrescripted ? 1 : 0)
                ;
                break;
            case 'online':
                $event->setAllowPlayerAppend(0)
                    ->setAutoSeating(0)
                    ->setIsOnline(1)
                    ->setSyncStart(0)
                    ->setSyncEnd(0)
                    ->setUseTimer(0)
                    ->setUsePenalty(1)
                    ->setIsTeam($isTeam ? 1 : 0)
                    ->setLobbyId($lobbyId)
                    ->setIsPrescripted(0)
                ;
                break;
            default:
                ;
        }

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
     * Update settings of existing event
     *
     * @param int $id event id
     * @param string $title
     * @param string $description
     * @param string $titleEn
     * @param string $descriptionEn
     * @param string $ruleset one of possible ruleset names ('ema', 'jpmlA', 'tenhounet', or any other supported by system)
     * @param int $gameDuration duration of game in this event in minutes
     * @param string $timezone name of timezone, 'Asia/Irkutsk' for example
     * @param int $series Length of game series, 0 to disable
     * @param int $minGamesCount Minimum of games to be counted for ratings. 0 to disable.
     * @param int $lobbyId Tenhou lobby id for online tournaments
     * @param bool $isTeam If event is team tournament
     * @param bool $isPrescripted If tournament should have predefined seating
     * @param string $rulesetChangesJson Json-encoded changes for base ruleset
     * @throws BadActionException
     * @throws InvalidParametersException
     * @throws \Exception
     * @return bool
     */
    public function updateEvent(
        $id,
        $title,
        $description,
        $titleEn,
        $descriptionEn,
        $ruleset,
        $gameDuration,
        $timezone,
        $series,
        $minGamesCount,
        $lobbyId,
        $isTeam,
        $isPrescripted,
        $rulesetChangesJson
    ) {
        $this->_log->addInfo('Updating event with [' . $ruleset . '] rules');

        $event = EventPrimitive::findById($this->_ds, [$id]);
        if (empty($event)) {
            throw new InvalidParametersException('Event with id ' . $id . ' not found in DB');
        }
        $event = $event[0];

        // Check we have rights to update this event
        if (!$this->_meta->isEventAdminById($id)) {
            throw new BadActionException("You don't have enough privileges to modify this event");
        }

        try {
            $rulesetChanges = json_decode($rulesetChangesJson, true);
        } catch (\Exception $e) {
            $rulesetChanges = [];
        }

        $event->setTitle($title)
            ->setTitleEn($titleEn)
            ->setDescription($description)
            ->setDescriptionEn($descriptionEn)
            ->setGameDuration($gameDuration)
            ->setTimeZone($timezone)
            ->setSeriesLength($series)
            ->setMinGamesCount($minGamesCount)
            ->setRuleset(\Common\Ruleset::instance($ruleset))
            ->setRulesetChanges($rulesetChanges)
        ;

        if ($event->getSyncStart()) { // Should be a tournament
            $event
                ->setAutoSeating($isPrescripted ? 0 : 1)
                ->setIsTeam($isTeam ? 1 : 0)
                ->setIsPrescripted($isPrescripted ? 1 : 0)
            ;
        } elseif ($event->getIsOnline()) { // Should be online tournament
            $event
                ->setIsTeam($isTeam ? 1 : 0)
                ->setLobbyId($lobbyId)
            ;
        } else { // Should be club event
            // Nothing to update here
        }

        $success = $event->save();
        if (!$success) {
            throw new BadActionException('Somehow we couldn\'t update event - this should not happen');
        }

        $this->_log->addInfo('Successfully create new event (id# ' . $id . ')');
        return $success;
    }

    /**
     * Get settings of existing event
     *
     * @param int $id event id
     * @throws BadActionException
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getEventForEdit($id)
    {
        $this->_log->addInfo('Getting event settings for event #' . $id);

        $event = EventPrimitive::findById($this->_ds, [$id]);
        if (empty($event)) {
            throw new InvalidParametersException('Event with id ' . $id . ' not found in DB');
        }
        $event = $event[0];

        // Check we have rights to update this event
        if (!$this->_meta->isEventAdminById($id)) {
            throw new BadActionException("You don't have enough privileges to modify this event");
        }

        $data = [
            'id' => $event->getId(),
            'isTournament' => $event->getSyncStart(),
            'isOnline' => $event->getIsOnline(),
            'title' => $event->getTitle(),
            'description' => $event->getDescription(),
            'titleEn' => $event->getTitleEn(),
            'descriptionEn' => $event->getDescriptionEn(),
            'duration' => $event->getGameDuration(),
            'ruleset' => $event->getRuleset()->title(),
            'timezone' => $event->getTimezone(),
            'lobbyId' => $event->getLobbyId(),
            'seriesLength' => $event->getSeriesLength(),
            'minGames' => $event->getMinGamesCount(),
            'isTeam' => $event->getIsTeam(),
            'isPrescripted' => $event->getIsPrescripted(),
            'rulesetChanges' => json_encode($event->getRulesetChanges() ?: [])
        ];

        $this->_log->addInfo('Successfully got event settings for event #' . $id);
        return $data;
    }

    /**
     * List all available events in system (paginated)
     *
     * @param int $limit
     * @param int $offset
     * @param bool $filterFinished
     * @throws \Exception
     * @return array
     */
    public function getEvents($limit, $offset, $filterFinished = false)
    {
        $this->_log->addInfo('Listing all events with limit/offset [' . $limit . '/' . $offset . ']');

        $data = (new EventModel($this->_ds, $this->_config, $this->_meta))
            ->getAllEvents($limit, $offset, $filterFinished);

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

        $playersData = PlayerPrimitive::findPlayersForEvents($this->_ds, $eventIdList);
        /** @var PlayerPrimitive[] $players */
        $players = $playersData['players'];
        /** @var PlayerPrimitive[] $replacements */
        $replacements = $playersData['replacements'];
        $localMap = [];
        $teamNames = [];

        // Players who should ignore seating
        $ignoredPlayers = PlayerRegistrationPrimitive::findIgnoredPlayersIdsByEvent($this->_ds, $eventIdList);

        // Local player ids for prescripted events
        if ($needLocalIds) {
            $localMap = array_flip(PlayerRegistrationPrimitive::findLocalIdsMapByEvent($this->_ds, $eventIdList[0]));
        }

        // Team names for team tournaments
        if ($eventList[0]->getIsTeam()) {
            $teamNames = PlayerRegistrationPrimitive::findTeamNameMapByEvent($this->_ds, $eventIdList[0]);
        }

        $data = array_map(function (PlayerPrimitive $p) use (&$localMap, &$teamNames, &$ignoredPlayers, &$replacements) {
            return [
                'id'            => $p->getId(),
                'title'         => $p->getDisplayName(),
                'local_id'      => empty($localMap[$p->getId()]) ? null : $localMap[$p->getId()],
                'team_name'     => empty($teamNames[$p->getId()]) ? null : $teamNames[$p->getId()],
                'tenhou_id'     => $p->getTenhouId(),
                'ignore_seating' => in_array($p->getId(), $ignoredPlayers),
                'replaced_by'   => empty($replacements[$p->getId()]) ? null : [
                    'id' => $replacements[$p->getId()]->getId(),
                    'title' => $replacements[$p->getId()]->getDisplayName(),
                ],
            ];
        }, $players);

        $this->_log->addInfo('Successfully received all players for event ids: ' . implode(", ", $eventIdList));

        return $data;
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

        $games = SessionPrimitive::findByEventListAndStatus($this->_ds, [$eventId], SessionPrimitive::STATUS_FINISHED);
        $players = EventModel::getPlayersOfGames($this->_ds, $games);

        $data = (new EventModel($this->_ds, $this->_config, $this->_meta))
            ->getCurrentSeating($eventId, $players);
        $this->_log->addInfo('Successfully got current seating for event #' . $eventId);
        return $data;
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
        (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))
            ->unregisterPlayer($playerId, $eventId);
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
        $result = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))
            ->updateSeatingFlag($playerId, $eventId, $ignoreSeating);
        $this->_log->addInfo('Successfully updated player seating flag id# ' . $playerId . ' for event id# ' . $eventId);
        return $result;
    }

    /**
     * Update replacement_id for registered player.
     * Assign -1 to remove replacement.
     *
     * @param int $playerId
     * @param int $eventId
     * @param int $replacementId
     * @throws \Exception
     * @return bool
     */
    public function updatePlayerReplacement($playerId, $eventId, $replacementId)
    {
        $this->_log->addInfo('Update player replacement id# ' . $playerId . ' for event id# ' . $eventId);
        $result = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))
            ->updateReplacement($playerId, $eventId, $replacementId);
        $this->_log->addInfo('Successfully updated player replacement id# ' . $playerId . ' for event id# ' . $eventId);
        return $result;
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
            'eventDescription'    => $this->_mdTransform($event[0]->getDescription()),
            'eventTitleEn'        => $event[0]->getTitleEn(),
            'eventDescriptionEn'  => $this->_mdTransform($event[0]->getDescriptionEn()),
            'eventStatHost'       => str_replace(EventPrimitive::ID_PLACEHOLDER, (string)$event[0]->getId(), $event[0]->getStatHost()),
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
            'withLeadingDealerGameOver' => $rules->withLeadingDealerGameOver(),
            'subtractStartPoints' => $rules->subtractStartPoints(),
            'seriesLength'        => $event[0]->getSeriesLength(),
            'minGamesCount'        => $event[0]->getMinGamesCount(),
            'gamesStatus'         => $event[0]->getGamesStatus(),
            'hideResults'         => (bool)$event[0]->getHideResults(),
            'hideAddReplayButton' => $hideAddReplayButton,
            'isPrescripted'       => (bool)$event[0]->getIsPrescripted(),
            'chipsValue'          => (int) $rules->chipsValue(),
            'isFinished'          => (bool)$event[0]->getIsFinished(),
        ];

        $this->_log->addInfo('Successfully received config for event id# ' . $eventId);
        return $data;
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

        // Check we have rights to register player modify timer for this event
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new BadActionException("You don't have enough privileges to modify timer for this event");
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

        // Check we have rights to hide results for this event
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new BadActionException("You don't have enough privileges to hide results for this event");
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
     * Finish event
     *
     * @param int $eventId
     * @return bool
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function finishEvent($eventId)
    {
        $this->_log->addInfo('Finishing event with id#' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }
        $event = $event[0];

        // Check we have rights to update this event
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new BadActionException("You don't have enough privileges to modify this event");
        }

        $success = $event->setIsFinished(1)->save();

        $this->_log->addInfo('Successfully finished event with id#' . $eventId);
        return $success;
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

        // Check we have rights to modify this event
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new BadActionException("You don't have enough privileges to modify this event");
        }

        $success = (new EventModel($this->_ds, $this->_config, $this->_meta))
            ->updatePrescriptedConfig($eventId, $nextSessionIndex - 1, $prescript);
        $this->_log->addInfo('Successfully updated prescripted config for event id#' . $eventId);
        return $success;
    }

    /**
     * Get available rulesets list
     *
     * @return array
     */
    public function getRulesets()
    {
        $this->_log->addInfo('Receiving rulesets list');
        $list = [
            'ema' => [
                'description' => 'European Mahjong Association rules',
                'originalRules' => \Common\Ruleset::instance('ema')->getRawRuleset()
            ],
            'jpmlA' => [
                'description' => 'Japanese Professional Mahjong League A rules',
                'originalRules' => \Common\Ruleset::instance('jpmlA')->getRawRuleset()
            ],
            'wrc' => [
                'description' => 'World Riichi Championship rules',
                'originalRules' => \Common\Ruleset::instance('wrc')->getRawRuleset()
            ],
            'tenhounet' => [
                'description' => 'Tenhou.net compatible rules',
                'originalRules' => \Common\Ruleset::instance('tenhounet')->getRawRuleset()
            ]
        ];

        $this->_log->addInfo('Successfully received rulesets');
        return ['rules' => $list, 'fields' => \Common\Ruleset::fieldTypes()];
    }

    /**
     * Get available timezones.
     * If addr is provided, calculate preferred timezone based on IP.
     *
     * @param string $addr
     * @return array
     * @throws \Exception
     */
    public function getTimezones($addr = '')
    {
        $this->_log->addInfo('Receiving timezones list');
        $timezoneIdentifiers = \DateTimeZone::listIdentifiers();

        $preferredTimezone = '';
        if ($addr) {
            require_once __DIR__ . '/../../bin/geoip2.phar';
            try {
                /** @phpstan-ignore-next-line */
                $reader = new \GeoIp2\Database\Reader(__DIR__ . '/../../bin/GeoLite2-City.mmdb');
                /** @phpstan-ignore-next-line */
                $record = $reader->city($addr);
                $preferredTimezone = $record->location->timeZone;
            } catch (\Exception $e) {
                // Do nothing actually.
            }
        }

        $this->_log->addInfo('Successfully received timezones');
        return [
            'timezones' => $timezoneIdentifiers,
            'preferredByIp' => $preferredTimezone
        ];
    }

    /**
     * Get available countries.
     * If addr is provided, calculate preferred country based on IP.
     *
     * @param string $addr
     * @return array
     * @throws \Exception
     */
    public function getCountries($addr = '')
    {
        $this->_log->addInfo('Receiving countries list');
        require_once __DIR__ . '/../../bin/countries.php';
        /** @phpstan-ignore-next-line */
        $countries = getCountriesWithCodes();

        $preferredCountry = '';
        if ($addr) {
            require_once __DIR__ . '/../../bin/geoip2.phar';
            try {
                /** @phpstan-ignore-next-line */
                $reader = new \GeoIp2\Database\Reader(__DIR__ . '/../../bin/GeoLite2-City.mmdb');
                /** @phpstan-ignore-next-line */
                $record = $reader->city($addr);
                $preferredCountry = strtoupper($record->country->isoCode);
            } catch (\Exception $e) {
                // Do nothing actually.
            }
        }

        $this->_log->addInfo('Successfully received countries');
        return [
            'countries' => $countries,
            'preferredByIp' => $preferredCountry
        ];
    }

    /**
     * @param int $eventId
     * @return bool
     * @throws BadActionException
     */
    public function rebuildEventScoring($eventId)
    {
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new BadActionException("You don't have enough privileges to rebuild ratings for this event");
        }

        $results = SessionResultsPrimitive::findByEventId($this->_ds, [$eventId]);
        foreach ($results as $res) {
            $res->drop();
        }

        $playerResults = PlayerHistoryPrimitive::findAllByEvent($this->_ds, $eventId);
        foreach ($playerResults as $item) {
            $item->drop();
        }

        $sessions = SessionPrimitive::findByEventAndStatus($this->_ds, $eventId, 'finished', 0, null, 'id', 'asc');
        foreach ($sessions as $session) {
            $session->recreateHistory();
        }

        return true;
    }

    /**
     * @param int $eventId
     * @param array $notification
     * @throws \WebSocket\BadOpcodeException
     * @return void
     */
    public function sendNotification($eventId, $notification)
    {
        $wsClient = new WsClient(
            $this->_config->getStringValue('ratatoskUrl'),
            $this->_config->getStringValue('ratatoskKey')
        );
        $wsClient->publishNotification($eventId, $notification);
    }
}
