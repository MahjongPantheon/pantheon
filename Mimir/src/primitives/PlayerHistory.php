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
        'chips'         => '_chips',
        'avg_place'     => '_avgPlace',
        'games_played'  => '_gamesPlayed'
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id'           => $this->_integerTransform(true),
            '_chips'        => $this->_integerTransform(true),
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
     * @var int
     */
    protected $_gamesPlayed;
    /**
     * @var int
     */
    protected $_chips;

    /**
     * Find history items by local ids (primary key)
     *
     * @param IDb $db
     * @param int[] $ids
     * @throws \Exception
     * @return PlayerHistoryPrimitive[]
     */
    public static function findById(IDb $db, $ids)
    {
        return self::_findBy($db, 'id', $ids);
    }

    /**
     * @param IDb $db
     * @param int $eventId
     * @param int $playerId  omit this to get all players histories for event
     * @return PlayerHistoryPrimitive[]
     */
    public static function findAllByEvent(IDb $db, $eventId, $playerId = null)
    {
        // todo: optional pagination and sorting

        if (!$playerId) {
            return self::_findBy($db, 'event_id', [$eventId]);
        }

        return self::_findBySeveral($db, [
            'player_id'  => [$playerId],
            'event_id'   => [$eventId]
        ]);
    }

    /**
     * @param IDb $db
     * @param int $eventId
     * @param int $playerId  omit this to get list of last results for all players
     * @return PlayerHistoryPrimitive|PlayerHistoryPrimitive[]
     */
    public static function findLastByEvent(IDb $db, $eventId, $playerId = null)
    {
        if (!$playerId) {
            // 1) select ids of latest player history items
            $orm = $db->table(static::$_table);
            $orm->selectExpr('max(id)', 'mx')
                ->where('event_id', $eventId)
                ->groupBy('player_id');
            $ids = array_map(function ($el) {
                return $el['mx'];
            }, $orm->findArray());

            // 2) return id-indexed search results
            return self::findById($db, $ids);
        }

        return self::_findBySeveral($db, [
            'player_id'  => [$playerId],
            'event_id'   => [$eventId]
        ], ['onlyLast' => true]);
    }

    /**
     * @param IDb $db
     * @param $playerId
     * @param $sessionId
     * @return PlayerHistoryPrimitive
     */
    public static function findBySessionAndPlayer(IDb $db, $playerId, $sessionId)
    {
        return self::_findBySeveral($db, [
            'player_id'    => [$playerId],
            'session_id'   => [$sessionId]
        ], ['onlyLast' => true]); // should be only one or none, getting last is ok
    }

    /**
     * @param IDb $db
     * @param $sessionId
     * @return PlayerHistoryPrimitive[]
     */
    public static function findBySession(IDb $db, $sessionId)
    {
        return self::_findBySeveral($db, [
            'session_id'   => [$sessionId]
        ]);
    }

    protected function _create()
    {
        $histItem = $this->_db->table(self::$_table)->create();
        $success = $this->_save($histItem);
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
     * @return \Mimir\PlayerPrimitive
     */
    public function getPlayer()
    {
        if (empty($this->_player)) {
            $foundUsers = PlayerPrimitive::findById($this->_db, [$this->_playerId]);
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
     * @param Db $db
     * @param PlayerPrimitive $player
     * @param SessionPrimitive $session
     * @param float $ratingDelta
     * @param int $place
     * @param int $chips
     * @throws InvalidParametersException
     * @return PlayerHistoryPrimitive
     */
    public static function makeNewHistoryItem(Db $db, PlayerPrimitive $player, SessionPrimitive $session, $ratingDelta, $place, $chips = null)
    {
        $previousItem = self::findLastByEvent($db, $session->getEventId(), $player->getId());

        if (empty($previousItem)) {
            // This may happen if player has just started to participate in event and has no previous results
            $previousItem = (new self($db))
                ->setPlayer($player)
                ->setSession($session)
                ->_setGamesPlayed(0)
                ->_setAvgPlace(0)
                ->_setRating($session->getEvent()->getRuleset()->startRating()); // TODO: omg :(

            if ($session->getEvent()->getRuleset()->chipsValue()) {
                $previousItem->setChips(0);
            }

            $previousItem->save();
        }

        $item = (new self($db))
            ->setPlayer($player)
            ->setSession($session)
            ->_setAvgPlace($previousItem->getAvgPlace())
            ->_setGamesPlayed($previousItem->getGamesPlayed())
            ->_setRating($previousItem->getRating() + $ratingDelta)
            ->_updateAvgPlaceAndGamesCount($place);

        if ($session->getEvent()->getRuleset()->chipsValue()) {
            $item->setChips($previousItem->getChips() + $chips);
        }

        return $item;
    }

    /* FIXME: change this function to take array of histories as input. */
    /**
     * Create a new history item which is a sum of two other history items.
     *
     * @param PlayerHistoryPrimitive $his1
     * @param PlayerHistoryPrimitive $his2
     * @return PlayerHistoryPrimitive
     */
    public static function makeHistoryItemsSum(PlayerHistoryPrimitive $his1, PlayerHistoryPrimitive $his2)
    {
        if ($his1->_db !== $his2->_db) {
            throw new InvalidParametersException('PlayerHistoryPrimitives should belong to same DB');
        }

        return (new self($his1->_db))
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
     * @return PlayerHistoryPrimitive
     */
    public function setChips($chips)
    {
        $this->_chips = $chips;
        return $this;
    }

    /**
     * @return int
     */
    public function getChips()
    {
        return $this->_chips;
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
     * @return \Mimir\SessionPrimitive
     */
    public function getSession()
    {
        if (empty($this->_session)) {
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
}
