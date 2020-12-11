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

require_once __DIR__ . '/../Primitive.php';

/**
 * Class PlayerPrimitive
 *
 * Low-level model with basic CRUD operations and relations
 * @package Mimir
 */
class PlayerHistoryPrimitive extends Primitive
{
    protected static $_table = 'player_history';

    protected static $_fieldsMapping = [
        'id'            => '_id',
        'player_id'     => '_playerId',
        'session_id'    => '_sessionId',
        'event_id'      => '_eventId',
        'rating'        => '_rating',
        'avg_place'     => '_avgPlace',
        'games_played'  => '_gamesPlayed'
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id'           => $this->_integerTransform(true),
            '_rating'       => $this->_floatTransform(),
            '_avgPlace'     => $this->_floatTransform(),
            '_gamesPlayed'  => $this->_integerTransform()
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
    protected $_playerId;
    /**
     * @var PlayerPrimitive
     */
    protected $_player;
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
    protected $_eventId;
    /**
     * @var EventPrimitive
     */
    protected $_event;
    /**
     * @var float
     */
    protected $_rating;
    /**
     * @var float
     */
    protected $_avgPlace;
    /**
     * @var float
     */
    protected $_gamesPlayed;

    /**
     * Find history items by local ids (primary key)
     *
     * @param DataSource $ds
     * @param int[] $ids
     * @throws \Exception
     * @return PlayerHistoryPrimitive[]
     */
    public static function findById(DataSource $ds, $ids)
    {
        return self::_findBy($ds, 'id', $ids);
    }

    /**
     * @param DataSource $ds
     * @param int $eventId
     * @param int $playerId  omit this to get all players histories for event
     * @throws \Exception
     * @return PlayerHistoryPrimitive[]
     */
    public static function findAllByEvent(DataSource $ds, $eventId, $playerId = null)
    {
        // todo: optional pagination and sorting

        if (!$playerId) {
            return self::_findBy($ds, 'event_id', [$eventId]);
        }

        return self::_findBySeveral($ds, [
            'player_id'  => [$playerId],
            'event_id'   => [$eventId]
        ]);
    }

    /**
     * @param DataSource $ds
     * @param int $eventId
     * @param int $playerId  omit this to get list of last results for all players
     * @throws \Exception
     * @return PlayerHistoryPrimitive|PlayerHistoryPrimitive[]
     */
    public static function findLastByEvent(DataSource $ds, $eventId, $playerId = null)
    {
        if (!$playerId) {
            // 1) select ids of latest player history items
            $orm = $ds->table(static::$_table);
            $orm->selectExpr('max(id)', 'mx')
                ->where('event_id', $eventId)
                ->groupBy('player_id');
            $ids = array_map(function ($el) {
                return $el['mx'];
            }, $orm->findArray());

            // 2) return id-indexed search results
            return self::findById($ds, $ids);
        }

        return self::_findBySeveral($ds, [
            'player_id'  => [$playerId],
            'event_id'   => [$eventId]
        ], ['onlyLast' => true]);
    }

    /**
     * @param DataSource $ds
     * @param $playerId
     * @param $sessionId
     * @throws \Exception
     * @return PlayerHistoryPrimitive
     */
    public static function findBySession(DataSource $ds, $playerId, $sessionId)
    {
        return self::_findBySeveral($ds, [
            'player_id'    => [$playerId],
            'session_id'   => [$sessionId]
        ], ['onlyLast' => true]); // should be only one or none, getting last is ok
    }

    /**
     * @return bool|mixed
     * @throws \Exception
     */
    protected function _create()
    {
        $histItem = $this->_ds->table(self::$_table)->create();
        $success = $this->_save($histItem);
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
     * @return int
     */
    public function getId()
    {
        return $this->_id;
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
        if (empty($this->_event)) {
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
     * @param \Mimir\PlayerPrimitive $player
     * @return PlayerHistoryPrimitive
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
        if (empty($this->_player)) {
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
     * For unit tests only! Use makeNewHistoryItem to create instances
     * with new/modified data
     *
     * @param float $rating
     * @return PlayerHistoryPrimitive
     */
    public function _setRating($rating)
    {
        $this->_rating = $rating;
        return $this;
    }

    /**
     * For unit tests only! Use makeNewHistoryItem to create instances
     * with new/modified data
     *
     * @param float $avg
     * @return PlayerHistoryPrimitive
     */
    public function _setAvgPlace($avg)
    {
        $this->_avgPlace = $avg;
        return $this;
    }

    /**
     * For unit tests only! Use makeNewHistoryItem to create instances
     * with new/modified data
     *
     * @param int $cnt
     * @return PlayerHistoryPrimitive
     */
    public function _setGamesPlayed($cnt)
    {
        $this->_gamesPlayed = $cnt;
        return $this;
    }

    /**
     * Create new history item
     *
     * @param DataSource $ds
     * @param PlayerPrimitive $player
     * @param SessionPrimitive $session
     * @param float $ratingDelta
     * @param int $place
     * @throws \Exception
     * @return PlayerHistoryPrimitive
     */
    public static function makeNewHistoryItem(DataSource $ds, PlayerPrimitive $player, SessionPrimitive $session, $ratingDelta, $place)
    {
        $previousItem = self::findLastByEvent($ds, $session->getEventId(), $player->getId());

        if (empty($previousItem)) {
            // This may happen if player has just started to participate in event and has no previous results
            $previousItem = (new self($ds))
                ->setPlayer($player)
                ->setSession($session)
                ->_setGamesPlayed(0)
                ->_setAvgPlace(0)
                ->_setRating($session->getEvent()->getRuleset()->startRating()); // TODO: omg :(
            $previousItem->save();
        }

        return (new self($ds))
            ->setPlayer($player)
            ->setSession($session)
            ->_setAvgPlace($previousItem->getAvgPlace())
            ->_setGamesPlayed($previousItem->getGamesPlayed())
            ->_setRating($previousItem->getRating() + $ratingDelta)
            ->_updateAvgPlaceAndGamesCount($place);
    }

    /* FIXME: change this function to take array of histories as input. */
    /**
     * Create a new history item which is a sum of two other history items.
     *
     * @param PlayerHistoryPrimitive $his1
     * @param PlayerHistoryPrimitive $his2
     * @throws \Exception
     * @return PlayerHistoryPrimitive
     */
    public static function makeHistoryItemsSum(PlayerHistoryPrimitive $his1, PlayerHistoryPrimitive $his2)
    {
        if ($his1->_ds !== $his2->_ds) {
            throw new InvalidParametersException('PlayerHistoryPrimitives should belong to same DB');
        }

        return (new self($his1->_ds))
            ->setPlayer($his1->getPlayer())
            ->setSession($his1->getSession())
            ->_setAvgPlace(($his1->getAvgPlace() * $his1->getGamesPlayed() + $his2->getAvgPlace() * $his2->getGamesPlayed())
                    / ($his1->getGamesPlayed() + $his2->getGamesPlayed()))
            ->_setGamesPlayed($his1->getGamesPlayed() + $his2->getGamesPlayed())
            ->_setRating($his1->getRating() + $his2->getRating());
    }

    /**
     * @return float
     */
    public function getRating()
    {
        return $this->_rating;
    }

    /**
     * @param $place
     * @return PlayerHistoryPrimitive
     */
    protected function _updateAvgPlaceAndGamesCount($place)
    {
        $placesSum = $this->_gamesPlayed * $this->_avgPlace;
        $placesSum += $place;
        $this->_gamesPlayed ++;
        $this->_avgPlace = floatval($placesSum) / floatval($this->_gamesPlayed);
        return $this;
    }

    /**
     * @return float
     */
    public function getAvgPlace()
    {
        return $this->_avgPlace;
    }

    /**
     * @param $startRating
     * @return float
     */
    public function getAvgScore($startRating)
    {
        return ($this->getRating() - $startRating) / $this->getGamesPlayed();
    }

    /**
     * @return float
     */
    public function getGamesPlayed()
    {
        return $this->_gamesPlayed;
    }

    /**
     * @param \Mimir\SessionPrimitive $session
     * @return PlayerHistoryPrimitive
     */
    public function setSession(SessionPrimitive $session)
    {
        $this->_session = $session;
        $this->_sessionId = $session->getId();
        $this->_eventId = $session->getEventId();
        return $this;
    }

    /**
     * @throws EntityNotFoundException
     * @throws \Exception
     * @return \Mimir\SessionPrimitive
     */
    public function getSession()
    {
        if (empty($this->_session)) {
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
}
