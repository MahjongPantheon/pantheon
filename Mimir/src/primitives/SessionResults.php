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
        'place'                 => '_place',
        'chips'                 => '_chips',
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_eventId'      => $this->_integerTransform(),
            '_sessionId'    => $this->_integerTransform(),
            '_playerId'     => $this->_integerTransform(),
            '_score'        => $this->_integerTransform(),
            '_chips'        => $this->_integerTransform(true),
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
     * @var int
     */
    protected $_chips;

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
     * @param DataSource $ds
     * @param int[] $ids
     * @throws \Exception
     * @return SessionResultsPrimitive[]
     */
    public static function findById(DataSource $ds, $ids)
    {
        return self::_findBy($ds, 'id', $ids);
    }

    /**
     * Find session results by event id (foreign key search)
     *
     * @param DataSource $ds
     * @param string[] $eventIds
     * @throws \Exception
     * @return SessionResultsPrimitive[]
     */
    public static function findByEventId(DataSource $ds, $eventIds)
    {
        return self::_findBy($ds, 'event_id', $eventIds);
    }

    /**
     * Find session results by session id (foreign key search)
     *
     * @param DataSource $ds
     * @param string[] $sessionIds
     * @throws \Exception
     * @return SessionResultsPrimitive[]
     */
    public static function findBySessionId(DataSource $ds, $sessionIds)
    {
        return self::_findBy($ds, 'session_id', $sessionIds);
    }

    /**
     * Find session results by player id (foreign key search)
     *
     * @param DataSource $ds
     * @param string[] $playerIds
     * @throws \Exception
     * @return SessionResultsPrimitive[]
     */
    public static function findByPlayerId(DataSource $ds, $playerIds)
    {
        return self::_findBy($ds, 'player_id', $playerIds);
    }

    /**
     * Find session results by players and session id
     *
     * @param DataSource $ds
     * @param $sessionId
     * @param $playerIds
     * @param int[] $playerIds
     *
     * @return self|self[]
     *
     * @throws \Exception
     *
     * @psalm-return array<array-key, self>|self
     */
    public static function findByPlayersAndSession(DataSource $ds, int $sessionId, array $playerIds)
    {
        return self::_findBySeveral($ds, [
            'player_id' => (array)$playerIds,
            'session_id' => (array)$sessionId
        ]);
    }

    /**
     * @return bool|mixed
     * @throws \Exception
     */
    protected function _create()
    {
        $sessionReuslts = $this->_ds->table(self::$_table)->create();
        $success = $this->_save($sessionReuslts);
        if ($success) {
            $this->_id = $this->_ds->local()->lastInsertId();
        }

        return $success;
    }

    protected function _deident()
    {
        $this->_id = null;
    }

    /**
     * @deprecated 
     *
     * @param EventPrimitive $event
     *
     * @throws InvalidParametersException
     *
     * @return void
     */
    public function _setEvent(EventPrimitive $event): void
    {
        throw new InvalidParametersException('Event should not be set directly to round. Set session instead!');
    }

    /**
     * @throws EntityNotFoundException
     * @throws \Exception
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
     * @throws \Exception
     * @throws EntityNotFoundException
     */
    public function getSession()
    {
        if (!$this->_session) {
            $foundSessions = SessionPrimitive::findById($this->_ds, [$this->_sessionId]);
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
     * @throws \Exception
     * @return \Mimir\PlayerPrimitive
     */
    public function getPlayer()
    {
        if (!$this->_player) {
            $foundUsers = PlayerPrimitive::findById($this->_ds, [$this->_playerId]);
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

    public function setPlace($place)
    {
        $this->_place = $place;
        return $this;
    }

    /**
     * @return int
     */
    public function getChips()
    {
        return $this->_chips;
    }

    public function setChips($chips)
    {
        $this->_chips = $chips;
        return $this;
    }

    /**
     * @return float
     */
    public function getRatingDelta()
    {
        return $this->_ratingDelta;
    }

    public function setRatingDelta($ratingDelta)
    {
        $this->_ratingDelta = $ratingDelta;
        return $this;
    }

    /**
     * @param Ruleset $rules
     * @param SessionState $results
     * @param int[] $playerIds
     * @return SessionResultsPrimitive
     */
    public function calc(Ruleset $rules, SessionState $results, $playerIds)
    {
        $withChips = $rules->chipsValue() > 0;
        if ($withChips) {
            $this->_chips = $results->getChips()[$this->_playerId];
        }

        for ($i = 0; $i < count($playerIds); $i++) {
            if ($playerIds[$i] == $this->_playerId) {
                $this->_score = $results->getScores()[$playerIds[$i]];
                break;
            }
        }

        $placesMap = self::calcPlacesMap($results->getScores(), $playerIds);
        $this->_place = $placesMap[$this->_playerId]['place'];

        $this->_ratingDelta = $this->_calcRatingDelta($rules, $results->getScores());

        if ($withChips) {
            $this->_ratingDelta += $this->_chips * $rules->chipsValue();
        }

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
     * @param int[] $scoreList
     * @param int[] $originalPlayersSequence
     *
     */
    public static function calcPlacesMap(array $scoreList, array $originalPlayersSequence)
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
     * @param int[] $allScores
     *
     */
    protected function _calcRatingDelta(Ruleset $rules, array $allScores)
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
