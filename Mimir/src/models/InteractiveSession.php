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

use Common\IntermediateResultOfSession;
use Common\MultironResult;

require_once __DIR__ . '/../Model.php';
require_once __DIR__ . '/EventUserManagement.php';
require_once __DIR__ . '/../helpers/MultiRound.php';
require_once __DIR__ . '/../helpers/SkirnirClient.php';
require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/Round.php';
require_once __DIR__ . '/../primitives/Session.php';
require_once __DIR__ . '/../primitives/Penalty.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';
require_once __DIR__ . '/../exceptions/AuthFailed.php';
require_once __DIR__ . '/../exceptions/InvalidUser.php';
require_once __DIR__ . '/../exceptions/BadAction.php';
require_once __DIR__ . '/../exceptions/Database.php';

/**
 * Class SessionModel
 *
 * Domain model for high-level logic
 * @package Mimir
 */
class InteractiveSessionModel extends Model
{
    /**
     * @throws InvalidParametersException
     * @throws InvalidUserException
     * @throws DatabaseException
     * @param int $eventId
     * @param int[] $playerIds
     * @param int $tableIndex - Table number in tournament
     * @param string $replayHash
     * @throws \Exception
     * @return string
     */
    public function startGame($eventId, $playerIds, $tableIndex = null, $replayHash = null)
    {
        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        if (!is_array($playerIds)) {
            throw new InvalidParametersException('Players list is not array');
        }

        if ($event[0]->getIsFinished()) {
            throw new InvalidParametersException('Event is already finished');
        }

        $players = PlayerPrimitive::findById($this->_ds, $playerIds);
        $players = array_filter(array_map(function ($id) use (&$players) {
            // Re-sort players to match request order - important!
            foreach ($players as $p) {
                if ($p->getId() == $id) {
                    return $p;
                }
            }
            return null;
        }, $playerIds));

        if (count($players) !== 4) {
            throw new InvalidUserException('Some players do not exist in DB, check ids');
        }

        $event[0]->setNextGameStartTime(0)->save();

        $newSession = new SessionPrimitive($this->_ds);
        $success = $newSession
            ->setEvent($event[0])
            ->setPlayers($players)
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setReplayHash($replayHash)
            ->setTableIndex($tableIndex)
            ->save();
        if (!$success) {
            throw new DatabaseException('Couldn\'t save session data to DB!');
        }

        if ($event[0]->getRulesetConfig()->rules()->getWithYakitori()) {
            $yakitori = [];
            foreach ($playerIds as $id) {
                $yakitori[$id] = true;
            }
            $newSession->getCurrentState()->setYakitori($yakitori);
            $newSession->save();
        }

        $skirnir = new SkirnirClient($this->_ds, $this->_config->getStringValue('skirnirUrl'));
        $skirnir->trackSession($newSession->getRepresentationalHash());
        return $newSession->getRepresentationalHash();
    }

    /**
     * This method is strictly for premature end of session (timeout, etc)
     * Normal end or pre-finish should happen when final round is added.
     *
     * @param string $gameHash
     * @throws \Exception
     * @return bool
     */
    public function endGame(string $gameHash)
    {
        $session = $this->_findGame($gameHash, SessionPrimitive::STATUS_INPROGRESS);
        $this->_checkAuth($session->getPlayersIds());
        $session->scheduleRecalcStats();
        return $session->prefinish();
    }

    /**
     * This method cancels the game entirely. Game should not be finished
     * or prefinished in the moment of cancellation. No other actions are
     * performed when game is cancelled.
     *
     * @param string $gameHash
     * @throws \Exception
     * @return bool
     */
    public function cancelGame(string $gameHash)
    {
        $session = $this->_findGame($gameHash, SessionPrimitive::STATUS_INPROGRESS);
        if (!$this->_meta->isEventAdminById($session->getEventId())) {
            throw new AuthFailedException('Only administrators are allowed to cancel games');
        }
        return $session->setStatus(SessionPrimitive::STATUS_CANCELLED)->save();
    }

    /**
     * Finalize all sessions in event
     *
     * @param int $eventId
     * @throws AuthFailedException
     * @throws \Exception
     * @return int count of finalized sessions
     */
    public function finalizeSessions(int $eventId)
    {
        if (!$this->_meta->isEventAdminById($eventId)) {
            throw new AuthFailedException('Only administrators are allowed to finalize sessions');
        }

        $games = SessionPrimitive::findByEventAndStatus($this->_ds, [$eventId], 'prefinished');
        if (empty($games)) {
            return 0;
        }

        $regs = PlayerRegistrationPrimitive::findByEventId($this->_ds, $eventId);
        $playerMap = [];
        foreach ($regs as $r) {
            $playerMap[$r->getPlayerId()] = $r->getReplacementPlayerId();
        }
        $skirnir = new SkirnirClient($this->_ds, $this->_config->getStringValue('skirnirUrl'));

        (new JobsQueuePrimitive($this->_ds))
            ->setJobName(JobsQueuePrimitive::JOB_ACHIEVEMENTS)
            ->setJobArguments(['eventId' =>  $eventId])
            ->setCreatedAt(date('Y-m-d H:i:s'))
            ->save();

        return array_reduce($games, function ($acc, SessionPrimitive $p) use ($skirnir, $playerMap) {
            $success = $p->finish();
            if ($success) {
                $whoPlays = $p->getPlayersIds();
                foreach ($whoPlays as $k => $v) {
                    if (!empty($playerMap[$v])) {
                        $whoPlays[$k] = $playerMap[$v];
                    }
                }
                $skirnir->messageTournamentSessionEnd($whoPlays, $p->getEventId(), $p->getCurrentState()->getScores());
            }
            return $success ? $acc + 1 : $acc;
        }, 0);
    }

    /**
     * Definalize session in club event
     *
     * @param string $hash
     * @throws AuthFailedException
     * @throws \Exception
     * @return bool Success?
     */
    public function definalizeSession($hash)
    {
        $games = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
        if (empty($games)) {
            return false;
        }

        $session = $games[0];
        if (!$this->_meta->isEventAdminById($session->getEventId())) {
            throw new AuthFailedException('Only administrators are allowed to definalize sessions');
        }
        $sessionId = $session->getId();

        if (!DateHelper::mayDefinalizeGame($session) || empty($sessionId)) {
            throw new BadActionException('Session can not be definalized');
        }

        $playerResults = PlayerHistoryPrimitive::findBySession($this->_ds, $sessionId);
        $sessionResults = SessionResultsPrimitive::findBySessionId($this->_ds, [$sessionId]);
        /** @var Primitive[] $primitives */
        $primitives = array_merge($playerResults, $sessionResults);
        foreach ($primitives as $p) {
            $p->drop();
        }
        $ret = $session
            ->setEndDate('')
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->save();
        $session->scheduleRecalcStats();
        return $ret;
    }

    /**
     * @param string $gameHashcode Hashcode of game
     * @param array $roundData Structure of round data
     * @param boolean $dry Dry run (no save to DB)
     * @throws InvalidParametersException
     * @throws BadActionException
     * @throws AuthFailedException
     * @throws \Exception
     * @return bool|array Success?|Results of dry run
     */
    public function addRound(string $gameHashcode, array $roundData, bool $dry = false)
    {
        $session = $this->_findGame($gameHashcode, SessionPrimitive::STATUS_INPROGRESS);
        $this->_checkAuth($session->getPlayersIds());

        if ($session->getEvent()->getGamesStatus() == EventPrimitive::GS_SEATING_READY) {
            // We should not allow adding new rounds if session is not started yet
            throw new BadActionException('Sessions are ready, but not started yet. You can\'t add new round now');
        }

        // TODO: checks are not atomic
        // check that same game is not passed
        $currentHonba = $session->getCurrentState()->getHonba();
        $currentRound = $session->getCurrentState()->getRound();
        $currentDealer = $session->getCurrentState()->getCurrentDealer();
        $currentRiichi = $session->getCurrentState()->getRiichiBets();
        $currentScores = $session->getCurrentState()->getScores();

        if ($roundData['round_index'] != $currentRound || $roundData['honba'] != $currentHonba) {
            throw new InvalidParametersException('This round is already recorded (or other round index/honba mismatch)');
        }

        $round = RoundPrimitive::createFromData($this->_ds, $session, $roundData);

        if ($dry) {
            /** @var SessionState $clonedStateAfterUpdate */
            list($clonedStateAfterUpdate, $paymentsInfo) = $session->dryRunUpdateCurrentState($round);

            $multiGet = function (RoundPrimitive $p, $method) {
                if ($p instanceof MultiRoundPrimitive) {
                    return array_map(function (RoundPrimitive $inner) use ($method) {
                        return $inner->{$method}();
                    }, $p->rounds());
                }

                return $p->{$method}();
            };

            $scoresBefore = [];
            $scoresDelta = [];
            for ($i = 0; $i < count($session->getPlayersIds()); $i++) {
                $id = $session->getPlayersIds()[$i];
                $scoresBefore[$id] = $currentScores[$id];
                $scoresDelta[$id] = $clonedStateAfterUpdate->getScores()[$id] - $currentScores[$id];
            }

            // Warning! Should match PlayersController::getLastRound return format!
            $result = [
                // Twirp interface compatibility
                'session_hash' => $gameHashcode,
                'scores_before'  => $scoresBefore,
                'scores_delta'   => $scoresDelta,
                'pao_player_id'  => $multiGet($round, 'getPaoPlayerId'),
                'round_index' => $currentRound,
                'winner_id'     => $multiGet($round, 'getWinnerId'),
                'loser_id'     => $round->getLoserId(),
                'open_hand'   => $multiGet($round, 'getOpenHand'),
                'tempai'     => ($round->getOutcome() === 'draw' || $round->getOutcome() === 'nagashi')
                    ? $round->getTempaiIds()
                    : null,
                'nagashi'    => $round->getOutcome() === 'nagashi' ? $round->getNagashiIds() : null,
                'multi_ron'     => $round->getMultiRon(),
                'riichi_bets'   => $round instanceof MultiRoundPrimitive
                    ? implode(',', array_filter(array_map(function (RoundPrimitive $r) {
                        return implode(',', $r->getRiichiIds());
                    }, $round->rounds())))
                    : $round->getRiichiIds(),
                'wins' => $round instanceof MultiRoundPrimitive
                    ? array_map(function (RoundPrimitive $inner) {
                        return [
                            'winner_id' => $inner->getWinnerId(),
                            'pao_player_id' => $inner->getPaoPlayerId(),
                            'han' => $inner->getHan(),
                            'fu' => $inner->getFu(),
                            'yaku' => $inner->getYaku(),
                            'dora' => $inner->getDora(),
                            'kandora' => $inner->getKandora(),
                            'uradora' => $inner->getUradora(),
                            'kanuradora' => $inner->getKanuradora(),
                            'open_hand' => $inner->getOpenHand()
                        ];
                    }, $round->rounds())
                    : [],
                // /Twirp interface compatibility

                'outcome'    => $round->getOutcome(),
                'penaltyFor' => $round->getOutcome() === 'chombo' ? $round->getLoserId() : null,
                'riichiIds'  => $multiGet($round, 'getRiichiIds'),
                'dealer'     => $currentDealer,
                'round'      => $currentRound,
                'riichi'     => $currentRiichi,
                'honba'      => $currentHonba,
                'scores'     => $currentScores, // scores before payments!
                'payments'   => $paymentsInfo,
                'winner'     => $multiGet($round, 'getWinnerId'),
                'paoPlayer'  => $multiGet($round, 'getPaoPlayerId'),
                'yaku'       => $multiGet($round, 'getYaku'),
                'han'        => $multiGet($round, 'getHan'),
                'fu'         => $multiGet($round, 'getFu'),
                'dora'       => $multiGet($round, 'getDora'),
                'kandora'    => $multiGet($round, 'getKandora'),
                'uradora'    => $multiGet($round, 'getUradora'),
                'kanuradora' => $multiGet($round, 'getKanuradora'),
                'openHand'   => $multiGet($round, 'getOpenHand')
            ];

            if (is_array($result['paoPlayer'])) {
                // pao player may be only one
                $paoPlayers = array_filter($result['paoPlayer']);
                $result['paoPlayer'] = reset($paoPlayers);
            }

            return $result;
        }

        $lastScores = $session->getCurrentState()->getScores();
        $success = $round->save();
        if ($success) {
            $data = $session->updateCurrentState($round);
            $currentScores = $session->getCurrentState()->getScores();
            $diff = [];
            foreach ($lastScores as $playerId => $score) {
                $diff[$playerId] = [$score, $currentScores[$playerId]];
            }

            $skirnir = new SkirnirClient($this->_ds, $this->_config->getStringValue('skirnirUrl'));
            $whoPlays = $session->getPlayersIds();
            $playerIds = array_filter(array_map(function ($pr) use ($whoPlays) {
                if ($pr->getIgnoreSeating() || !in_array($pr->getPlayerId(), $whoPlays)) {
                    return null;
                }
                return $pr->getReplacementPlayerId() ?: $pr->getPlayerId();
            }, PlayerRegistrationPrimitive::findByEventId($this->_ds, $session->getEventId())));

            $skirnir->trackSession($session->getRepresentationalHash());
            $skirnir->messageHandRecorded($playerIds, $session->getEventId(), $diff);

            if ($data && $data['_isFinished'] && !$session->getEvent()->getSyncEnd()) {
                (new JobsQueuePrimitive($this->_ds))
                    ->setJobName(JobsQueuePrimitive::JOB_ACHIEVEMENTS)
                    ->setJobArguments(['eventId' =>  $session->getEventId()])
                    ->setCreatedAt(date('Y-m-d H:i:s'))
                    ->save();

                $skirnir->messageClubSessionEnd($playerIds, $session->getEventId(), $currentScores);
            }

            if ($data) {
                return $data;
            }
        }
        return false;
    }

    /**
     * @param int $eventId
     * @param int $playerId
     * @param int $amount
     * @param string $reason
     * @return bool
     * @throws AuthFailedException
     * @throws \Exception
     * @throws InvalidParametersException
     */
    public function addPenalty($eventId, $playerId, $amount, $reason)
    {
        if (!$this->_meta->isEventAdminById($eventId)) {
            // TODO: support referees
            throw new AuthFailedException('Only administrators are allowed to add penalties');
        }

        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException("The event could not be found in the database.");
        }

        if (!$event[0]->getUsePenalty()) {
            throw new InvalidParametersException('This event doesn\'t support adding penalties');
        }

        if (empty(PlayerPrimitive::findById($this->_ds, [$playerId]))) {
            throw new InvalidParametersException("The player could not be found in the database.");
        }

        $item = (new PenaltyPrimitive($this->_ds))
            ->setEventId($eventId)
            ->setPlayerId($playerId)
            ->setCreatedAt(date('Y-m-d H:i:s'))
            ->setAmount($amount)
            ->setReason($reason)
            ->setAssignedBy($this->_meta->getCurrentPersonId());

        // Set session id if penalty occurred during the session
        $session = SessionPrimitive::findLastByPlayerAndEvent($this->_ds, $playerId, $eventId, SessionPrimitive::STATUS_INPROGRESS);
        if (!empty($session)) {
            $item->setSessionId($session->getId());
        }

        $skirnir = new SkirnirClient($this->_ds, $this->_config->getStringValue('skirnirUrl'));
        $skirnir->messagePenaltyApplied($playerId, $eventId, $amount, $reason);

        return $item->save();
    }

    /**
     * @param string $gameHash
     * @param string $withStatus
     * @return SessionPrimitive
     * @throws InvalidParametersException
     * @throws \Exception
     * @throws BadActionException
     */
    protected function _findGame(string $gameHash, string $withStatus)
    {
        $game = SessionPrimitive::findByRepresentationalHash($this->_ds, [$gameHash]);
        if (empty($game)) {
            throw new InvalidParametersException("Couldn't find session in DB");
        }

        if ($game[0]->getStatus() !== $withStatus) {
            throw new BadActionException("This action is not supported over the game in current status");
        }

        return $game[0];
    }

    /**
     * @param int[] $playersIds
     *
     * @throws AuthFailedException
     * @throws \Exception
     *
     * @return void
     */
    protected function _checkAuth(array $playersIds): void
    {
        // Check that real session player is trying to enter data
        if (!in_array($this->_meta->getCurrentPersonId(), $playersIds)) {
            throw new AuthFailedException('Authentication failed! Ask for some assistance from admin team', 403);
        }
    }

    /**
     * Drop last round from session (except if this last round has led to session finish)
     *
     * @param string $gameHash
     * @param IntermediateResultOfSession[] $intermediateResults
     * @throws AuthFailedException
     * @throws \Exception
     * @throws InvalidParametersException
     * @return boolean
     */
    public function dropLastRound(string $gameHash, array $intermediateResults)
    {
        $session = SessionPrimitive::findByRepresentationalHash($this->_ds, [$gameHash]);
        if (empty($session)) {
            throw new InvalidParametersException("Couldn't find session in DB");
        }

        if (!$this->_meta->isEventAdminById($session[0]->getEventId())) {
            throw new AuthFailedException('Only administrators are allowed to drop last round');
        }

        if ($session[0]->getStatus() === SessionPrimitive::STATUS_FINISHED) {
            throw new InvalidParametersException('Session id#' . $session[0]->getId() . ' is already finished. '
                . 'Can\'t alter finished sessions');
        }

        // Check for duplicate cancellations of same round
        $scores = array_combine($session[0]->getPlayersIds(), $session[0]->getCurrentState()->getScores());
        foreach ($intermediateResults as $result) {
            if ($scores[$result->getPlayerId()] !== $result->getScore()) {
                throw new InvalidParametersException('Can\'t cancel round: was it already cancelled by someone else?');
            }
        }

        $id = $session[0]->getId();
        if (empty($id)) {
            throw new InvalidParametersException('Attempted to use deidented primitive');
        }
        $rounds = RoundPrimitive::findBySessionIds($this->_ds, [$id]);
        if (empty($rounds)) {
            throw new InvalidParametersException('No recorded rounds found for session id#' . $session[0]->getId());
        }

        $lastRound = MultiRoundHelper::findLastRound($rounds);
        if (!empty($lastRound)) {
            $session[0]->rollback($lastRound); // this also does session save & drop round
        }
        return true;
    }
}
