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
namespace Riichi;

require_once __DIR__ . '/../models/Event.php';
require_once __DIR__ . '/../primitives/PlayerRegistration.php';
require_once __DIR__ . '/../Controller.php';

class EventsController extends Controller
{
    /**
     * @param string $title
     * @param string $description
     * @param string $type either 'online' or 'offline' or 'offline_interactive_tournament'
     * @param string $ruleset one of possible ruleset names ('ema', 'jpmlA', 'tenhounet', or any other supported by system)
     * @param int $gameDuration duration of game in this event in minutes
     * @param string $timezone name of timezone, 'Asia/Irkutsk' for example
     * @throws BadActionException
     * @return int
     */
    public function createEvent($title, $description, $type, $ruleset, $gameDuration, $timezone)
    {
        $this->_log->addInfo('Creating new [' . $type . '] event with [' . $ruleset . '] rules');

        $event = (new EventPrimitive($this->_db))
            ->setTitle($title)
            ->setDescription($description)
            ->setType($type)
            ->setGameDuration($gameDuration)
            ->setTimeZone($timezone)
            ->setRuleset(Ruleset::instance($ruleset))
            // ->setStartTime('')   // TODO
            // ->setEndTime('')     // TODO
        ;
        $success = $event->save();
        if (!$success) {
            throw new BadActionException('Somehow we couldn\'t create event - this should not happen');
        }

        $this->_log->addInfo('Successfully create new event (id# ' . $event->getId() . ')');
        return $event->getId();
    }

    /**
     * Get all players registered for event
     *
     * @param integer $eventId
     * @throws InvalidParametersException
     * @return array
     */
    public function getAllRegisteredPlayers($eventId)
    {
        $this->_log->addInfo('Getting all players for event id# ' . $eventId);

        $players = PlayerRegistrationPrimitive::findRegisteredPlayersByEvent($this->_db, $eventId);
        $data = array_map(function (PlayerPrimitive $p) {
            return [
                'id'            => $p->getId(),
                'display_name'  => $p->getDisplayName(),
                'alias'         => $p->getAlias(),
                'tenhou_id'     => $p->getTenhouId()
            ];
        }, $players);

        $this->_log->addInfo('Successfully received all players for event id# ' . $eventId);
        return $data;
    }

    /**
     * Get all players registered for event
     *
     * @throws InvalidParametersException
     * @return array
     */
    public function getAllRegisteredPlayersFromToken()
    {
        $this->_log->addInfo('Getting all players for event (by token)');
        $data = (new EventModel($this->_db, $this->_config, $this->_meta))->dataFromToken();
        if (empty($data)) {
            throw new InvalidParametersException('Invalid player token', 401);
        }
        return $this->getAllRegisteredPlayers($data->getEventId());
    }

    /**
     * Get tables state in tournament
     *
     * @param integer $eventId
     * @throws InvalidParametersException
     * @return array
     */
    public function getTablesState($eventId)
    {
        $this->_log->addInfo('Getting tables state for event #' . $eventId);
        $data = (new EventModel($this->_db, $this->_config, $this->_meta))
            ->getTablesState($eventId);
        $this->_log->addInfo('Successfully got tables state for event #' . $eventId);
        return $data;
    }

    /**
     * Get tables state in tournament from token
     *
     * @throws InvalidParametersException
     * @return array
     */
    public function getTablesStateFromToken()
    {
        $this->_log->addInfo('Getting tables state for event (by token)');
        $eventModel = new EventModel($this->_db, $this->_config, $this->_meta);

        if ($this->_meta->isGlobalWatcher()) {
            $data = $eventModel->getGlobalTablesState();
        } else {
            $reg = $eventModel->dataFromToken();
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
     * @param integer $eventId
     * @throws InvalidParametersException
     * @return array
     */
    public function getCurrentSeating($eventId)
    {
        $this->_log->addInfo('Getting current seating for event #' . $eventId);
        $data = (new EventModel($this->_db, $this->_config, $this->_meta))
            ->getCurrentSeating($eventId);
        $this->_log->addInfo('Successfully got current seating for event #' . $eventId);
        return $data;
    }

    /**
     * Register for participation in event
     *
     * @param integer $pin
     * @throws InvalidParametersException
     * @return string Auth token
     */
    public function registerPlayer($pin)
    {
        $this->_log->addInfo('Registering pin code #' . $pin);
        $authToken = (new EventModel($this->_db, $this->_config, $this->_meta))
            ->registerPlayerPin($pin);
        $this->_log->addInfo('Successfully registered pin code #' . $pin);
        return $authToken;
    }

    /**
     * Register for participation in event (from admin control panel)
     *
     * @param integer $playerId
     * @param integer $eventId
     * @throws InvalidParametersException
     * @return bool success?
     */
    public function registerPlayerAdmin($playerId, $eventId)
    {
        $this->_log->addInfo('Registering player id# ' . $playerId . ' for event id# ' . $eventId);
        $success = (new EventModel($this->_db, $this->_config, $this->_meta))
            ->registerPlayer($playerId, $eventId);
        $this->_log->addInfo('Successfully registered player id# ' . $playerId . ' for event id# ' . $eventId);
        return $success;
    }

    /**
     * Unregister from participation in event (from admin control panel)
     *
     * @param integer $playerId
     * @param integer $eventId
     * @throws InvalidParametersException
     * @return void
     */
    public function unregisterPlayerAdmin($playerId, $eventId)
    {
        $this->_log->addInfo('Unregistering player id# ' . $playerId . ' for event id# ' . $eventId);
        (new EventModel($this->_db, $this->_config, $this->_meta))->unregisterPlayer($playerId, $eventId);
        $this->_log->addInfo('Successfully unregistered player id# ' . $playerId . ' for event id# ' . $eventId);
    }

    /**
     * @param integer $playerId
     * @param integer $eventId
     * @throws AuthFailedException
     * @throws BadActionException
     * @throws InvalidParametersException
     * @return string Secret pin code for self-registration
     */
    public function enrollPlayer($playerId, $eventId)
    {
        $this->_log->addInfo('Enrolling player id# ' . $playerId . ' for event id# ' . $eventId);
        $pin = (new EventModel($this->_db, $this->_config, $this->_meta))
            ->enrollPlayer($eventId, $playerId);
        $this->_log->addInfo('Successfully enrolled player id# ' . $playerId . ' for event id# ' . $eventId);
        return $pin;
    }

    /**
     * Get all players enrolled for event
     *
     * @param integer $eventId
     * @throws InvalidParametersException
     * @return array
     */
    public function getAllEnrolledPlayers($eventId)
    {
        $this->_log->addInfo('Getting all enrolled players for event id# ' . $eventId);

        $enrolled = PlayerEnrollmentPrimitive::findByEvent($this->_db, $eventId);
        $players = PlayerPrimitive::findById(
            $this->_db,
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
                'alias'         => $p->getAlias(),
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
     * @param integer $eventId
     * @throws InvalidParametersException
     * @return array
     */
    public function getGameConfig($eventId)
    {
        $this->_log->addInfo('Getting config for event id# ' . $eventId);

        $event = EventPrimitive::findById($this->_db, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $rules = $event[0]->getRuleset();
        $data = [
            'allowedYaku'         => array_values($rules->allowedYaku()),
            'startPoints'         => $rules->startPoints(),
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
            'extraChomboPayments' => $rules->extraChomboPayments(),
            'chomboPenalty'       => $rules->chomboPenalty(),
            'withKuitan'          => $rules->withKuitan(),
            'withButtobi'         => $rules->withButtobi(),
            'withMultiYakumans'   => $rules->withMultiYakumans(),
            'gameExpirationTime'  => $rules->gameExpirationTime(),
            'minPenalty'          => $rules->minPenalty(),
            'maxPenalty'          => $rules->maxPenalty(),
            'penaltyStep'         => $rules->penaltyStep(),
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
            'autoSeating'         => (bool)$event[0]->getAutoSeating(),
            'isTextlog'           => (bool)$event[0]->getIsTextlog(),
            'syncStart'           => (bool)$event[0]->getSyncStart(),
            'sortByGames'         => (bool)$event[0]->getSortByGames(),
            'allowPlayerAppend'   => (bool)$event[0]->getAllowPlayerAppend(),
            'withLeadingDealerGameover' => $rules->withLeadingDealerGameOver(),
            'subtractStartPoints' => $rules->subtractStartPoints(),
            'seriesLength'        => $event[0]->getSeriesLength()
        ];

        $this->_log->addInfo('Successfully received config for event id# ' . $eventId);
        return $data;
    }

    /**
     * Get event rules configuration
     *
     * @throws InvalidParametersException
     * @return array
     */
    public function getGameConfigFromToken()
    {
        $this->_log->addInfo('Getting config for event (by token)');
        $data = (new EventModel($this->_db, $this->_config, $this->_meta))->dataFromToken();
        if (empty($data)) {
            throw new InvalidParametersException('Invalid player token', 401);
        }
        return $this->getGameConfig($data->getEventId());
    }

    /**
     * Get rating table for event
     *
     * @param integer $eventId
     * @param string $orderBy either 'name', 'rating', 'avg_place' or 'avg_score'
     * @param string $order either 'asc' or 'desc'
     * @throws InvalidParametersException
     * @return array
     */
    public function getRatingTable($eventId, $orderBy, $order)
    {
        $this->_log->addInfo('Getting rating table for event id# ' . $eventId);

        $event = EventPrimitive::findById($this->_db, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $table = (new EventModel($this->_db, $this->_config, $this->_meta))
            ->getRatingTable($event[0], $orderBy, $order);

        $this->_log->addInfo('Successfully received rating table for event id# ' . $eventId);
        return $table;
    }

    /**
     * Get achievements list for event
     *
     * @param integer $eventId
     * @throws InvalidParametersException
     * @return array
     */
    public function getAchievements($eventId)
    {
        $this->_log->addInfo('Getting achievements list for event id# ' . $eventId);

        $event = EventPrimitive::findById($this->_db, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $table = (new EventModel($this->_db, $this->_config, $this->_meta))->getAchievements($event[0]->getId());

        $this->_log->addInfo('Successfully received achievements list for event id# ' . $eventId);
        return $table;
    }

    /**
     * Get last games for the event
     *
     * @param integer $eventId
     * @param integer $limit
     * @param integer $offset
     * @param string $orderBy either 'id' or 'end_date'
     * @param string $order either 'asc' or 'desc'
     * @throws InvalidParametersException
     * @return array
     */
    public function getLastGames($eventId, $limit, $offset, $orderBy = 'id', $order = 'desc')
    {
        $this->_log->addInfo('Getting games list [' . $limit . '/' . $offset . '] for event id# ' . $eventId);

        $event = EventPrimitive::findById($this->_db, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        if (!in_array($orderBy, ['id', 'end_date']) || !in_array($order, ['asc', 'desc'])) {
            throw new InvalidParametersException('Invalid order attributes');
        }

        $table = (new EventModel($this->_db, $this->_config, $this->_meta))
            ->getLastFinishedGames($event[0], $limit, $offset, $orderBy, $order);

        $this->_log->addInfo('Successfully got games list [' . $limit . '/' . $offset . '] for event id# ' . $eventId);
        return $table;
    }

    /**
     * Get game information
     *
     * @param string $representationalHash
     * @throws InvalidParametersException
     * @return array
     */
    public function getGame($representationalHash)
    {
        $this->_log->addInfo('Getting game for session hash#' . $representationalHash);

        $session = SessionPrimitive::findByRepresentationalHash($this->_db, [$representationalHash]);
        if (empty($session)) {
            throw new InvalidParametersException('Session hash#' . $representationalHash . ' not found in DB');
        }

        $result = (new EventModel($this->_db, $this->_config, $this->_meta))->getFinishedGame($session[0]);

        $this->_log->addInfo('Successfully got game for session hash#' . $representationalHash);
        return $result;
    }

    /**
     * Get games series for each player in event
     *
     * @param integer $eventId
     * @throws InvalidParametersException
     * @return array
     */
    public function getGamesSeries($eventId)
    {
        $this->_log->addInfo('Getting games series for event id# ' . $eventId);

        $event = EventPrimitive::findById($this->_db, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $data = (new EventModel($this->_db, $this->_config, $this->_meta))->getGamesSeries($event[0]);

        $this->_log->addInfo('Successfully got games series for event id# ' . $eventId);
        return $data;
    }

    /**
     * @param integer $eventId
     * @throws InvalidParametersException
     * @return array
     */
    public function getTimerState($eventId)
    {
        $this->_log->addInfo('Getting timer for event id#' . $eventId);

        $event = EventPrimitive::findById($this->_db, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
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

        $this->_log->addInfo('Successfully got timer data for event id#' . $eventId);

        return $response;
    }

    /**
     * @throws InvalidParametersException
     * @return array
     */
    public function getTimerStateFromToken()
    {
        $this->_log->addInfo('Getting timer for event (by token)');
        $data = (new EventModel($this->_db, $this->_config, $this->_meta))->dataFromToken();
        if (empty($data)) {
            throw new InvalidParametersException('Invalid player token', 401);
        }
        return $this->getTimerState($data->getEventId());
    }

    /**
     * @param integer $eventId
     * @throws InvalidParametersException
     * @return bool
     */
    public function startTimer($eventId)
    {
        $this->_log->addInfo('Starting timer for event id#' . $eventId);

        $event = EventPrimitive::findById($this->_db, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $success = $event[0]->setLastTimer(time())->save();
        $this->_log->addInfo('Successfully started timer for event id#' . $eventId);
        return $success;
    }
}
