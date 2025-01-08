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

use Common\Penalty;
use Common\PlatformType;
use Common\Player;
use Common\Ruleset;
use Common\RulesetConfig;
use Common\TwirpError;
use Twirp\ErrorCode;

require_once __DIR__ . '/../models/Event.php';
require_once __DIR__ . '/../models/EventSeries.php';
require_once __DIR__ . '/../models/EventUserManagement.php';
require_once __DIR__ . '/../models/EventFinishedGames.php';
require_once __DIR__ . '/../models/EventRatingTable.php';
require_once __DIR__ . '/../primitives/PlayerRegistration.php';
require_once __DIR__ . '/../primitives/Achievements.php';
require_once __DIR__ . '/../Controller.php';

class EventsController extends Controller
{
    /**
     * @param string $type Either 'club', 'tournament' or 'online'
     * @param string $title
     * @param string $description
     * @param int $gameDuration duration of game in this event in minutes
     * @param string $timezone name of timezone, 'Asia/Irkutsk' for example
     * @param int $series Length of game series, 0 to disable
     * @param int $minGamesCount Minimum of games to be counted for ratings. 0 to disable.
     * @param int $lobbyId Tenhou lobby id for online tournaments
     * @param bool $isTeam If event is team tournament
     * @param bool $isPrescripted If tournament should have predefined seating
     * @param int $autostartTimer Interval before games autostart
     * @param bool $isListed If event is shown on main page
     * @param bool $isRatingShown If event rating table is publicly accessible
     * @param bool $achievementsShown If event achievements page is publicly accessible
     * @param bool $allowViewOtherTables If other tables can be viewed during ongoing game
     * @param ?int $platformId For online tournaments, ID of the gaming platform to use
     * @param ?RulesetConfig $rulesetConfig
     * @throws BadActionException
     * @throws InvalidParametersException
     * @throws \Exception
     * @return int
     */
    public function createEvent(
        $type,
        $title,
        $description,
        $gameDuration,
        $timezone,
        $series,
        $minGamesCount,
        $lobbyId,
        $isTeam,
        $isPrescripted,
        $autostartTimer,
        $isListed,
        $isRatingShown,
        $achievementsShown,
        $allowViewOtherTables,
        $platformId,
        $rulesetConfig
    ) {
        $this->_log->info('Creating new event...');

        if (empty($rulesetConfig)) {
            throw new BadActionException('Ruleset configuration must be supplied');
        }

        // Check we have rights to create new event
        if (!$this->_meta->getCurrentPersonId() || !$this->_meta->getAccessRuleValue('CREATE_EVENT')) {
            throw new BadActionException("You don't have enough privileges to create new event");
        }

        if (!in_array($type, ['club', 'tournament', 'online'])) {
            throw new BadActionException('Unsupported type of event requested');
        }

        /** @phpstan-ignore-next-line */
        $statHost = $this->_config->getStringValue('sigrunUrl') . '/event/' . EventPrimitive::ID_PLACEHOLDER . '/info';
        $event = (new EventPrimitive($this->_ds))
            ->setTitle($title)
            ->setDescription($description)
            ->setGameDuration($gameDuration)
            ->setTimeZone($timezone)
            ->setIsListed($isListed ? 1 : 0)
            ->setHideResults($isRatingShown ? 0 : 1)
            ->setHideAchievements($achievementsShown ? 0 : 1)
            ->setSeriesLength($series)
            ->setMinGamesCount($minGamesCount)
            ->setRulesetConfig(new \Common\Ruleset($rulesetConfig))
            ->setAllowViewOtherTables($allowViewOtherTables ? 1 : 0)
            ->setStatHost($statHost)
        ;

        if ($this->_meta->isSuperadmin()) {
            $event->setPlatformId($platformId === PlatformType::PLATFORM_TYPE_UNSPECIFIED ? null : $platformId);
        }

        switch ($type) {
            case 'club':
                $event->setAllowPlayerAppend(1)
                    ->setAutoSeating(0)
                    ->setIsOnline(0)
                    ->setSyncStart(0)
                    ->setSyncEnd(0)
                    ->setUseTimer(0)
                    ->setUsePenalty(1)
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
                    ->setTimeToStart($autostartTimer)
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

        $ruleId = $this->_ds->remote()->addRuleForPerson(
            'ADMIN_EVENT',
            true,
            'bool',
            $this->_meta->getCurrentPersonId(),
            $id
        );
        if (empty($ruleId)) {
            throw new InvalidParametersException('Failed to save event privileges to Frey');
        }

        $this->_log->info('Successfully created new event (id# ' . $id . ')');
        return $id;
    }

    /**
     * Update settings of existing event
     *
     * @param int $id event id
     * @param string $title
     * @param string $description
     * @param int $gameDuration duration of game in this event in minutes
     * @param string $timezone name of timezone, 'Asia/Irkutsk' for example
     * @param int $series Length of game series, 0 to disable
     * @param int $minGamesCount Minimum of games to be counted for ratings. 0 to disable.
     * @param int $lobbyId Tenhou lobby id for online tournaments
     * @param bool $isTeam If event is team tournament
     * @param bool $isPrescripted If tournament should have predefined seating
     * @param int $autostartTimer Interval before games are started automatically
     * @param bool $isListed If event is shown on main page
     * @param bool $isRatingShown If event rating table is publicly accessible
     * @param bool $achievementsShown If event achievements page is publicly accessible
     * @param bool $allowViewOtherTables If other tables can be viewed during ongoing game
     * @param ?int $platformId For online tournaments, ID of the gaming platform to use
     * @param ?RulesetConfig $rulesetConfig
     * @return bool
     * @throws BadActionException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function updateEvent(
        $id,
        $title,
        $description,
        $gameDuration,
        $timezone,
        $series,
        $minGamesCount,
        $lobbyId,
        $isTeam,
        $isPrescripted,
        $autostartTimer,
        $isListed,
        $isRatingShown,
        $achievementsShown,
        $allowViewOtherTables,
        $platformId,
        $rulesetConfig
    ) {
        $this->_log->info('Updating event with id #' . $id);

        if (empty($rulesetConfig)) {
            throw new BadActionException('Ruleset configuration must be supplied');
        }

        $event = EventPrimitive::findById($this->_ds, [$id]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event with id ' . $id . ' not found in DB');
        }
        $event = $event[0];

        // Check we have rights to update this event
        if (!$this->_meta->isEventAdminById($id)) {
            throw new BadActionException("You don't have enough privileges to modify this event");
        }

        $event->setTitle($title)
            ->setDescription($description)
            ->setGameDuration($gameDuration)
            ->setTimeZone($timezone)
            ->setIsListed($isListed ? 1 : 0)
            ->setHideResults($isRatingShown ? 0 : 1)
            ->setHideAchievements($achievementsShown ? 0 : 1)
            ->setSeriesLength($series)
            ->setMinGamesCount($minGamesCount)
            ->setAllowViewOtherTables($allowViewOtherTables ? 1 : 0)
            ->setRulesetConfig(new Ruleset($rulesetConfig))
        ;

        if ($this->_meta->isSuperadmin()) {
            $event->setPlatformId($platformId === PlatformType::PLATFORM_TYPE_UNSPECIFIED ? null : $platformId);
        }

        if ($event->getSyncStart()) { // Should be a tournament
            $event
                ->setAutoSeating($isPrescripted ? 0 : 1)
                ->setIsTeam($isTeam ? 1 : 0)
                ->setTimeToStart($autostartTimer)
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

        $this->_log->info('Successfully updated new event (id# ' . $id . ')');
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
        $this->_log->info('Getting event settings for event #' . $id);

        $event = EventPrimitive::findById($this->_ds, [$id]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event with id ' . $id . ' not found in DB');
        }
        $event = $event[0];

        // Check we have rights to update this event
        if (!$this->_meta->isEventAdminById($id)) {
            throw new BadActionException("You don't have enough privileges to modify this event");
        }

        $data = [
            'id' => $event->getId(),
            'isTournament' => (bool)$event->getSyncStart(),
            'isOnline' => (bool)$event->getIsOnline(),
            'title' => $event->getTitle(),
            'description' => $event->getDescription(),
            'duration' => $event->getGameDuration(),
            'timezone' => $event->getTimezone(),
            'lobbyId' => $event->getLobbyId(),
            'seriesLength' => $event->getSeriesLength(),
            'minGames' => $event->getMinGamesCount(),
            'isTeam' => (bool)$event->getIsTeam(),
            'isPrescripted' => (bool)$event->getIsPrescripted(),
            'autostart' => $event->getTimeToStart(),
            'ruleset' => $event->getRulesetConfig()->rules(),
            'isListed' => (bool)$event->getIsListed(),
            'isRatingShown' => !$event->getHideResults(),
            'allowViewOtherTables' => (bool)$event->getAllowViewOtherTables(),
            'achievementsShown' => !$event->getHideAchievements(),
            'isFinished' => (bool)$event->getIsFinished(),
            'platformId' => $event->getPlatformId()
        ];

        $this->_log->info('Successfully got event settings for event #' . $id);
        return $data;
    }

    /**
     * List all available events in system (paginated)
     *
     * @param int $limit
     * @param int $offset
     * @param string $filter
     * @param bool $filterUnlisted
     * @return array
     *@throws \Exception
     */
    public function getEvents($limit, $offset, $filter, $filterUnlisted = false)
    {
        $this->_log->info('Listing all events with limit/offset [' . $limit . '/' . $offset . ']');

        $data = (new EventModel($this->_ds, $this->_config, $this->_meta))
            ->getAllEvents($limit, $offset, $filter, $filterUnlisted);

        $this->_log->info('Successfully listed all events with limit/offset [' . $limit . '/' . $offset . ']');
        return $data;
    }

    /**
     * List available events by id list
     *
     * @param int[] $ids
     * @throws \Exception
     * @return array
     */
    public function getEventsById($ids)
    {
        $this->_log->info('Listing events by ids [' . implode(", ", $ids) . ']');
        $data = [];
        if (!empty($ids)) {
            $data = (new EventModel($this->_ds, $this->_config, $this->_meta))->getEventsById($ids);
        }
        $this->_log->info('Successfully listed events by ids [' . implode(", ", $ids) . ']');
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
        $this->_log->info('Getting all players for event ids: ' . implode(", ", $eventIdList));

        if (!is_array($eventIdList) || empty($eventIdList)) {
            throw new InvalidParametersException('Event id list is not array or array is empty');
        }

        $eventList = EventPrimitive::findById($this->_ds, $eventIdList);
        if (count($eventList) != count($eventIdList)) {
            throw new TwirpError(ErrorCode::NotFound, 'Some of events for ids ' . implode(", ", $eventIdList) . ' were not found in DB');
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

        $soulNicknames = [];
        $useSoulNicknames = $eventList[0]->getPlatformId() === PlatformType::PLATFORM_TYPE_MAHJONGSOUL;
        if ($useSoulNicknames) {
            $soulNicknames = $this->_ds->remote()->getMajsoulNicknames(array_map(function (PlayerPrimitive $el) {
                return (int)$el->getId();
            }, $players));
        }

        $data = array_map(function (PlayerPrimitive $p) use (&$localMap, &$teamNames, &$ignoredPlayers, &$replacements, &$soulNicknames, $useSoulNicknames) {
            return [
                'id'            => $p->getId(),
                'title'         => $p->getDisplayName(),
                'local_id'      => empty($localMap[$p->getId()]) ? null : $localMap[$p->getId()],
                'team_name'     => empty($teamNames[$p->getId()]) ? null : $teamNames[$p->getId()],
                'tenhou_id'     => $useSoulNicknames ? ($soulNicknames[(int)$p->getId()] ?? '') : $p->getTenhouId(),
                'has_avatar'    => $p->getHasAvatar(),
                'last_update'   => $p->getLastUpdate(),
                'ignore_seating' => in_array($p->getId(), $ignoredPlayers),
                'replaced_by'   => empty($replacements[$p->getId()]) ? null : [
                    'id' => $replacements[$p->getId()]->getId(),
                    'title' => $replacements[$p->getId()]->getDisplayName(),
                    'has_avatar' => $replacements[$p->getId()]->getHasAvatar(),
                    'last_update' => $replacements[$p->getId()]->getLastUpdate(),
                ],
            ];
        }, $players);

        $this->_log->info('Successfully received all players for event ids: ' . implode(", ", $eventIdList));

        return $data;
    }

    /**
     * Get tables state in tournament
     *
     * @param int $eventId
     * @param bool $omitLastRound
     * @throws \Exception
     * @return array
     */
    public function getTablesState($eventId, $omitLastRound = false)
    {
        $this->_log->info('Getting tables state for event #' . $eventId);
        $data = (new EventModel($this->_ds, $this->_config, $this->_meta))
            ->getTablesState($eventId, $omitLastRound);
        $this->_log->info('Successfully got tables state for event #' . $eventId);
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
        $this->_log->info('Getting current seating for event #' . $eventId);

        $regs = array_filter(PlayerRegistrationPrimitive::findByEventId($this->_ds, $eventId), function (PlayerRegistrationPrimitive $reg) {
            return !$reg->getIgnoreSeating();
        });

        $ids = array_map(function (PlayerRegistrationPrimitive $reg) {
            return $reg->getPlayerId();
        }, $regs);

        $players = [];
        foreach (PlayerPrimitive::findById($this->_ds, $ids) as $player) {
            $players[$player->getId()] = [
                'id' => $player->getId(),
                'tenhou_id' => $player->getTenhouId(),
                'title' => $player->getDisplayName(),
                'has_avatar' => $player->getHasAvatar(),
                'last_update' => $player->getLastUpdate(),
            ];
        }

        $data = (new EventModel($this->_ds, $this->_config, $this->_meta))
            ->getCurrentSeating($eventId, $players);
        $this->_log->info('Successfully got current seating for event #' . $eventId);
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
        $this->_log->info('Registering player id# ' . $playerId . ' for event id# ' . $eventId);
        $success = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))
            ->registerPlayer($playerId, $eventId);
        $this->_log->info('Successfully registered player id# ' . $playerId . ' for event id# ' . $eventId);
        return $success;
    }

    /**
     * Unregister from participation in event (from admin control panel)
     *
     * @param int $playerId
     * @param int $eventId
     * @throws \Exception
     * @return bool
     */
    public function unregisterPlayerAdmin($playerId, $eventId)
    {
        $this->_log->info('Unregistering player id# ' . $playerId . ' for event id# ' . $eventId);
        $success = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))
            ->unregisterPlayer($playerId, $eventId);
        $this->_log->info('Successfully unregistered player id# ' . $playerId . ' for event id# ' . $eventId);
        return $success;
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
        $this->_log->info('Update player seating flag id# ' . $playerId . ' for event id# ' . $eventId);
        $result = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))
            ->updateSeatingFlag($playerId, $eventId, $ignoreSeating);
        $this->_log->info('Successfully updated player seating flag id# ' . $playerId . ' for event id# ' . $eventId);
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
        $this->_log->info('Update player replacement id# ' . $playerId . ' for event id# ' . $eventId);
        $result = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))
            ->updateReplacement($playerId, $eventId, $replacementId);
        $this->_log->info('Successfully updated player replacement id# ' . $playerId . ' for event id# ' . $eventId);
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
        $this->_log->info('Updating players\' local ids for event id# ' . $eventId);
        $success = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))
            ->updateLocalIds($eventId, $idMap);
        $this->_log->info('Successfully updated players\' local ids for event id# ' . $eventId);
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
        $this->_log->info('Updating players\' teams for event id# ' . $eventId);
        $success = (new EventUserManagementModel($this->_ds, $this->_config, $this->_meta))
            ->updateTeamNames($eventId, $teamNameMap);
        $this->_log->info('Successfully updated players\' teams for event id# ' . $eventId);
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
        $this->_log->info('Getting config for event id# ' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event id#' . $eventId . ' not found in DB');
        }

        $rules = $event[0]->getRulesetConfig();
        $data = [
            'ruleset'             => $rules->rules(),
            'eventTitle'          => $event[0]->getTitle(),
            'eventDescription'    => $this->_mdTransform($event[0]->getDescription()),
            'eventStatHost'       => str_replace(EventPrimitive::ID_PLACEHOLDER, (string)$event[0]->getId(), $event[0]->getStatHost()),
            'useTimer'            => (bool)$event[0]->getUseTimer(),
            'usePenalty'          => (bool)$event[0]->getUsePenalty(),
            'gameDuration'        => $event[0]->getGameDuration(), // in minutes!
            'timezone'            => $event[0]->getTimezone(),
            'isOnline'            => (bool)$event[0]->getIsOnline(),
            'isTeam'              => (bool)$event[0]->getIsTeam(),
            'autoSeating'         => (bool)$event[0]->getAutoSeating(),
            'syncStart'           => (bool)$event[0]->getSyncStart(),
            'syncEnd'             => (bool)$event[0]->getSyncEnd(),
            'sortByGames'         => (bool)$event[0]->getSortByGames(),
            'allowPlayerAppend'   => (bool)$event[0]->getAllowPlayerAppend(),
            'seriesLength'        => $event[0]->getSeriesLength(),
            'minGamesCount'       => $event[0]->getMinGamesCount(),
            'gamesStatus'         => $event[0]->getGamesStatus(),
            'hideResults'         => (bool)$event[0]->getHideResults(),
            'hideAddReplayButton' => false, // TODO: fix when tournaments are resurrected
            'isPrescripted'       => (bool)$event[0]->getIsPrescripted(),
            'isFinished'          => (bool)$event[0]->getIsFinished(),
            'lobbyId'             => $event[0]->getLobbyId(),
            'allowViewOtherTables' => (bool)$event[0]->getAllowViewOtherTables(),
        ];

        $this->_log->info('Successfully received config for event id# ' . $eventId);
        return $data;
    }

    /**
     * Get rating table for event
     *
     * @param array $eventIdList
     * @param string $orderBy either 'name', 'rating', 'avg_place', 'avg_score' or 'chips'
     * @param string $order either 'asc' or 'desc'
     * @param bool $onlyWithMinGames output only players having a required minimum of played games
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getRatingTable($eventIdList, $orderBy, $order, $onlyWithMinGames)
    {
        if (!is_array($eventIdList) || empty($eventIdList)) {
            throw new InvalidParametersException('Event id list is not array or array is empty');
        }

        $this->_log->info('Getting rating table for event ids: ' . implode(", ", $eventIdList));

        $eventList = EventPrimitive::findById($this->_ds, $eventIdList);
        if (count($eventList) != count($eventIdList)) {
            throw new TwirpError(ErrorCode::NotFound, 'Some of events for ids: ' . implode(", ", $eventIdList) . ' were not found in DB');
        }

        // Show prefinished results and hidden results only for event admin.
        // We should also check that requested event matches authorization header.
        $isAdmin = count($eventIdList) === 1 &&
            $this->_meta->isAuthorizedForEvent($eventIdList[0]) &&
            $this->_meta->isEventAdmin();

        $playerRegs = PlayerRegistrationPrimitive::fetchPlayerRegData($this->_ds, $eventIdList);
        $table = (new EventRatingTableModel($this->_ds, $this->_config, $this->_meta))
            ->getRatingTable($eventList, $playerRegs, $orderBy, $order, $isAdmin, $onlyWithMinGames);

        $this->_log->info('Successfully received rating table for event ids: ' . implode(", ", $eventIdList));

        return $table;
    }

    /**
     * Get achievements list for event
     *
     * @param int $eventId
     * @param array $achievementsList
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getAchievements($eventId, $achievementsList)
    {
        $this->_log->info('Getting achievements list for event ids# ' . $eventId);

        $eventList = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($eventList)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event id # ' . $eventId . ' was not found in DB');
        }

        // Show prefinished results and hidden achievements only for event admin.
        // We should also check that requested event matches authorization header.
        $isAdmin = count($eventList) === 1 &&
            $eventList[0]->getId() &&
            $this->_meta->isAuthorizedForEvent($eventList[0]->getId()) &&
            $this->_meta->isEventAdmin();

        $result = [];
        $lastUpdate = null;
        if (!$eventList[0]->getHideAchievements() || $isAdmin) {
            $achievements = AchievementsPrimitive::findByEventId($this->_ds, [$eventId])[0];
            $table = $achievements->getData();
            $lastUpdate = DateHelper::getLocalDate($achievements->getLastUpdate(), $eventList[0]->getTimezone());
            foreach ($achievementsList as $ach) {
                $result[$ach] = $table[$ach];
            }
        }

        $this->_log->info('Successfully received achievements list for event ids# ' . $eventId);
        return [$result, $lastUpdate];
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

        $this->_log->info('Getting games list [' . $limit . '/' . $offset . '] for event ids: ' . implode(", ", $eventIdList));

        $eventList = EventPrimitive::findById($this->_ds, $eventIdList);
        if (count($eventList) != count($eventIdList)) {
            throw new TwirpError(ErrorCode::NotFound, 'Some of events for ids ' . implode(", ", $eventIdList) . ' were not found in DB');
        }

        if (!in_array($orderBy, ['id', 'end_date']) || !in_array($order, ['asc', 'desc'])) {
            throw new InvalidParametersException('Invalid order attributes');
        }

        $table = (new EventFinishedGamesModel($this->_ds, $this->_config, $this->_meta))
            ->getLastFinishedGames($eventList, $limit, $offset, $orderBy, $order);

        $this->_log->info('Successfully got games list [' . $limit . '/' . $offset . '] for event ids: ' . implode(", ", $eventIdList));
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
        $this->_log->info('Getting game for session hash#' . $representationalHash);

        $session = SessionPrimitive::findByRepresentationalHash($this->_ds, [$representationalHash]);
        if (empty($session)) {
            throw new TwirpError(ErrorCode::NotFound, 'Session hash#' . $representationalHash . ' not found in DB');
        }

        $result = (new EventFinishedGamesModel($this->_ds, $this->_config, $this->_meta))->getFinishedGame($session[0]);

        $this->_log->info('Successfully got game for session hash#' . $representationalHash);
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
        $this->_log->info('Getting games series for event id# ' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event id#' . $eventId . ' not found in DB');
        }

        $data = (new EventSeriesModel($this->_ds, $this->_config, $this->_meta))->getGamesSeries($event[0]);

        $this->_log->info('Successfully got games series for event id# ' . $eventId);
        return $data;
    }

    /**
     * Event-wide timer state
     *
     * @param int $eventId
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getTimerState($eventId)
    {
        $this->_log->info('Getting timer for event id#' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event id#' . $eventId . ' not found in DB');
        }

        if (!$event[0]->getUseTimer()) {
            $this->_log->info('Timer is not used for event id#' . $eventId);
            return [];
        }

        // default: game finished
        $response = [
            'started' => false,
            'finished' => true,
            'time_remaining' => null,
            'waiting_for_timer' => false,
            'have_autostart' => false,
            'autostart_timer' => 0,
            'hide_seating_after' => 0,
        ];

        if (!$event[0]->getIsFinished()) {
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
            $response['have_autostart'] = ($event[0]->getNextGameStartTime() > 0 && $event[0]->getTimeToStart() > 0);
            $response['autostart_timer'] = $event[0]->getNextGameStartTime() - time();
            // show seating for 10 mins after start
            $response['hide_seating_after'] = ($event[0]->getGameDuration() - 10) * 60;
        }

        $this->_log->info('Successfully got timer data for event id#' . $eventId);

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
        $this->_log->info('Starting timer for event id#' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event id#' . $eventId . ' not found in DB');
        }

        // Check we have rights to register player modify timer for this event
        if (!$this->_meta->isEventAdminById($eventId) && !$this->_meta->isEventRefereeById($eventId)) {
            throw new BadActionException("You don't have enough privileges to modify timer for this event");
        }

        if ($event[0]->getGamesStatus() == EventPrimitive::GS_SEATING_READY) {
            $event[0]->setGamesStatus(EventPrimitive::GS_STARTED);
        }

        $success = $event[0]->setLastTimer(time())->save();
        $this->_log->info('Successfully started timer for event id#' . $eventId);
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
        $this->_log->info('Toggle hide results flag for event id#' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event id#' . $eventId . ' not found in DB');
        }

        // Check we have rights to hide results for this event
        if (!$this->_meta->isEventAdminById($eventId) && !$this->_meta->isEventRefereeById($eventId)) {
            throw new BadActionException("You don't have enough privileges to hide results for this event");
        }

        $success = $event[0]->setHideResults($event[0]->getHideResults() == 1 ? 0 : 1)->save();
        $this->_log->info('Successfully toggle hide results flag for event id#' . $eventId);
        return $success;
    }

    /**
     * Toggle hide achievements page flag
     *
     * @param int $eventId
     * @throws InvalidParametersException
     * @throws \Exception
     * @return bool
     */
    public function toggleHideAchievements($eventId)
    {
        $this->_log->info('Toggle hide achievements flag for event id#' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event id#' . $eventId . ' not found in DB');
        }

        // Check we have rights to hide achievements for this event
        if (!$this->_meta->isEventAdminById($eventId) && !$this->_meta->isEventRefereeById($eventId)) {
            throw new BadActionException("You don't have enough privileges to hide achievements for this event");
        }

        $success = $event[0]->setHideAchievements($event[0]->getHideAchievements() == 1 ? 0 : 1)->save();
        $this->_log->info('Successfully toggle hide achievements flag for event id#' . $eventId);
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
        $this->_log->info('Getting prescripted config for event id#' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event id#' . $eventId . ' not found in DB');
        }

        $config = (new EventModel($this->_ds, $this->_config, $this->_meta))
            ->getPrescriptedConfig($eventId);
        $this->_log->info('Successfully received prescripted config for event id#' . $eventId);
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
        $this->_log->info('Finishing event with id#' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event id#' . $eventId . ' not found in DB');
        }
        $event = $event[0];

        // Check we have rights to update this event
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new BadActionException("You don't have enough privileges to modify this event");
        }

        $success = $event->setIsFinished(1)->save();

        $this->_log->info('Successfully finished event with id#' . $eventId);
        return $success;
    }

    /**
     * Toggle event visibility on mainpage
     *
     * @param int $eventId
     * @return bool
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function toggleListed($eventId)
    {
        $this->_log->info('Toggling listed flag of event with id#' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event id#' . $eventId . ' not found in DB');
        }
        $event = $event[0];

        // Check we have rights to update this event
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new BadActionException("You don't have enough privileges to modify this event");
        }

        $success = $event->setIsListed($event->getIsListed() === 0 ? 1 : 0)->save();

        $this->_log->info('Successfully toggled listed flag of event with id#' . $eventId);
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
        $this->_log->info('Updating prescripted config for event id#' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event id#' . $eventId . ' not found in DB');
        }

        // Check we have rights to modify this event
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new BadActionException("You don't have enough privileges to modify this event");
        }

        $success = (new EventModel($this->_ds, $this->_config, $this->_meta))
            ->updatePrescriptedConfig($eventId, $nextSessionIndex - 1, $prescript);
        $this->_log->info('Successfully updated prescripted config for event id#' . $eventId);
        return $success;
    }

    /**
     * Get available rulesets list
     *
     * @return array
     */
    public function getRulesets()
    {
        $this->_log->info('Receiving rulesets list');
        $list = [
            [
                'id' => 'ema',
                'description' => 'European Mahjong Association rules',
                'originalRules' => \Common\Ruleset::instance('ema')->rules()
            ],
            [
                'id' => 'jpmlA',
                'description' => 'Japanese Professional Mahjong League A rules',
                'originalRules' => \Common\Ruleset::instance('jpmlA')->rules()
            ],
            [
                'id' => 'wrc',
                'description' => 'World Riichi Championship rules',
                'originalRules' => \Common\Ruleset::instance('wrc')->rules()
            ],
            [
                'id' => 'rrc',
                'description' => 'Russian Riichi Community rules',
                'originalRules' => \Common\Ruleset::instance('rrc')->rules()
            ],
            [
                'id' => 'tenhounet',
                'description' => 'Tenhou.net compatible rules',
                'originalRules' => \Common\Ruleset::instance('tenhounet')->rules()
            ]
        ];

        $this->_log->info('Successfully received rulesets');
        return $list;
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
        $this->_log->info('Receiving timezones list');
        $timezoneIdentifiers = \DateTimeZone::listIdentifiers();

        $preferredTimezone = '';
        // Some workarounds for Forseti SPA querying: we don't have server there and can't get current IP.
        if (empty($addr) && !empty($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] !== $_SERVER['SERVER_ADDR']) {
            $addr = $_SERVER['REMOTE_ADDR'];
        }
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

        $this->_log->info('Successfully received timezones');
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
        $this->_log->info('Receiving countries list');
        require_once __DIR__ . '/../../bin/countries.php';
        /** @phpstan-ignore-next-line */
        $countries = getCountriesWithCodes();

        $preferredCountry = '';
        // Some workarounds for Forseti SPA querying: we don't have server there and can't get current IP.
        if (empty($addr) && !empty($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] !== $_SERVER['SERVER_ADDR']) {
            $addr = $_SERVER['REMOTE_ADDR'];
        }
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

        $this->_log->info('Successfully received countries');
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
        $this->_log->info('Rebuilding ratings for event #' . $eventId);
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

        $sessions = SessionPrimitive::findByEventAndStatus($this->_ds, [$eventId], 'finished', 0, null, 'id', 'asc');
        foreach ($sessions as $session) {
            $session->recreateHistory();
        }

        $this->_log->info('Rebuild ratings successful for event #' . $eventId);
        return true;
    }

    /**
     * @param int $eventId
     * @return bool
     * @throws BadActionException
     * @throws InvalidParametersException
     */
    public function initStartingTimer($eventId)
    {
        $this->_log->info('Setting starting timer for event #' . $eventId);
        if (!$this->_meta->isEventAdminById($eventId) && !$this->_meta->isEventRefereeById($eventId)) {
            throw new BadActionException("You don't have enough privileges to init starting timer for this event");
        }

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event id#' . $eventId . ' not found in DB');
        }

        $success = $event[0]->setNextGameStartTime(time() + $event[0]->getTimeToStart())->save();
        if ($success) {
            $this->_log->info('Successfully set starting timer for event #' . $eventId);
        } else {
            $this->_log->info('Failed to set starting timer for event #' . $eventId);
        }

        return $success;
    }

    /**
     * @param int $eventId
     * @return int seconds to start
     * @throws InvalidParametersException
     */
    public function getStartingTimer($eventId)
    {
        $this->_log->info('Getting starting timer for event #' . $eventId);

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new TwirpError(ErrorCode::NotFound, 'Event id#' . $eventId . ' not found in DB');
        }

        $this->_log->info('Successfully got starting timer for event #' . $eventId);
        return $event[0]->getNextGameStartTime() - time();
    }

    /**
     * @param int $eventId
     * @return bool success
     * @throws BadActionException
     */
    public function recalcAchievements($eventId)
    {
        $this->_log->info('Rebuilding achievements for event #' . $eventId);
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new BadActionException("You don't have enough privileges to rebuild achievements for this event");
        }

        $success = JobsQueuePrimitive::scheduleRebuildAchievements($this->_ds, $eventId);

        $this->_log->info('Scheduled rebuild of achievements for event #' . $eventId);
        return $success;
    }

    /**
     * @param int $eventId
     * @return bool success
     * @throws BadActionException
     */
    public function recalcPlayerStats($eventId)
    {
        $this->_log->info('Rebuilding player stats for event #' . $eventId);
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new BadActionException("You don't have enough privileges to rebuild player stats for this event");
        }

        $success = JobsQueuePrimitive::scheduleRebuildPlayerStats($this->_ds, $eventId);

        $this->_log->info('Scheduled rebuild of player stats for event #' . $eventId);
        return $success;
    }

    /**
     * @param int $eventId
     * @return array [\Common\Penalty[], \Common\Player[]]
     * @throws BadActionException
     */
    public function listPenalties($eventId)
    {
        $this->_log->info('Listing penalties for event #' . $eventId);

        if (!$this->_meta->isEventAdminById($eventId) && !$this->_meta->isEventRefereeById($eventId)) {
            throw new BadActionException("You don't have enough privileges to list all penalties for this event");
        }

        $penalties = array_map(function (PenaltyPrimitive $p) {
            $penalty = (new Penalty())
                ->setId($p->getId() ?? 0)
                ->setWho($p->getPlayerId())
                ->setAmount($p->getAmount())
                ->setCreatedAt($p->getCreatedAt())
                ->setAssignedBy($p->getAssignedBy())
                ->setIsCancelled($p->getCancelled() === 1);
            if ($p->getReason()) {
                $penalty->setReason($p->getReason());
            }
            if ($p->getCancelledReason()) {
                $penalty->setCancellationReason($p->getCancelledReason());
            }
            return $penalty;
        }, PenaltyPrimitive::findByEventId($this->_ds, [$eventId]));

        $referees = array_map(function (PlayerPrimitive $p) {
            return (new Player())
                ->setId($p->getId() ?? 0)
                ->setTitle($p->getDisplayName())
                ->setHasAvatar($p->getHasAvatar())
                ->setLastUpdate($p->getLastUpdate())
                ->setTenhouId($p->getTenhouId());
        }, PlayerPrimitive::findById($this->_ds, array_map(function (Penalty $p) {
            return $p->getAssignedBy();
        }, $penalties)));

        $this->_log->info('Listed penalties for event #' . $eventId);

        return [$penalties, $referees];
    }

    /**
     * @param int $penaltyId
     * @param ?string $reason
     * @return bool
     * @throws BadActionException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function cancelPenalty($penaltyId, $reason)
    {
        $this->_log->info('Cancelling penalty #' . $penaltyId);

        $penalty = PenaltyPrimitive::findById($this->_ds, [$penaltyId]);

        if (empty($penalty)) {
            throw new InvalidParametersException('Penalty id#' . $penaltyId . ' not found in DB');
        }

        if (!$this->_meta->isEventAdminById($penalty[0]->getEventId()) &&
            !$this->_meta->isEventRefereeById($penalty[0]->getEventId())
        ) {
            throw new BadActionException("You don't have enough privileges to cancel penalties for this event");
        }

        $success = $penalty[0]
            ->setCancelled(1)
            ->setCancelledReason($reason)
            ->save();

        $skirnir = new SkirnirClient($this->_ds, $this->_config->getStringValue('skirnirUrl'));
        $skirnir->messagePenaltyCancelled(
            $penalty[0]->getPlayerId(),
            $penalty[0]->getEventId(),
            $penalty[0]->getAmount(),
            $penalty[0]->getCancelledReason() ?? ''
        );
        $this->_log->info('Cancelled penalty #' . $penaltyId);
        return $success;
    }

    /**
     * @param int $eventId
     * @return \Common\Penalty[]
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function listMyPenalties($eventId)
    {
        $this->_log->info('Listing player penalties for event #' . $eventId);

        $playerId = $this->_meta->getCurrentPersonId();
        if (empty($playerId)) {
            throw new InvalidParametersException('Can\'t get penalties for unregistered player');
        }

        $penalties = array_map(function (PenaltyPrimitive $p) {
            $penalty = (new Penalty())
                ->setId($p->getId() ?? 0)
                ->setWho($p->getPlayerId())
                ->setAmount($p->getAmount())
                ->setCreatedAt($p->getCreatedAt())
                ->setAssignedBy($p->getAssignedBy())
                ->setIsCancelled($p->getCancelled() === 1);
            if ($p->getReason()) {
                $penalty->setReason($p->getReason());
            }
            if ($p->getCancelledReason()) {
                $penalty->setCancellationReason($p->getCancelledReason());
            }
            return $penalty;
        }, PenaltyPrimitive::findByEventAndPlayer($this->_ds, $eventId, $playerId));

        $this->_log->info('Listed ' . count($penalties) . ' player penalties for event #' . $eventId);

        return $penalties;
    }
}
