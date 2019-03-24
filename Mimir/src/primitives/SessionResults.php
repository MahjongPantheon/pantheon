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

require_once __DIR__ . '/../exceptions/EntityNotFound.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';
require_once __DIR__ . '/../Primitive.php';
require_once __DIR__ . '/../helpers/SessionState.php';

/**
 * Class SessionResultsPrimitive
 *
 * Low-level model with basic CRUD operations and relations
 * @package Mimir
 */
class SessionResultsPrimitive extends Primitive
{
    protected static $_table = 'session_results';

    protected static $_fieldsMapping = [
        'id'                    => '_id',
        'event_id'              => '_eventId',
        'session_id'            => '_sessionId',
        'player_id'             => '_playerId',
        'score'                 => '_score',
        'rating_delta'          => '_ratingDelta',
        'place'                 => '_place'
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_eventId'      => $this->_integerTransform(),
            '_sessionId'    => $this->_integerTransform(),
            '_playerId'     => $this->_integerTransform(),
            '_score'        => $this->_integerTransform(),
            '_ratingDelta'  => $this->_floatTransform(),
            '_id'           => $this->_integerTransform(true)
        ];
    }

    /**
     * Local id
     * @var int
     */
    protected $_id;

    /**
     * @var int
     */
    protected $_eventId;
    /**
     *
     * @var EventPrimitive
     */
    protected $_event;

    /**
     * @var int
     */
    protected $_sessionId;
    /**
     * @var SessionPrimitive
     */
    protected $_session;

    /**
     * @var int
     */
    protected $_playerId;
    /**
     * @var PlayerPrimitive
     */
    protected $_player;

    /**
     * @var int
     */
    protected $_score;

    /**
     * @var float
     */
    protected $_ratingDelta = 0;

    /**
     * @var int
     */
    protected $_place;

    /**
     * Find sessions by local ids (primary key)
     *
     * @param IDb $db
     * @param int[] $ids
     * @throws \Exception
     * @return SessionResultsPrimitive[]
     */
    public static function findById(IDb $db, $ids)
    {
        return self::_findBy($db, 'id', $ids);
    }

    /**
     * Find session results by event id (foreign key search)
     *
     * @param IDb $db
     * @param string[] $eventIds
     * @throws \Exception
     * @return SessionResultsPrimitive[]
     */
    public static function findByEventId(IDb $db, $eventIds)
    {
        return self::_findBy($db, 'event_id', $eventIds);
    }

    /**
     * Find session results by session id (foreign key search)
     *
     * @param IDb $db
     * @param string[] $sessionIds
     * @throws \Exception
     * @return SessionResultsPrimitive[]
     */
    public static function findBySessionId(IDb $db, $sessionIds)
    {
        return self::_findBy($db, 'session_id', $sessionIds);
    }

    /**
     * Find session results by player id (foreign key search)
     *
     * @param IDb $db
     * @param string[] $playerIds
     * @throws \Exception
     * @return SessionResultsPrimitive[]
     */
    public static function findByPlayerId(IDb $db, $playerIds)
    {
        return self::_findBy($db, 'player_id', $playerIds);
    }

    /**
     * Find session results by players and session id
     *
     * @param IDb $db
     * @param $sessionId
     * @param $playerIds
     * @return SessionResultsPrimitive[]
     * @throws \Exception
     */
    public static function findByPlayersAndSession(IDb $db, $sessionId, $playerIds)
    {
        return self::_findBySeveral($db, [
            'player_id' => (array)$playerIds,
            'session_id' => (array)$sessionId
        ]);
    }

    protected function _create()
    {
        $sessionReuslts = $this->_db->table(self::$_table)->create();
        $success = $this->_save($sessionReuslts);
        if ($success) {
            $this->_id = $this->_db->lastInsertId();
        }

        return $success;
    }

    protected function _deident()
    {
        $this->_id = null;
    }

    /**
     * @deprecated
     * @param EventPrimitive $event
     * @throws InvalidParametersException
     */
    public function _setEvent(EventPrimitive $event)
    {
        throw new InvalidParametersException('Event should not be set directly to round. Set session instead!');
    }

    /**
     * @throws EntityNotFoundException
     * @return \Mimir\EventPrimitive
     */
    public function getEvent()
    {
        if (!$this->_event) {
            $this->_event = $this->getSession()->getEvent();
            $this->_eventId = $this->_event->getId();
        }
        return $this->_event;
    }

    /**
     * @return int
     */
    public function getEventId()
    {
        return $this->_eventId;
    }

    /**
     * @param \Mimir\SessionPrimitive $session
     * @return SessionResultsPrimitive
     */
    public function setSession(SessionPrimitive $session)
    {
        $this->_session = $session;
        $this->_sessionId = $session->getId();
        $this->_eventId = $session->getEventId();
        return $this;
    }

    /**
     * @return SessionPrimitive
     * @throws EntityNotFoundException
     */
    public function getSession()
    {
        if (!$this->_session) {
            $foundSessions = SessionPrimitive::findById($this->_db, [$this->_sessionId]);
            if (empty($foundSessions)) {
                throw new EntityNotFoundException("Entity SessionPrimitive with id#" . $this->_sessionId . ' not found in DB');
            }
            $this->_session = $foundSessions[0];
        }
        return $this->_session;
    }

    /**
     * @return int
     */
    public function getSessionId()
    {
        return $this->_sessionId;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * @param \Mimir\PlayerPrimitive $player
     * @return SessionResultsPrimitive
     */
    public function setPlayer(PlayerPrimitive $player)
    {
        $this->_player = $player;
        $this->_playerId = $player->getId();
        return $this;
    }

    /**
     * @throws EntityNotFoundException
     * @return \Mimir\PlayerPrimitive
     */
    public function getPlayer()
    {
        if (!$this->_player) {
            $foundUsers = PlayerPrimitive::findById($this->_frey, [$this->_playerId]);
            if (empty($foundUsers)) {
                throw new EntityNotFoundException("Entity PlayerPrimitive with id#" . $this->_playerId . ' not found in DB');
            }
            $this->_player = $foundUsers[0];
        }
        return $this->_player;
    }

    /**
     * @return int
     */
    public function getPlayerId()
    {
        return $this->_playerId;
    }

    /**
     * @return int
     */
    public function getScore()
    {
        return $this->_score;
    }

    /**
     * @return int
     */
    public function getPlace()
    {
        return $this->_place;
    }

    /**
     * @return float
     */
    public function getRatingDelta()
    {
        return $this->_ratingDelta;
    }

    /**
     * @param Ruleset $rules
     * @param SessionState $results
     * @param int[] $playerIds
     * @return SessionResultsPrimitive
     */
    public function calc(Ruleset $rules, SessionState $results, $playerIds)
    {
        for ($i = 0; $i < count($playerIds); $i++) {
            if ($playerIds[$i] == $this->_playerId) {
                $this->_score = $results->getScores()[$playerIds[$i]];
                break;
            }
        }

        $placesMap = self::calcPlacesMap($results->getScores(), $playerIds);
        $this->_place = $placesMap[$this->_playerId]['place'];

        $this->_ratingDelta = $this->_calcRatingDelta($rules, $results->getScores());

        if (!empty($results->getPenalties()[$this->_playerId])) { // final chombing
            $this->_ratingDelta += (
                $results->getPenalties()[$this->_playerId] / (float)$rules->ratingDivider()
            );
        }

        return $this;
    }

    /**
     * Sort scores while maintaining sequence of equally scored players
     *
     * @param $playersSeq
     * @param $scores
     * @return array
     */
    protected static function _sort($playersSeq, $scores)
    {
        $map = array_combine(
            array_values($playersSeq),
            array_values($scores)
        );

        $result = [];
        while (count($result) < 4) {
            $best = -160000; // this should be less than any possible negative score (e.g. -144000 for triple dealer yakuman)
            $bestId = -1;
            foreach ($map as $id => $score) {
                if ($score > $best && !isset($result[$id])) {
                    $bestId = $id;
                    $best = $score;
                }
            }

            $result[$bestId] = $best;
        }

        return $result;
    }

    /**
     * Calculates player place
     *
     * @param $scoreList
     * @param $originalPlayersSequence
     * @return array
     */
    public static function calcPlacesMap($scoreList, $originalPlayersSequence)
    {
        $playersMap = self::_sort($originalPlayersSequence, $scoreList);

        $i = 1;
        foreach ($playersMap as $k => $v) {
            $playersMap[$k] = [
                'score' => $v,
                'place' => $i++
            ];
        }

        return $playersMap;
    }

    /**
     * Calculates rating change
     *
     * @param Ruleset $rules
     * @param $allScores
     * @return float
     */
    protected function _calcRatingDelta(Ruleset $rules, $allScores)
    {
        $score = ($this->_player->getIsReplacement() && $rules->replacementPlayerFixedPoints() !== false)
            ? $rules->replacementPlayerFixedPoints()
            : $this->_score - ($rules->subtractStartPoints() ? $rules->startPoints() : 0);

        $uma = ($this->_player->getIsReplacement() && $rules->replacementOverrideUma() !== false)
            ? $rules->replacementOverrideUma()
            : $rules->uma($allScores)[$this->_place];

        return (
            $score / (float)$rules->tenboDivider()
            + $rules->oka($this->_place)
            + $uma
        ) / (float)$rules->ratingDivider();
    }
}
