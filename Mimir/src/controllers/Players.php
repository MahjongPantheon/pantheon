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
require_once __DIR__ . '/../helpers/MultiRound.php';
require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../models/PlayerStat.php';
require_once __DIR__ . '/../models/EventUserManagement.php';

/**
 * Class PlayersController
 * For user management.
 * Don't do any ACL here - it's expected to be managed by client app.
 *
 * @package Mimir
 */
class PlayersController extends Controller
{
    /**
     * Get player info by id
     * @param int $id
     * @throws EntityNotFoundException
     * @throws \Exception
     * @return array
     */
    public function get($id)
    {
        $this->_log->addInfo('Fetching info of player id #' . $id);
        $player = PlayerPrimitive::findById($this->_ds, [$id]);
        if (empty($player)) {
            throw new EntityNotFoundException('No player with id #' . $id . ' found');
        }

        $this->_log->addInfo('Successfully fetched info of player id #' . $id);
        return [
            'id'            => $player[0]->getId(),
            'display_name'  => $player[0]->getDisplayName(),
            'tenhou_id'     => $player[0]->getTenhouId()
        ];
    }

    /**
     * @param int $playerId player to get stats for
     * @param int[] $eventIdList event to get stats for
     * @throws EntityNotFoundException
     * @throws \Exception
     * @return array of statistics
     */
    public function getStats($playerId, $eventIdList)
    {
        if (!is_array($eventIdList) || empty($eventIdList)) {
            throw new InvalidParametersException('Event id list is not array or array is empty');
        }

        $this->_log->addInfo('Getting stats for player id #' . $playerId . ' at event ids: ' . implode(", ", $eventIdList));

        $eventList = EventPrimitive::findById($this->_ds, $eventIdList);
        if (count($eventList) != count($eventIdList)) {
            throw new InvalidParametersException('Some of events for ids ' . implode(", ", $eventIdList) . ' were not found in DB');
        }

        if (!EventPrimitive::areEventsCompatible($eventList)) {
            throw new InvalidParametersException('Incompatible events: ' . implode(", ", $eventIdList));
        }

        $stats = (new PlayerStatModel($this->_ds, $this->_config, $this->_meta))
            ->getStats($eventIdList, $playerId);

        $this->_log->addInfo('Successfully got stats for player id #' . $playerId . ' at event ids: ' . implode(", ", $eventIdList));

        return $stats;
    }

    /**
     * @param int $playerId
     * @param int $eventId
     * @throws \Exception
     * @return array of session data
     */
    public function getCurrentSessions($playerId, $eventId)
    {
        $this->_log->addInfo('Getting current sessions for player id #' . $playerId . ' at event id #' . $eventId);
        $sessions = SessionPrimitive::findByPlayerAndEvent($this->_ds, $playerId, $eventId, SessionPrimitive::STATUS_INPROGRESS);

        $result = array_map(function (SessionPrimitive $session) {
            return [
                'hashcode'    => $session->getRepresentationalHash(),
                'status'      => $session->getStatus(),
                'table_index' => $session->getTableIndex(),
                'players'     => array_map(function (PlayerPrimitive $p, $score) {
                    return [
                        'id'            => $p->getId(),
                        'display_name'  => $p->getDisplayName(),
                        'score'         => $score
                    ];
                }, $session->getPlayers(), $session->getCurrentState()->getScores())
            ];
        }, $sessions);

        $this->_log->addInfo('Successfully got current sessions for player id #' . $playerId . ' at event id #' . $eventId);
        return $result;
    }

    /**
     * Get last prefinished game results of player in event with syncEnd = true
     *
     * @param int $playerId
     * @param int $eventId
     * @throws EntityNotFoundException
     * @throws \Exception
     * @return array|null
     */
    public function getPrefinishedSessionResults($playerId, $eventId)
    {
        $this->_log->addInfo('Getting prefinished session results for player id #' . $playerId . ' at event id #' . $eventId);

        $session = SessionPrimitive::findLastByPlayerAndEvent($this->_ds, $playerId, $eventId, SessionPrimitive::STATUS_PREFINISHED);
        if (empty($session)) {
            return null;
        }

        $tmpResults = $session->getSessionResults();
        // Warning: don't ever call ->save() on these items!

        /** @var SessionResultsPrimitive[] $sessionResults */
        $sessionResults = [];
        foreach ($tmpResults as $sr) {
            $sessionResults[$sr->getPlayerId()] = $sr;
        }

        $result = array_map(function (PlayerPrimitive $p) use (&$sessionResults) {
            return [
                'id'            => $p->getId(),
                'display_name'  => $p->getDisplayName(),
                'score'         => $sessionResults[$p->getId()]->getScore(),
                'rating_delta'  => $sessionResults[$p->getId()]->getRatingDelta(),
            ];
        }, $session->getPlayers());

        $this->_log->addInfo('Successfully got prefinished session results for player id #' . $playerId . ' at event id #' . $eventId);
        return $result;
    }

    /**
     * Get last game results of player in event
     *
     * @param int $playerId
     * @param int $eventId
     * @throws EntityNotFoundException
     * @throws \Exception
     * @return array|null
     */
    public function getLastResults($playerId, $eventId)
    {
        $this->_log->addInfo('Getting last session results for player id #' . $playerId . ' at event id #' . $eventId);
        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            return null;
        }

        if ($event[0]->getSyncEnd()) {
            $results = $this->getPrefinishedSessionResults($playerId, $eventId);
            if (!empty($results)) {
                return $results;
            }

            // No prefinished games found but syncEnd == true -> continue and show last finished
            // (i.e. games may be already confirmed by admin)
        }

        $session = SessionPrimitive::findLastByPlayerAndEvent($this->_ds, $playerId, $eventId, SessionPrimitive::STATUS_FINISHED);
        if (empty($session)) {
            return null;
        }

        $sId = $session->getId();
        if (empty($sId)) {
            throw new InvalidParametersException('Attempted to use deidented primitive');
        }
        $tmpResults = SessionResultsPrimitive::findByPlayersAndSession($this->_ds, $sId, $session->getPlayersIds());

        /** @var SessionResultsPrimitive[] $sessionResults */
        $sessionResults = [];
        foreach ($tmpResults as $sr) {
            $sessionResults[$sr->getPlayerId()] = $sr;
        }

        $result = array_map(function (PlayerPrimitive $p) use (&$sessionResults) {
            return [
                'id'            => $p->getId(),
                'display_name'  => $p->getDisplayName(),
                'score'         => $sessionResults[$p->getId()]->getScore(),
                'rating_delta'  => $sessionResults[$p->getId()]->getRatingDelta(),
            ];
        }, $session->getPlayers());

        $this->_log->addInfo('Successfully got last session results for player id #' . $playerId . ' at event id #' . $eventId);
        return $result;
    }

    /**
     * Get last recorded round for session by hashcode
     *
     * @param string $hashcode
     * @throws \Exception
     * @return array|null
     */
    public function getLastRoundByHashcode($hashcode)
    {
        $this->_log->addInfo('Getting last round for hashcode ' . $hashcode);
        $session = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hashcode]);
        if (empty($session)) {
            return null;
        }

        $data = $this->_getLastRoundCommon($session[0]);
        $this->_log->addInfo('Successfully got last round for hashcode ' . $hashcode);
        return $data;
    }

    /**
     * Get all active events of current user
     * Output: [[id => ... , title => '...', description => '...'], ...]
     *
     * @throws \Exception
     * @return array
     */
    public function getMyEvents()
    {
        $this->_log->addInfo('Getting all active events for current user');

        if (empty($this->_meta->getCurrentPersonId())) {
            throw new InvalidParametersException('No player logged in', 404);
        }
        $regs = PlayerRegistrationPrimitive::findByPlayerId($this->_ds, $this->_meta->getCurrentPersonId());

        $events = [];
        if (!empty($regs)) {
            $evList = EventPrimitive::findById(
                $this->_ds,
                array_map(function (PlayerRegistrationPrimitive $pr) {
                    return $pr->getEventId();
                }, $regs)
            );
            $events = array_map(function (EventPrimitive $ev) {
                return [
                    'id' => $ev->getId(),
                    'title' => $ev->getTitle(),
                    'description' => $this->_mdTransform($ev->getDescription())
                ];
            }, $evList);
        }

        $this->_log->addInfo('Successfully got all active events for current user');
        return $events;
    }

    /**
     * Get last recorded round with player in event
     *
     * @param int $playerId
     * @param int $eventId
     * @throws \Exception
     * @return array|null
     */
    public function getLastRound($playerId, $eventId)
    {
        $this->_log->addInfo('Getting last round for player id #' . $playerId . ' at event id #' . $eventId);
        $session = SessionPrimitive::findLastByPlayerAndEvent($this->_ds, $playerId, $eventId, SessionPrimitive::STATUS_INPROGRESS);
        if (empty($session)) {
            return null;
        }

        $data = $this->_getLastRoundCommon($session);
        $this->_log->addInfo('Successfully got last round for player id #' . $playerId . ' at event id #' . $eventId);
        return $data;
    }

    /**
     * Common formatting for last round getter
     * @param SessionPrimitive $session
     * @throws \Exception
     * @return array|null
     */
    protected function _getLastRoundCommon(SessionPrimitive $session)
    {
        $sId = $session->getId();
        if (empty($sId)) {
            throw new InvalidParametersException('Attempted to use deidented primitive');
        }
        $rounds = RoundPrimitive::findBySessionIds($this->_ds, [$sId]);
        /** @var MultiRoundPrimitive $lastRound */
        $lastRound = MultiRoundHelper::findLastRound($rounds);

        if (empty($lastRound)) {
            return null;
        }

        $paymentsInfo = $this->_formatLastRound($session, $lastRound);

        $multiGet = function (RoundPrimitive $p, $method) {
            if ($p instanceof MultiRoundPrimitive) {
                return array_map(function (RoundPrimitive $inner) use ($method) {
                    return $inner->{$method}();
                }, $p->rounds());
            }

            return $p->{$method}();
        };

        // Warning: should match InteractiveSessionModel::addRound return format!
        $result = [
            'outcome'    => $lastRound->getOutcome(),
            'penaltyFor' => $lastRound->getOutcome() === 'chombo' ? $lastRound->getLoserId() : null,
            'riichiIds'  => $lastRound->getRiichiIds(),
            'dealer'     => $lastRound->getLastSessionState()->getCurrentDealer(),
            'round'      => $lastRound->getRoundIndex(),
            'riichi'     => $lastRound->getLastSessionState()->getRiichiBets(),
            'honba'      => $lastRound->getLastSessionState()->getHonba(),
            'scores'     => $lastRound->getLastSessionState()->getScores(), // scores before payments!
            'payments'   => $paymentsInfo,
            'winner'     => $multiGet($lastRound, 'getWinnerId'),
            'paoPlayer'  => $multiGet($lastRound, 'getPaoPlayerId'),
            'yaku'       => $multiGet($lastRound, 'getYaku'),
            'han'        => $multiGet($lastRound, 'getHan'),
            'fu'         => $multiGet($lastRound, 'getFu'),
            'dora'       => $multiGet($lastRound, 'getDora'),
            'kandora'    => $multiGet($lastRound, 'getKandora'),
            'uradora'    => $multiGet($lastRound, 'getUradora'),
            'kanuradora' => $multiGet($lastRound, 'getKanuradora'),
            'openHand'   => $multiGet($lastRound, 'getOpenHand')
        ];

        if (is_array($result['paoPlayer'])) {
            $players = array_filter($result['paoPlayer']);
            // pao player may be only one
            $result['paoPlayer'] = (reset($players) or null);
        }

        return $result;
    }


    /**
     * Common formatting for last round getter
     * @param SessionPrimitive $session
     * @throws \Exception
     * @return array|null
     */
    protected function _getAllRoundsCommon(SessionPrimitive $session)
    {
        $rounds = RoundPrimitive::findBySessionIds($this->_ds, [$session->getId()]);

        $multiGet = function (RoundPrimitive $p, $method) {
            if ($p instanceof MultiRoundPrimitive) {
                return array_map(function (RoundPrimitive $inner) use ($method) {
                    return $inner->{$method}();
                }, $p->rounds());
            }

            return $p->{$method}();
        };

        $result = [];
        $currentState = $session -> getCurrentState();
        $index = count($rounds) - 1;
        while ($index > -1) {
            $round = $rounds[$index];
            $lastState = $round->getLastSessionState();

            $scoresBefore = $lastState->getScores();
            $scoresAfter = $currentState->getScores();

            $scoresDelta = [];
            foreach ($scoresBefore as $key => $value) {
                $scoresDelta[$key] = $scoresAfter[$key] - $value;
            }

            // should match RRoundOverviewInfo format
            $roundResult = [
                'outcome'       => $round->getOutcome(),
                'penaltyFor'    => $round->getOutcome() === 'chombo' ? $round->getLoserId() : null,
                'riichiIds'     => $round->getRiichiIds(),
                'dealer'        => $round->getLastSessionState()->getCurrentDealer(),
                'round'         => $round->getRoundIndex(),
                'riichi'        => $lastState->getRiichiBets(),
                'honba'         => $lastState->getHonba(),
                'scores'        => $scoresAfter,
                'scoresDelta'   => $scoresDelta,
                'loser'         => $round->getLoserId(),
                'tempai'        => $multiGet($round, 'getTempaiIds'),
                'winner'        => $multiGet($round, 'getWinnerId'),
                'nagashi'        => $multiGet($round, 'getNagashiIds'),
                'paoPlayer'     => $multiGet($round, 'getPaoPlayerId'),
                'yaku'          => $multiGet($round, 'getYaku'),
                'han'           => $multiGet($round, 'getHan'),
                'fu'            => $multiGet($round, 'getFu'),
                'dora'          => $multiGet($round, 'getDora'),
                'kandora'       => $multiGet($round, 'getKandora'),
                'uradora'       => $multiGet($round, 'getUradora'),
                'kanuradora'    => $multiGet($round, 'getKanuradora'),
                'openHand'      => $multiGet($round, 'getOpenHand'),
            ];
            array_push($result, $roundResult);

            $currentState = $lastState;
            $index--;
        }

        return array_reverse($result);
    }

    /**
     * Get all recorded round for session by hashcode
     *
     * @param string $hashcode
     * @throws \Exception
     * @return array|null
     */
    public function getAllRoundsByHash($hashcode)
    {
        $this->_log->addInfo('Getting last all rounds for hashcode ' . $hashcode);
        $session = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hashcode]);
        if (empty($session)) {
            return null;
        }

        $data = $this->_getAllRoundsCommon($session[0]);
        $this->_log->addInfo('Successfully got last all rounds for hashcode ' . $hashcode);
        return $data;
    }

    /**
     * Calculate payments for given round
     *
     * @param SessionPrimitive $session
     * @param RoundPrimitive $round
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    protected function _formatLastRound(SessionPrimitive $session, RoundPrimitive $round)
    {
        $sessionState = $round->getLastSessionState();

        if ($round instanceof MultiRoundPrimitive) {
            $riichiWinners = PointsCalc::assignRiichiBets(
                $round->rounds(),
                $round->getLoserId(),
                $sessionState->getRiichiBets(),
                $sessionState->getHonba(),
                $round->getSession()
            );

            PointsCalc::resetPaymentsInfo();
            $payments = PointsCalc::lastPaymentsInfo();
            foreach ($round->rounds() as $roundItem) {
                PointsCalc::ron(
                    $session->getEvent()->getRuleset(),
                    $sessionState->getCurrentDealer() == $roundItem->getWinnerId(),
                    $sessionState->getScores(),
                    $roundItem->getWinnerId(),
                    $roundItem->getLoserId(),
                    $roundItem->getHan(),
                    $roundItem->getFu(),
                    $riichiWinners[$roundItem->getWinnerId()]['from_players'],
                    $riichiWinners[$roundItem->getWinnerId()]['honba'],
                    $riichiWinners[$roundItem->getWinnerId()]['from_table'],
                    $roundItem->getPaoPlayerId()
                );
                $payments = array_merge_recursive($payments, PointsCalc::lastPaymentsInfo());
            }

            return $payments;
        }

        PointsCalc::resetPaymentsInfo();
        switch ($round->getOutcome()) {
            case 'ron':
                PointsCalc::ron(
                    $session->getEvent()->getRuleset(),
                    $sessionState->getCurrentDealer() == $round->getWinnerId(),
                    $sessionState->getScores(),
                    $round->getWinnerId(),
                    $round->getLoserId(),
                    $round->getHan(),
                    $round->getFu(),
                    $round->getRiichiIds(),
                    $sessionState->getHonba(),
                    $sessionState->getRiichiBets(),
                    $round->getPaoPlayerId()
                );
                break;
            case 'tsumo':
                PointsCalc::tsumo(
                    $session->getEvent()->getRuleset(),
                    $sessionState->getCurrentDealer(),
                    $sessionState->getScores(),
                    $round->getWinnerId(),
                    $round->getHan(),
                    $round->getFu(),
                    $round->getRiichiIds(),
                    $sessionState->getHonba(),
                    $sessionState->getRiichiBets(),
                    $round->getPaoPlayerId()
                );
                break;
            case 'draw':
                PointsCalc::draw(
                    $sessionState->getScores(),
                    $round->getTempaiIds(),
                    $round->getRiichiIds()
                );
                break;
            case 'abort':
                PointsCalc::abort(
                    $sessionState->getScores(),
                    $round->getRiichiIds()
                );
                break;
            case 'chombo':
                PointsCalc::chombo(
                    $session->getEvent()->getRuleset(),
                    $sessionState->getCurrentDealer(),
                    $round->getLoserId(),
                    $sessionState->getScores()
                );
                break;
            case 'nagashi':
                PointsCalc::nagashi(
                    $sessionState->getScores(),
                    $sessionState->getCurrentDealer(),
                    $round->getRiichiIds(),
                    $round->getNagashiIds()
                );
                break;
        }

        return PointsCalc::lastPaymentsInfo();
    }
}
